// Handover: paypal-cancel-page.md (#12, #27) and paypal-capture-failed.md (#31, #33).
import { test, expect } from '@playwright/test'
import { mockApi, users, apiError } from './support/mockApi'

const pendingOrder = { id: 'o-1', status: 'pending', created_at: '2026-11-10T10:00:00', items: [] }
const cancelledOrder = { ...pendingOrder, status: 'cancelled' }

// The orders store is fetched by the header on boot; the page under test
// must refetch it after the PayPal call so History isn't stale. The PayPal
// call is delayed so the boot fetch has finished first, as it would have
// in real life (the fan spent time on PayPal's site).
function ordersRefetchedAfter (api, key) {
  const [paypalCall] = api.callsTo(key)
  if (!paypalCall || !paypalCall.respondedAt) return false
  return api.callsTo('GET order/fetch_placed_order').some(call => call.at >= paypalCall.respondedAt)
}

test.describe('PayPal cancel page', () => {
  test('cancels the checkout and refreshes History', async ({ page }) => {
    let cancelled = false
    const api = await mockApi(page, {
      user: users.fan,
      routes: {
        'GET order/fetch_placed_order': () => ({ body: [cancelled ? cancelledOrder : pendingOrder] }),
        'POST payment/paypal/cancel/PG-123': () => {
          cancelled = true
          return { delay: 300, body: { status: 'cancelled', order_id: 'o-1', ticket_id: null } }
        }
      }
    })

    await page.goto('/payment/paypal/cancel?token=PG-123')
    await expect(page.getByRole('heading', { name: 'Payment cancelled' })).toBeVisible()
    await expect(page.getByText('nothing was charged and this checkout was cancelled. You can start over at any time.')).toBeVisible()
    await expect.poll(() => api.callsTo('POST payment/paypal/cancel/PG-123').length).toBe(1)
    await expect.poll(() => ordersRefetchedAfter(api, 'POST payment/paypal/cancel/PG-123')).toBe(true)
  })

  test('a 404 (already resolved, e.g. a reload) still shows the page without an error', async ({ page }) => {
    const api = await mockApi(page, {
      user: users.fan,
      routes: { 'POST payment/paypal/cancel/PG-123': apiError(404, 'not_found', 'Payment not found') }
    })
    await page.goto('/payment/paypal/cancel?token=PG-123')
    await expect(page.getByRole('heading', { name: 'Payment cancelled' })).toBeVisible()
    await expect.poll(() => api.callsTo('POST payment/paypal/cancel/PG-123').length).toBe(1)
    await expect(page.getByText('We couldn\'t find what you were looking for.')).toHaveCount(0)
    await expect(page.locator('.toast, [class*="toast"]').filter({ hasText: /not found|couldn't/i })).toHaveCount(0)
  })

  test('without a token it shows the page and calls nothing', async ({ page }) => {
    const api = await mockApi(page, { user: users.fan })
    await page.goto('/payment/paypal/cancel')
    await expect(page.getByRole('heading', { name: 'Payment cancelled' })).toBeVisible()
    expect(api.calls.filter(call => call.path.startsWith('payment/paypal/cancel'))).toHaveLength(0)
  })
})

test.describe('PayPal return page', () => {
  test('a failed capture shows the new note and refreshes History', async ({ page }) => {
    const api = await mockApi(page, {
      user: users.fan,
      routes: {
        'GET order/fetch_placed_order': { body: [pendingOrder] },
        'POST payment/paypal/capture/PG-9': { delay: 300, body: { status: 'failed', order_id: 'o-1', ticket_id: null } }
      }
    })
    await page.goto('/payment/paypal/return?token=PG-9&PayerID=X')
    await expect(page.getByRole('heading', { name: 'Payment couldn\'t be completed' })).toBeVisible()
    await expect(page.getByText('PayPal didn\'t confirm this payment, or the item is no longer available. Nothing was charged.')).toBeVisible()
    await expect.poll(() => ordersRefetchedAfter(api, 'POST payment/paypal/capture/PG-9')).toBe(true)
  })

  test('a successful capture still refreshes History', async ({ page }) => {
    const api = await mockApi(page, {
      user: users.fan,
      routes: {
        'POST payment/paypal/capture/PG-9': { delay: 300, body: { status: 'success', order_id: 'o-1', ticket_id: null } }
      }
    })
    await page.goto('/payment/paypal/return?token=PG-9&PayerID=X')
    await expect(page.getByRole('link', { name: 'View details' })).toBeVisible()
    await expect.poll(() => ordersRefetchedAfter(api, 'POST payment/paypal/capture/PG-9')).toBe(true)
  })
})
