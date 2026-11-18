// Live: auth-limits-and-unpaid-orders.md against the real backend.
import { test, expect } from '@playwright/test'
import {
  registerFan, apiLogin, addAddress, buy, managerProducts, sql, uiLogin,
  resetRateLimits, uniqueEmail, seeded
} from './support/backend'

test.beforeEach(() => resetRateLimits())

async function attemptLogin (page, email, password) {
  await page.locator('#email').fill(email)
  await page.locator('input[autocomplete="current-password"]').fill(password)
  const response = page.waitForResponse(r => r.url().endsWith('/account/login'))
  await page.locator('button[type="submit"]').click()
  return (await response).status()
}

test.describe('login per-email limit', () => {
  test('5 wrong passwords lock the email: message + reset link, no countdown, no red fields', async ({ page }) => {
    const fan = await registerFan('lockout')
    await page.goto('/login')
    for (let i = 0; i < 5; i++) expect(await attemptLogin(page, fan.email, 'wrong-password')).toBe(401)

    expect(await attemptLogin(page, fan.email, 'wrong-password')).toBe(429)
    const error = page.locator('.form-error')
    await expect(error).toContainText('Too many failed login attempts for this email. Try again in 15 minutes, or reset your password.')
    await expect(error.getByRole('link', { name: 'Reset your password' })).toHaveAttribute('href', '/forgot-password')
    await expect(page.locator('.field__control--error')).toHaveCount(0)
    await expect(page.locator('button[type="submit"]')).toBeEnabled()

    // Even the correct password is refused while locked.
    expect(await attemptLogin(page, fan.email, fan.password)).toBe(429)
    await expect(error).toContainText('Too many failed login attempts for this email.')

    // Another email still logs in from the same browser.
    const other = await registerFan('lockout-other')
    await page.locator('#email').fill(other.email)
    await expect(error).toHaveCount(0)
    await attemptLogin(page, other.email, other.password)
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('the per-IP limit still counts down', async ({ page }) => {
    await page.goto('/login')
    let status = 0
    for (let i = 0; i < 11 && status !== 429; i++) status = await attemptLogin(page, uniqueEmail('nobody'), 'wrong-password')
    expect(status).toBe(429)
    await expect(page.locator('.form-error')).toContainText(/Too many attempts\. Try again in \d+ s\./)
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })
})

test('forgot password: the 4th request for one email shows the per-email message', async ({ page }) => {
  const email = uniqueEmail('reset-limit')
  // No clearing between requests (beforeEach already starts from zero): the
  // per-IP limit is 8/minute (backend bugs.md #35), above the per-email
  // 3/hour, so a 4th request from one network reaches the per-email message
  // on its own.
  for (let i = 0; i < 3; i++) {
    await page.goto('/forgot-password')
    await page.locator('#email').fill(email)
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('.form-error')).toHaveCount(0)
  }
  await page.goto('/forgot-password')
  await page.locator('#email').fill(email)
  await page.locator('button[type="submit"]').click()
  await expect(page.getByText('Too many reset requests for this email. Try again in an hour, and check your inbox for a link already sent.')).toBeVisible()
})

test.describe('manager orders: Ship only for paid orders', () => {
  test('confirmed orders ship; an unpaid one shows "Awaiting payment" and no Ship; a stale row is refused', async ({ page }) => {
    // Three real orders from a fresh fan, one product each, so each row is
    // identifiable by product name.
    const managerToken = await apiLogin(seeded.managerNova)
    const products = (await managerProducts(managerToken))
      .filter(p => p.is_active && p.quantity > 5)
      .slice(0, 3)
    expect(products).toHaveLength(3)
    const [paid, unpaid, stale] = products

    const fan = await registerFan('orders')
    const fanToken = await apiLogin(fan.email, fan.password)
    const address = await addAddress(fanToken)
    const orders = {}
    for (const product of products) orders[product.id] = await buy(fanToken, address.id, [product])
    expect(Object.values(orders).every(order => order.status === 'confirmed')).toBe(true)

    // An abandoned PayPal checkout: order still pending, shipping pending.
    await sql(`UPDATE orders SET status = 'pending' WHERE id = '${orders[unpaid.id].id}'`)

    await uiLogin(page, seeded.managerNova)
    await page.goto('/manager/orders')
    const row = product => page.locator('tbody tr').filter({ hasText: fan.email }).filter({ hasText: product.name })

    await expect(row(paid).getByRole('button', { name: 'Ship' })).toBeVisible()
    await expect(row(stale).getByRole('button', { name: 'Ship' })).toBeVisible()
    await expect(row(unpaid).getByRole('button', { name: 'Ship' })).toHaveCount(0)
    await expect(row(unpaid)).toContainText('Awaiting payment')

    page.once('dialog', dialog => dialog.accept())
    await row(paid).getByRole('button', { name: 'Ship' }).click()
    await expect(page.getByText('Order marked as shipped.')).toBeVisible()
    await expect(row(paid)).toContainText('Shipped')

    // The list is now stale: the order became unpaid after it loaded.
    await sql(`UPDATE orders SET status = 'pending' WHERE id = '${orders[stale.id].id}'`)
    page.once('dialog', dialog => dialog.accept())
    await row(stale).getByRole('button', { name: 'Ship' }).click()
    await expect(page.getByText('This order hasn\'t been paid, so it can\'t be shipped.')).toBeVisible()
    await expect(row(stale)).not.toContainText('Shipped')
  })
})
