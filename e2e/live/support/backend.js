// Helpers for the live suite: talk to the real API directly (setup and
// assertions the UI doesn't expose), and reach into the stack's containers.
import { expect } from '@playwright/test'
import { exec, logs } from './docker'

export const API = process.env.LIVE_API_URL || 'http://localhost:8001'
export const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Password123!'

const containers = {
  app: process.env.LIVE_APP_CONTAINER || 'idolly-e2e-backend',
  worker: process.env.LIVE_WORKER_CONTAINER || 'idolly-e2e-worker',
  db: process.env.LIVE_DB_CONTAINER || 'idolly-e2e-postgres',
  redis: process.env.LIVE_REDIS_CONTAINER || 'idolly-e2e-redis'
}

export const seeded = {
  admin: 'admin@example.com',
  managerNova: 'manager.nova@example.com',
  managerStarlight: 'manager.starlight@example.com'
}

export function uniqueEmail (prefix) {
  return `${prefix}.${Date.now()}${Math.floor(Math.random() * 1000)}@e2e.example.com`
}

// ---------- raw API ----------

export async function api (method, path, { token, json, form } = {}) {
  const headers = {}
  let body
  if (token) headers.authorization = `Bearer ${token}`
  if (json !== undefined) { headers['content-type'] = 'application/json'; body = JSON.stringify(json) }
  if (form) { headers['content-type'] = 'application/x-www-form-urlencoded'; body = new URLSearchParams(form).toString() }
  const response = await fetch(`${API}/${path}`, { method, headers, body })
  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: response.status, data }
}

async function ok (promise, what) {
  const response = await promise
  if (response.status >= 400) throw new Error(`${what}: ${response.status} ${JSON.stringify(response.data)}`)
  return response.data
}

// NB: a login anywhere revokes the account's other sessions (one session
// per account), so do API logins for an account BEFORE its browser login.
export async function apiLogin (email, password = SEED_PASSWORD) {
  const data = await ok(api('POST', 'account/login', { form: { username: email, password, grant_type: 'password' } }), `login ${email}`)
  return data.access_token
}

export async function registerFan (prefix, password = SEED_PASSWORD) {
  const email = uniqueEmail(prefix)
  await ok(api('POST', 'account/register', { json: { name: `E2E ${prefix}`, email, password } }), `register ${email}`)
  return { email, password }
}

export async function addAddress (token) {
  return ok(api('POST', 'shipping_addresses/add', {
    token,
    json: { address_line1: '1-2-3 Jingumae', address_line2: null, city: 'Shibuya', state: 'Tokyo', country: 'Japan', postal_code: '150-0001' }
  }), 'add address')
}

const withTax = price => Math.round(price * 1.1)

// Mock-gateway checkout of one unit of each product; returns the order.
export async function buy (token, addressId, products) {
  for (const product of products) {
    await ok(api('POST', 'cart/add_cart', { token, json: { product_id: product.id, quantity: 1 } }), `add ${product.name}`)
  }
  const amount = products.reduce((sum, product) => sum + withTax(product.price), 0)
  return ok(api('POST', 'order/checkout', {
    token,
    json: { amount, shipping_address_id: addressId, gateway: 'mock', simulate_succ: true, idempotency_key: crypto.randomUUID() }
  }), 'checkout')
}

export async function managerProducts (token) {
  const data = await ok(api('GET', 'products/manager-products-page', { token }), 'manager products')
  return data.products
}

export async function storeProductIds () {
  const data = await ok(api('GET', 'products/store-page'), 'store page')
  return data.products.map(product => product.id)
}

// ---------- containers ----------

// Clears rate-limit counters so tests don't trip each other's per-IP
// limits (all requests come from one IP). Pattern e.g. 'rate:ip:*'.
export async function resetRateLimits (pattern = 'rate:*') {
  await exec(containers.redis, ['sh', '-c', 'redis-cli --scan --pattern "$1" | xargs -r redis-cli del > /dev/null', 'sh', pattern])
}

export async function sql (query) {
  const out = await exec(containers.db, ['sh', '-c', 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA -v ON_ERROR_STOP=1 -c "$1"', 'sh', query])
  return out.trim()
}

// The newest password-reset link emailed to `email` (DEBUG=true logs
// emails instead of sending them; the worker or the API may send it).
export async function latestResetLink (email, { after = 0 } = {}) {
  let link = null
  await expect.poll(async () => {
    const text = (await logs(containers.worker)) + (await logs(containers.app))
    const blocks = text.split('DEV EMAIL (not sent)').filter(block => block.includes(`To: ${email}`))
    const links = blocks.map(block => (block.match(/https?:\/\/[^\s"'<]+\/reset-password\?token=[\w.-]+/) || [])[0]).filter(Boolean)
    link = links.length > after ? links[links.length - 1] : null
    return link
  }, { timeout: 20000, message: `reset email for ${email}` }).not.toBeNull()
  return link
}

// ---------- browser ----------

export async function uiLogin (page, email, password = SEED_PASSWORD) {
  await page.goto('/login')
  await page.locator('#email').fill(email)
  await page.locator('input[autocomplete="current-password"]').fill(password)
  await page.locator('button[type="submit"]').click()
  await expect(page).not.toHaveURL(/\/login/)
}
