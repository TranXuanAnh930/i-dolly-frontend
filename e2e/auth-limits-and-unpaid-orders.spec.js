// Handover: auth-limits-and-unpaid-orders.md (backend bugs #7, #26, #14).
import { test, expect } from '@playwright/test'
import { mockApi, users, apiError } from './support/mockApi'

async function submitLogin (page, email = 'fan@example.com', password = 'whatever') {
  await page.locator('#email').fill(email)
  await page.locator('input[autocomplete="current-password"]').fill(password)
  await page.locator('button[type="submit"]').click()
}

test.describe('login: per-email limit', () => {
  test('shows the lockout message with a reset link, no countdown, no red fields', async ({ page }) => {
    await mockApi(page, {
      routes: { 'POST account/login': apiError(429, 'too_many_login_attempts', 'Too many failed login attempts') }
    })
    await page.goto('/login')
    await submitLogin(page)

    const error = page.locator('.form-error')
    await expect(error).toContainText('Too many failed login attempts for this email. Try again in 15 minutes, or reset your password.')
    await expect(error.getByRole('link', { name: 'Reset your password' })).toHaveAttribute('href', '/forgot-password')
    await expect(page.locator('.field__control--error')).toHaveCount(0)
    await expect(page.locator('button[type="submit"]')).toBeEnabled()
    await expect(error).not.toContainText(/Try again in \d+ s/)

    // A different email has its own count: editing clears the message.
    await page.locator('#email').fill('other@example.com')
    await expect(error).toHaveCount(0)
  })

  test('shows the Japanese message', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('i-dolly-locale', 'ja'))
    await mockApi(page, {
      routes: { 'POST account/login': apiError(429, 'too_many_login_attempts') }
    })
    await page.goto('/login')
    await submitLogin(page)
    await expect(page.locator('.form-error')).toContainText('このメールアドレスでのログイン失敗が多すぎます。')
    await expect(page.locator('.form-error').getByRole('link', { name: 'パスワードを再設定する' })).toBeVisible()
  })

  test('per-IP rate limit still counts down and blocks submit', async ({ page }) => {
    await mockApi(page, {
      routes: { 'POST account/login': apiError(429, 'rate_limited', 'Too many requests. Please try again after 30 seconds.') }
    })
    await page.goto('/login')
    await submitLogin(page)
    await expect(page.locator('.form-error')).toContainText(/Too many attempts\. Try again in (30|29) s\./)
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
    await expect(page.locator('.form-error').getByRole('link')).toHaveCount(0)
  })

  test('wrong credentials still turn the fields red', async ({ page }) => {
    await mockApi(page, {
      routes: { 'POST account/login': apiError(401, 'invalid_credentials', 'Incorrect email or password') }
    })
    await page.goto('/login')
    await submitLogin(page)
    await expect(page.locator('.field__control--error')).toHaveCount(2)
    await expect(page.locator('.form-error').getByRole('link')).toHaveCount(0)
  })
})

test('forgot password: per-email limit shows its own message', async ({ page }) => {
  await mockApi(page, {
    routes: { 'POST profile/forgot-password': apiError(429, 'too_many_reset_requests', 'Too many reset requests') }
  })
  await page.goto('/forgot-password')
  await page.locator('#email').fill('fan@example.com')
  await page.locator('button[type="submit"]').click()
  await expect(page.getByText('Too many reset requests for this email. Try again in an hour, and check your inbox for a link already sent.')).toBeVisible()
})

test.describe('manager orders: Ship only for paid orders', () => {
  const order = (id, status, shipping, buyer) => ({
    id,
    created_at: '2026-11-10T10:00:00',
    buyer_name: buyer,
    buyer_email: `${buyer.toLowerCase()}@example.com`,
    items: [{ product_id: `p-${id}`, product_name: `Album ${id}`, quantity: 1 }],
    company_total: 3000,
    status,
    shippingstatus: { status: shipping }
  })
  const orders = [
    order('o-paid-pending', 'confirmed', 'pending', 'Paid'),
    order('o-paid-processing', 'confirmed', 'processing', 'Processing'),
    order('o-unpaid', 'pending', 'pending', 'Unpaid'),
    order('o-cancelled', 'cancelled', 'cancelled', 'Cancelled')
  ]
  // Exact match on the email: 'paid@…' is a substring of 'unpaid@…'.
  const row = (page, buyer) => page.locator('tbody tr').filter({ has: page.getByText(`${buyer.toLowerCase()}@example.com`, { exact: true }) })

  test('Ship shows on confirmed orders only, and unpaid ones read "Awaiting payment"', async ({ page }) => {
    await mockApi(page, {
      user: users.manager,
      routes: { 'GET order/manager-orders-page': { body: { data: orders } } }
    })
    await page.goto('/manager/orders')

    await expect(row(page, 'Paid').getByRole('button', { name: 'Ship' })).toBeVisible()
    await expect(row(page, 'Processing').getByRole('button', { name: 'Ship' })).toBeVisible()
    await expect(row(page, 'Unpaid').getByRole('button', { name: 'Ship' })).toHaveCount(0)
    await expect(row(page, 'Cancelled').getByRole('button', { name: 'Ship' })).toHaveCount(0)
    await expect(row(page, 'Unpaid')).toContainText('Awaiting payment')
    // No screen offers "cancel order" (#14).
    await expect(page.getByRole('button', { name: /cancel order/i })).toHaveCount(0)
  })

  test('shipping a paid order still works', async ({ page }) => {
    const api = await mockApi(page, {
      user: users.manager,
      routes: {
        'GET order/manager-orders-page': { body: { data: orders } },
        'PATCH order/o-paid-pending/ship': { body: { ...orders[0], shippingstatus: { status: 'shipped' } } }
      }
    })
    await page.goto('/manager/orders')
    page.once('dialog', dialog => dialog.accept())
    await row(page, 'Paid').getByRole('button', { name: 'Ship' }).click()
    await expect(page.getByText('Order marked as shipped.')).toBeVisible()
    await expect(row(page, 'Paid')).toContainText('Shipped')
    expect(api.callsTo('PATCH order/o-paid-pending/ship')).toHaveLength(1)
  })

  test('a stale row refused with order_not_paid shows a toast and stays unchanged', async ({ page }) => {
    await mockApi(page, {
      user: users.manager,
      routes: {
        'GET order/manager-orders-page': { body: { data: orders } },
        'PATCH order/o-paid-pending/ship': apiError(400, 'order_not_paid', 'Order is not paid')
      }
    })
    await page.goto('/manager/orders')
    page.once('dialog', dialog => dialog.accept())
    await row(page, 'Paid').getByRole('button', { name: 'Ship' }).click()
    await expect(page.getByText('This order hasn\'t been paid, so it can\'t be shipped.')).toBeVisible()
    await expect(row(page, 'Paid')).not.toContainText('Shipped')
    await expect(row(page, 'Paid').getByRole('button', { name: 'Ship' })).toBeVisible()
  })
})
