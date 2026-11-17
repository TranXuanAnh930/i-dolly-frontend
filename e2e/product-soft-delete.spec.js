// Handover: product-soft-delete.md (backend bug #2).
import { test, expect } from '@playwright/test'
import { mockApi, users, apiError } from './support/mockApi'

const product = (id, name, isActive, extra = {}) => ({
  id,
  name,
  category: 'Merch',
  price: 2500,
  quantity: 10,
  description: `${name} description`,
  image_url: null,
  is_active: isActive,
  ...extra
})

// A tiny stateful backend for the products table: deactivate/reactivate
// flip is_active, and the page's refetch sees the new state.
function productsBackend () {
  const rows = [product('p-1', 'Lightstick', true), product('p-2', 'Old Tote', false)]
  const setActive = (id, value) => { rows.find(row => row.id === id).is_active = value }
  return {
    'GET products/manager-products-page': () => ({ body: { products: rows.map(row => ({ ...row })) } }),
    'DELETE products/delete/*': call => { setActive(call.path.split('/').pop(), false); return { body: { msg: 'deactivated' } } },
    'PATCH products/activate/*': call => { setActive(call.path.split('/').pop(), true); return { body: { msg: 'activated' } } }
  }
}

for (const [role, path] of [['manager', '/manager/products'], ['admin', '/admin/products']]) {
  test.describe(`${role} products page`, () => {
    const row = (page, name) => page.locator('tbody tr', { hasText: name })

    test('shows the active/inactive state with the matching action', async ({ page }) => {
      await mockApi(page, { user: users[role], routes: productsBackend() })
      await page.goto(path)

      await expect(row(page, 'Lightstick')).toContainText('Active')
      await expect(row(page, 'Lightstick').getByRole('button', { name: 'Deactivate' })).toBeVisible()
      await expect(row(page, 'Old Tote')).toContainText('Inactive')
      await expect(row(page, 'Old Tote')).toHaveClass(/is-inactive/)
      await expect(row(page, 'Old Tote').getByRole('button', { name: 'Reactivate' })).toBeVisible()
      // No "delete" wording left.
      await expect(page.getByRole('button', { name: /^delete$/i })).toHaveCount(0)
    })

    test('deactivate confirms what happens, calls DELETE and refreshes the row', async ({ page }) => {
      const api = await mockApi(page, { user: users[role], routes: productsBackend() })
      await page.goto(path)

      let confirmText = ''
      page.once('dialog', dialog => { confirmText = dialog.message(); dialog.accept() })
      await row(page, 'Lightstick').getByRole('button', { name: 'Deactivate' }).click()

      await expect(row(page, 'Lightstick').getByRole('button', { name: 'Reactivate' })).toBeVisible()
      await expect(row(page, 'Lightstick')).toHaveClass(/is-inactive/)
      expect(confirmText).toContain('Deactivate Lightstick?')
      expect(confirmText).toContain('leaves the store and every fan\'s cart')
      expect(confirmText).toContain('Order history is kept')
      expect(api.callsTo('DELETE products/delete/p-1')).toHaveLength(1)
      expect(api.callsTo('DELETE products/delete/p-1')[0].headers.authorization).toMatch(/^Bearer /)
      expect(api.callsTo('GET products/manager-products-page')).toHaveLength(2)
    })

    test('dismissing the confirm does nothing', async ({ page }) => {
      const api = await mockApi(page, { user: users[role], routes: productsBackend() })
      await page.goto(path)
      page.once('dialog', dialog => dialog.dismiss())
      await row(page, 'Lightstick').getByRole('button', { name: 'Deactivate' }).click()
      await expect(row(page, 'Lightstick').getByRole('button', { name: 'Deactivate' })).toBeVisible()
      expect(api.calls.filter(call => call.method === 'DELETE')).toHaveLength(0)
    })

    test('reactivate calls PATCH activate and refreshes the row', async ({ page }) => {
      const api = await mockApi(page, { user: users[role], routes: productsBackend() })
      await page.goto(path)
      await row(page, 'Old Tote').getByRole('button', { name: 'Reactivate' }).click()
      await expect(row(page, 'Old Tote').getByRole('button', { name: 'Deactivate' })).toBeVisible()
      await expect(row(page, 'Old Tote')).not.toHaveClass(/is-inactive/)
      expect(api.callsTo('PATCH products/activate/p-2')).toHaveLength(1)
    })

    test('a 403 on reactivate (another company\'s product) shows the error', async ({ page }) => {
      await mockApi(page, {
        user: users[role],
        routes: {
          ...productsBackend(),
          'PATCH products/activate/*': apiError(403, 'forbidden', 'Not your product'),
          // keep the session's role staff so leaveStaffArea stays put
          'GET profile/me': { body: users[role] }
        }
      })
      await page.goto(path)
      await row(page, 'Old Tote').getByRole('button', { name: 'Reactivate' }).click()
      await expect(row(page, 'Old Tote').getByRole('button', { name: 'Reactivate' })).toBeVisible()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
    })
  })
}

test.describe('product edit form', () => {
  const formPage = {
    body: {
      products: [product('p-1', 'Lightstick', true), product('p-2', 'Old Tote', false)],
      categories: [{ id: 'cat-merch', name: 'Merch' }],
      idols: [],
      groups: [],
      colors: []
    }
  }

  test('notes when the product is deactivated', async ({ page }) => {
    await mockApi(page, { user: users.manager, routes: { 'GET products/manager-product-form-page': formPage } })
    await page.goto('/manager/products/p-2/edit')
    await expect(page.getByText('This product is deactivated, so it isn\'t in the store.')).toBeVisible()
  })

  test('no note for an active product', async ({ page }) => {
    await mockApi(page, { user: users.manager, routes: { 'GET products/manager-product-form-page': formPage } })
    await page.goto('/manager/products/p-1/edit')
    await expect(page.getByRole('heading', { name: 'Edit product' })).toBeVisible()
    await expect(page.locator('input[type="number"]').first()).toHaveValue('2500')
    await expect(page.getByText('This product is deactivated')).toHaveCount(0)
  })

  test('admin form shows the note too', async ({ page }) => {
    await mockApi(page, { user: users.admin, routes: { 'GET products/manager-product-form-page': formPage } })
    await page.goto('/admin/products/p-2/edit')
    await expect(page.getByText('This product is deactivated, so it isn\'t in the store.')).toBeVisible()
  })
})

test.describe('fan-facing', () => {
  const detail = { body: { product: product('p-1', 'Lightstick', true, { genres: [], album: null, artist: null, resale_cap_quantity: null }), recommendations: [] } }

  test('a deactivated product\'s detail URL shows not-found with a link to the store', async ({ page }) => {
    await mockApi(page, { user: users.fan, routes: { 'GET products/p-gone/detail': apiError(404, 'not_found', 'Product not found') } })
    await page.goto('/products/p-gone')
    await expect(page.getByText('Off the Setlist')).toBeVisible()
    await expect(page.locator('.not-found-page a[href="/store"]')).toBeVisible()
  })

  test('Add to cart on a stale page flips to not-found', async ({ page }) => {
    await mockApi(page, {
      user: users.fan,
      routes: {
        'GET products/p-1/detail': detail,
        'POST cart/add_cart': apiError(404, 'not_found', 'Product not found')
      }
    })
    await page.goto('/products/p-1')
    await page.getByRole('button', { name: 'Add to cart' }).click()
    await expect(page.getByText('We couldn\'t find what you were looking for.')).toBeVisible()
    await expect(page.getByText('Off the Setlist')).toBeVisible()
  })

  test('checkout: product_unavailable shows the message, refetches the cart and takes a new key', async ({ page }) => {
    const storeProducts = [product('p-1', 'Lightstick', true), product('p-2', 'Old Tote', true)]
    let cartRows = [
      { id: 'cart-1', product_id: 'p-1', quantity: 1 },
      { id: 'cart-2', product_id: 'p-2', quantity: 1 }
    ]
    let attempts = 0
    const api = await mockApi(page, {
      user: users.fan,
      routes: {
        'GET products/store-page': { body: { products: storeProducts, groups: [] } },
        'GET cart/see_cart': () => ({ body: { items: cartRows } }),
        'GET shipping_addresses/fetch': { body: [{ id: 'addr-1', street: '1-2-3 Shibuya', city: 'Tokyo', state: 'Tokyo', country: 'Japan', postal_code: '150-0002' }] },
        'POST order/checkout': () => {
          attempts += 1
          // p-2 was deactivated just before paying: the backend refuses,
          // and it has also dropped p-2 from the cart.
          cartRows = cartRows.filter(row => row.product_id !== 'p-2')
          return apiError(400, 'product_unavailable', 'Product unavailable')
        }
      }
    })

    await page.goto('/checkout')
    await expect(page.locator('.summary__line')).toHaveCount(2)
    await page.locator('input[autocomplete="cc-number"]').fill('4242 4242 4242 4242')
    await page.locator('input[autocomplete="cc-exp"]').fill('12 / 30')
    await page.locator('input[autocomplete="cc-csc"]').fill('123')
    await page.getByRole('button', { name: /Review order/i }).click()
    await page.getByRole('button', { name: /Place order/i }).click()

    await expect(page.getByText('An item in your cart is no longer available. Review your cart and try again.')).toBeVisible()
    await expect(page.locator('.summary__line')).toHaveCount(1)
    expect(attempts).toBe(1)

    // Confirming again must not reuse the spent idempotency key.
    await page.getByRole('button', { name: /Place order/i }).click()
    await expect.poll(() => api.callsTo('POST order/checkout').length).toBe(2)
    const [first, second] = api.callsTo('POST order/checkout')
    expect(second.body.idempotency_key).not.toBe(first.body.idempotency_key)
  })
})
