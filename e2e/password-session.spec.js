// Handover: password-session-and-reset-links.md (backend bugs #18, #19).
import { test, expect } from '@playwright/test'
import { mockApi, users, fakeJwt, apiError } from './support/mockApi'

async function fillPasswordForm (page, { current = 'old-pass', next = 'new-pass-123' } = {}) {
  await page.locator('input[autocomplete="current-password"]').fill(current)
  const newFields = page.locator('input[autocomplete="new-password"]')
  await newFields.nth(0).fill(next)
  await newFields.nth(1).fill(next)
  await page.getByRole('button', { name: 'Change password' }).click()
}

test.describe('change password keeps the session', () => {
  test('adopts the access token the change-password response returns', async ({ page }) => {
    const rotated = fakeJwt({ sub: users.fan.id, tag: 'rotated' })
    const api = await mockApi(page, {
      user: users.fan,
      routes: {
        'PUT profile/change-password': { body: { msg: 'Password changed successfully', access_token: rotated } }
      }
    })

    await page.goto('/account')
    await fillPasswordForm(page)
    await expect(page.getByText('Password updated.')).toBeVisible()

    // Any later authenticated request must carry the rotated token, not
    // the one from the session restore.
    const before = api.calls.length
    // Client-side navigation (no reload): the cart page refetches the cart.
    await page.locator('.menu-item--desktop a.cart-link').click()
    await expect(page).toHaveURL(/\/cart$/)
    await expect.poll(() => api.calls.slice(before).filter(c => c.headers.authorization).length).toBeGreaterThan(0)
    for (const call of api.calls.slice(before).filter(c => c.headers.authorization)) {
      expect(call.headers.authorization, call.key).toBe(`Bearer ${rotated}`)
    }
  })

  test('sends the request with credentials and keeps the new refresh cookie', async ({ page, context }) => {
    // The old refresh cookie, as login would have left it.
    await context.addCookies([{ name: 'refresh_token', value: 'OLD', domain: 'localhost', path: '/', sameSite: 'Lax' }])
    const api = await mockApi(page, {
      user: users.fan,
      routes: {
        // A token already inside AuthService's 10 s expiry margin, so the
        // very next authenticated request has to go through a refresh.
        'PUT profile/change-password': {
          body: { msg: 'ok', access_token: fakeJwt({ sub: users.fan.id, expiresIn: 5, tag: 'short' }) },
          headers: { 'set-cookie': 'refresh_token=NEW; Path=/; HttpOnly; SameSite=Lax' }
        }
      }
    })

    await page.goto('/account')
    await fillPasswordForm(page)
    await expect(page.getByText('Password updated.')).toBeVisible()

    // withCredentials: without it the browser sends no cookie and drops
    // the Set-Cookie on the response.
    const [change] = api.callsTo('PUT profile/change-password')
    expect(change.headers.cookie || '').toContain('refresh_token=OLD')

    await page.locator('.menu-item--desktop a.cart-link').click()
    await expect.poll(() => api.callsTo('POST account/refresh').length).toBe(2)
    const refresh = api.callsTo('POST account/refresh')[1]
    expect(refresh.headers.cookie || '').toContain('refresh_token=NEW')
    // Still logged in: no bounce to /login.
    await expect(page).toHaveURL(/\/cart$/)
  })

  test('a wrong current password shows the error and keeps the session', async ({ page }) => {
    await mockApi(page, {
      user: users.fan,
      routes: { 'PUT profile/change-password': apiError(400, 'incorrect_password', 'Incorrect old password') }
    })

    await page.goto('/account')
    await fillPasswordForm(page, { current: 'wrong' })
    await expect(page.getByText('Your current password is incorrect.')).toBeVisible()
    await expect(page).toHaveURL(/\/account$/)
  })
})

test.describe('reset links are single-use', () => {
  for (const [locale, message] of [
    ['en', 'This link has expired or has already been used. Please request a new one.'],
    ['ja', 'このリンクは有効期限が切れているか、すでに使用されています。新しいリンクをリクエストしてください。']
  ]) {
    test(`a used link shows the expired-or-used message (${locale})`, async ({ page }) => {
      await page.addInitScript(value => localStorage.setItem('i-dolly-locale', value), locale)
      await mockApi(page, {
        routes: { 'POST profile/set-password': apiError(401, 'invalid_token', 'Invalid or expired token') }
      })

      await page.goto('/reset-password?token=already-used')
      const fields = page.locator('input[autocomplete="new-password"]')
      await fields.nth(0).fill('new-pass-123')
      await fields.nth(1).fill('new-pass-123')
      await page.locator('button[type="submit"]').click()

      await expect(page.getByText(message)).toBeVisible()
      await expect(page.locator('a[href="/forgot-password"]')).toBeVisible()
    })
  }
})
