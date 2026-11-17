// Live: product-soft-delete.md against the real backend.
import { test, expect } from '@playwright/test'
import {
  api, apiLogin, registerFan, addAddress, buy, managerProducts, storeProductIds,
  uiLogin, resetRateLimits, seeded
} from './support/backend'

test.beforeEach(() => resetRateLimits())

test('deactivate → gone from the store, carts and detail; history kept; reactivate → back', async ({ browser }) => {
  const managerToken = await apiLogin(seeded.managerStarlight)
  const [product, other] = (await managerProducts(managerToken)).filter(p => p.is_active && p.quantity > 5)
  expect(product && other).toBeTruthy()

  // A fan who already bought it once and has it in their cart again.
  const fan = await registerFan('soft-delete')
  const fanToken = await apiLogin(fan.email, fan.password)
  const address = await addAddress(fanToken)
  const order = await buy(fanToken, address.id, [product])
  await api('POST', 'cart/add_cart', { token: fanToken, json: { product_id: product.id, quantity: 1 } })
  await api('POST', 'cart/add_cart', { token: fanToken, json: { product_id: other.id, quantity: 1 } })

  const managerContext = await browser.newContext()
  const manager = await managerContext.newPage()
  try {
    await uiLogin(manager, seeded.managerStarlight)
    await manager.goto('/manager/products')
    const row = manager.locator('tbody tr').filter({ hasText: product.name })
    await expect(row).toContainText('Active')

    let confirmText = ''
    manager.once('dialog', dialog => { confirmText = dialog.message(); dialog.accept() })
    await row.getByRole('button', { name: 'Deactivate' }).click()
    await expect(row.getByRole('button', { name: 'Reactivate' })).toBeVisible()
    await expect(row).toHaveClass(/is-inactive/)
    await expect(row).toContainText('Inactive')
    expect(confirmText).toContain('Order history is kept')

    // Backend state the page claims.
    expect(await storeProductIds()).not.toContain(product.id)
    expect((await api('GET', `products/${product.id}/detail`)).status).toBe(404)

    // The edit form still opens, with the inactive note.
    await manager.goto(`/manager/products/${product.id}/edit`)
    await expect(manager.getByText('This product is deactivated, so it isn\'t in the store.')).toBeVisible()

    // Fan side.
    const fanContext = await browser.newContext()
    const fanPage = await fanContext.newPage()
    await uiLogin(fanPage, fan.email, fan.password)
    await fanPage.goto(`/products/${product.id}`)
    await expect(fanPage.getByText('Off the Setlist')).toBeVisible()
    await fanPage.goto('/cart')
    await expect(fanPage.getByText(other.name)).toBeVisible()
    await expect(fanPage.getByText(product.name)).toHaveCount(0)
    // The past order keeps the line and its price. Its NAME can't be shown
    // yet: the fan's order API returns only product_id/quantity/price and
    // the page resolves names from the store catalog, which no longer has
    // the product — tracked as a backend gap (see e2e/live/README.md).
    await fanPage.goto(`/history/orders/${order.id}`)
    await expect(fanPage.locator('.line')).toHaveCount(1)
    // Order lines store the tax-included unit price.
    await expect(fanPage.locator('.line')).toContainText(Math.round(product.price * 1.1).toLocaleString('en-US'))
    const shownName = await fanPage.locator('.line__name').innerText()
    test.info().annotations.push({ type: 'known-gap', description: `order line shows "${shownName}" instead of "${product.name}"` })
    console.log(`[known-gap] deactivated product's order line shows "${shownName}" instead of "${product.name}"`)
    await fanContext.close()

    // Admin sees the same state, with no "Delete" left.
    const adminContext = await browser.newContext()
    const admin = await adminContext.newPage()
    await uiLogin(admin, seeded.admin)
    await admin.goto('/admin/products')
    const adminRow = admin.locator('tbody tr').filter({ hasText: product.name })
    await expect(adminRow).toContainText('Inactive')
    await expect(adminRow.getByRole('button', { name: 'Reactivate' })).toBeVisible()
    await expect(admin.getByRole('button', { name: /^delete$/i })).toHaveCount(0)
    await adminContext.close()

    // Reactivate from the manager page.
    await manager.goto('/manager/products')
    await row.getByRole('button', { name: 'Reactivate' }).click()
    await expect(row.getByRole('button', { name: 'Deactivate' })).toBeVisible()
    expect(await storeProductIds()).toContain(product.id)
    expect((await api('GET', `products/${product.id}/detail`)).status).toBe(200)
  } finally {
    // Leave the shared seed data as it was even if an assertion failed.
    await api('PATCH', `products/activate/${product.id}`, { token: await apiLogin(seeded.managerStarlight) })
    await managerContext.close()
  }
})

test('another company\'s manager can\'t reactivate', async () => {
  const starlight = await apiLogin(seeded.managerStarlight)
  const [product] = (await managerProducts(starlight)).filter(p => p.is_active && p.category !== 'Merch')
  const nova = await apiLogin(seeded.managerNova)
  try {
    expect((await api('DELETE', `products/delete/${product.id}`, { token: starlight })).status).toBe(200)
    expect((await api('PATCH', `products/activate/${product.id}`, { token: nova })).status).toBe(403)
  } finally {
    await api('PATCH', `products/activate/${product.id}`, { token: await apiLogin(seeded.managerStarlight) })
  }
})
