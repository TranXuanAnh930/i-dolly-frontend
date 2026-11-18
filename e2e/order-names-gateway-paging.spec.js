// Backend develop a0fe813: order-item-name-and-gateway-error.md (#34, #36),
// real page totals (#23), and the PayPal return page when the capture
// outcome is unknown (#8, still open on the backend).
import { test, expect } from '@playwright/test'
import { mockApi, users, apiError } from './support/mockApi'

test.describe('order details: item names', () => {
  const order = {
    id: 'o-1',
    status: 'confirmed',
    created_at: '2026-11-10T10:00:00',
    total_price: 5500,
    shippingstatus: null,
    shippingaddress: null,
    items: [
      { product_id: 'p-live', product_name: 'Lightstick', quantity: 1, price: 2750 },
      { product_id: 'p-gone', product_name: 'Old Tote', quantity: 1, price: 2750 }
    ]
  }
  const storeProducts = [{ id: 'p-live', name: 'Lightstick', price: 2500, quantity: 10, category: 'Merch', image_url: null }]

  test('a deactivated product keeps its name, as plain text; an active one links', async ({ page }) => {
    await mockApi(page, {
      user: users.fan,
      routes: {
        'GET products/store-page': { body: { products: storeProducts, groups: [] } },
        'GET order/fetch_placed_order': { body: [order] }
      }
    })
    await page.goto('/history/orders/o-1')
    await expect(page.locator('.line__name')).toHaveText(['Lightstick', 'Old Tote'])
    await expect(page.getByText('Unknown product')).toHaveCount(0)
    await expect(page.locator('a.line[href="/products/p-live"]')).toHaveCount(1)
    await expect(page.locator('a.line[href="/products/p-gone"]')).toHaveCount(0)
  })

  test('falls back to the catalog name when the item has none (older backend)', async ({ page }) => {
    const legacy = { ...order, items: order.items.map(({ product_name: _, ...item }) => item) }
    await mockApi(page, {
      user: users.fan,
      routes: {
        'GET products/store-page': { body: { products: storeProducts, groups: [] } },
        'GET order/fetch_placed_order': { body: [legacy] }
      }
    })
    await page.goto('/history/orders/o-1')
    await expect(page.locator('.line__name')).toHaveText(['Lightstick', 'Unknown product'])
  })
})

test('checkout: PayPal down (502) shows its own message and keeps the cart', async ({ page }) => {
  const api = await mockApi(page, {
    user: users.fan,
    routes: {
      'GET products/store-page': { body: { products: [{ id: 'p-1', name: 'Lightstick', price: 2500, quantity: 10, category: 'Merch', image_url: null, is_active: true }], groups: [] } },
      'GET cart/see_cart': { body: { items: [{ id: 'cart-1', product_id: 'p-1', quantity: 1 }] } },
      'GET shipping_addresses/fetch': { body: [{ id: 'addr-1', street: '1-2-3 Shibuya', city: 'Tokyo', state: 'Tokyo', country: 'Japan', postal_code: '150-0002' }] },
      'POST order/checkout': apiError(502, 'payment_gateway_unavailable', 'The payment gateway is not responding. Please try again.')
    }
  })
  await page.goto('/checkout')
  await page.locator('input[name="gateway"][value="paypal"]').check()
  await page.getByRole('button', { name: /Review order/i }).click()
  await page.getByRole('button', { name: /Place order/i }).click()

  await expect(page.getByText('PayPal isn\'t responding right now. Nothing was charged or reserved; please try again.')).toBeVisible()
  await expect(page.getByText('Something went wrong. Please try again.')).toHaveCount(0)
  await expect(page.locator('.summary__line')).toHaveCount(1)

  // Nothing was created, so the retry may reuse the same key.
  await page.getByRole('button', { name: /Place order/i }).click()
  await expect.poll(() => api.callsTo('POST order/checkout').length).toBe(2)
})

test.describe('manager orders: real page totals', () => {
  const orders = n => Array.from({ length: n }, (_, i) => ({
    id: `o-${i}`,
    created_at: '2026-11-10T10:00:00',
    buyer_name: `Buyer ${i}`,
    buyer_email: `buyer${i}@example.com`,
    items: [{ product_id: `p-${i}`, product_name: `Album ${i}`, quantity: 1 }],
    company_total: 3000,
    status: 'confirmed',
    shippingstatus: { status: 'shipped' }
  }))

  test('an exactly-full last page has no Next, and the label shows the total', async ({ page }) => {
    await mockApi(page, {
      user: users.manager,
      routes: {
        'GET order/manager-orders-page': call => ({
          body: { page: Number(call.query.page), limit: 10, count: 20, data: orders(10) }
        })
      }
    })
    await page.goto('/manager/orders')
    await expect(page.getByText('Page 1 of 2')).toBeVisible()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('Page 2 of 2')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  test('without a count it falls back to "a full page may have a next"', async ({ page }) => {
    await mockApi(page, {
      user: users.manager,
      routes: { 'GET order/manager-orders-page': { body: { data: orders(10) } } }
    })
    await page.goto('/manager/orders')
    await expect(page.getByText('Page 1', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled()
  })
})

test.describe('PayPal return page: unknown capture outcome', () => {
  for (const [label, response] of [
    ['a 500', apiError(500, 'internal_error', 'Internal Server Error')],
    ['no response', { abort: true }]
  ]) {
    test(`${label} doesn't claim nothing was charged, and refreshes History`, async ({ page }) => {
      const api = await mockApi(page, {
        user: users.fan,
        routes: { 'POST payment/paypal/capture/PG-9': response }
      })
      await page.goto('/payment/paypal/return?token=PG-9&PayerID=X')
      await expect(page.getByRole('heading', { name: 'We couldn\'t confirm your payment' })).toBeVisible()
      await expect(page.getByText('Check History before trying again.')).toBeVisible()
      await expect(page.getByText('Nothing was charged.')).toHaveCount(0)
      await expect(page.locator('.confirmation__link[href="/history"]')).toBeVisible()
      await expect.poll(() => api.callsTo('GET order/fetch_placed_order').length).toBeGreaterThan(1)
      await expect.poll(() => api.callsTo('GET tickets/mine').length).toBeGreaterThan(1)
    })
  }

  test('a 404 is still a definite failure', async ({ page }) => {
    await mockApi(page, {
      user: users.fan,
      routes: { 'POST payment/paypal/capture/PG-9': apiError(404, 'not_found', 'Payment not found') }
    })
    await page.goto('/payment/paypal/return?token=PG-9&PayerID=X')
    await expect(page.getByRole('heading', { name: 'Payment couldn\'t be completed' })).toBeVisible()
  })
})
