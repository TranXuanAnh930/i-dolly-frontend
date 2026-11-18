// Live: paypal-cancel-page.md and paypal-capture-failed.md against the real
// backend. Approving a payment needs a person on PayPal's site, so a
// successful or failed *capture* can't be driven here; cancelling can.
import { test, expect } from '@playwright/test'
import { api, apiLogin, registerFan, addAddress, managerProducts, uiLogin, resetRateLimits, seeded } from './support/backend'

test.beforeEach(() => resetRateLimits())

test('cancel page with an unknown token: the 404 is treated as already resolved', async ({ page }) => {
  const fan = await registerFan('pp-unknown')
  await uiLogin(page, fan.email, fan.password)
  const cancel = page.waitForResponse(r => r.url().includes('/payment/paypal/cancel/'))
  await page.goto('/payment/paypal/cancel?token=NOT-A-REAL-ORDER')
  expect((await cancel).status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Payment cancelled' })).toBeVisible()
  await expect(page.getByText('this checkout was cancelled')).toBeVisible()
})

test('return page with an unknown token shows the failed state', async ({ page }) => {
  const fan = await registerFan('pp-capture')
  await uiLogin(page, fan.email, fan.password)
  await page.goto('/payment/paypal/return?token=NOT-A-REAL-ORDER&PayerID=X')
  await expect(page.getByRole('heading', { name: 'Payment couldn\'t be completed' })).toBeVisible()
})

test('backing out of a real PayPal sandbox checkout cancels the order', async ({ page }) => {
  const managerToken = await apiLogin(seeded.managerNova)
  const [product] = (await managerProducts(managerToken)).filter(p => p.is_active && p.quantity > 5)
  const fan = await registerFan('pp-cancel')
  const token = await apiLogin(fan.email, fan.password)
  const address = await addAddress(token)
  await api('POST', 'cart/add_cart', { token, json: { product_id: product.id, quantity: 1 } })
  const checkout = await api('POST', 'order/checkout', {
    token,
    json: { amount: Math.round(product.price * 1.1), shipping_address_id: address.id, gateway: 'paypal', idempotency_key: crypto.randomUUID() }
  })
  test.skip(checkout.status >= 500, `PayPal sandbox not reachable/configured (checkout answered ${checkout.status})`)
  expect(checkout.status).toBe(200)
  expect(checkout.data.status).toBe('pending')
  const payment = await api('GET', `payment/status/order/${checkout.data.id}`, { token })
  const pgOrderId = payment.data.pg_order_id
  expect(pgOrderId).toBeTruthy()

  await uiLogin(page, fan.email, fan.password)
  // History has the pending order cached before the fan "goes to PayPal".
  await page.goto('/history')
  const cancel = page.waitForResponse(r => r.url().endsWith(`/payment/paypal/cancel/${pgOrderId}`))
  await page.goto(`/payment/paypal/cancel?token=${pgOrderId}`)
  expect((await cancel).status()).toBe(200)

  const orders = await api('GET', 'order/fetch_placed_order', { token: await apiLogin(fan.email, fan.password) })
  expect(orders.data.find(o => o.id === checkout.data.id).status).toBe('cancelled')
})
