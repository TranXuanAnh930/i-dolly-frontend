// Live: password-session-and-reset-links.md against the real backend.
import { test, expect } from '@playwright/test'
import { registerFan, apiLogin, api, uiLogin, resetRateLimits, latestResetLink } from './support/backend'

test.beforeEach(() => resetRateLimits())

async function changePasswordInUi (page, current, next) {
  await page.goto('/account')
  await page.locator('input[autocomplete="current-password"]').fill(current)
  const fields = page.locator('input[autocomplete="new-password"]')
  await fields.nth(0).fill(next)
  await fields.nth(1).fill(next)
  await page.getByRole('button', { name: 'Change password' }).click()
}

test('changing the password keeps the session across a reload', async ({ page }) => {
  const fan = await registerFan('pw-change')
  await uiLogin(page, fan.email, fan.password)

  await changePasswordInUi(page, fan.password, 'NewPass456!')
  await expect(page.getByText('Password updated.')).toBeVisible()

  // A reload restores the session from the refresh cookie. Before the fix
  // the browser still held the revoked pre-change cookie: refresh → 401 →
  // bounced to /login.
  const refresh = page.waitForResponse(response => response.url().endsWith('/account/refresh'))
  await page.reload()
  expect((await refresh).status()).toBe(200)
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByRole('button', { name: 'Change password' })).toBeVisible()

  // And the new password really is the password now.
  expect((await api('POST', 'account/login', { form: { username: fan.email, password: fan.password, grant_type: 'password' } })).status).toBe(401)
  expect((await api('POST', 'account/login', { form: { username: fan.email, password: 'NewPass456!', grant_type: 'password' } })).status).toBe(200)
})

test('a wrong current password shows the error and keeps the session', async ({ page }) => {
  const fan = await registerFan('pw-wrong')
  await uiLogin(page, fan.email, fan.password)
  await changePasswordInUi(page, 'not-my-password', 'NewPass456!')
  await expect(page.getByText('Your current password is incorrect.')).toBeVisible()
  await page.reload()
  await expect(page).toHaveURL(/\/account$/)
})

test('a reset link works once, then shows the expired-or-used message', async ({ page }) => {
  const fan = await registerFan('pw-reset')

  await page.goto('/forgot-password')
  await page.locator('#email').fill(fan.email)
  await page.locator('button[type="submit"]').click()
  const link = await latestResetLink(fan.email)
  const url = new URL(link)

  const setPassword = async () => {
    await page.goto(url.pathname + url.search)
    const fields = page.locator('input[autocomplete="new-password"]')
    await fields.nth(0).fill('ResetPass789!')
    await fields.nth(1).fill('ResetPass789!')
    await page.locator('button[type="submit"]').click()
  }

  await setPassword()
  await expect(page.getByText('Password updated — you can log in with it now.')).toBeVisible()
  expect((await api('POST', 'account/login', { form: { username: fan.email, password: 'ResetPass789!', grant_type: 'password' } })).status).toBe(200)

  await setPassword()
  await expect(page.getByText('This link has expired or has already been used. Please request a new one.')).toBeVisible()
  await expect(page.locator('a[href="/forgot-password"]')).toBeVisible()
})

test('a reset link is rejected after the password was changed another way', async ({ page }) => {
  const fan = await registerFan('pw-stale-link')
  await page.goto('/forgot-password')
  await page.locator('#email').fill(fan.email)
  await page.locator('button[type="submit"]').click()
  const link = new URL(await latestResetLink(fan.email))

  const token = await apiLogin(fan.email, fan.password)
  expect((await api('PUT', 'profile/change-password', { token, json: { old_password: fan.password, new_password: 'Other123!' } })).status).toBe(200)

  await page.goto(link.pathname + link.search)
  const fields = page.locator('input[autocomplete="new-password"]')
  await fields.nth(0).fill('ResetPass789!')
  await fields.nth(1).fill('ResetPass789!')
  await page.locator('button[type="submit"]').click()
  await expect(page.getByText('This link has expired or has already been used. Please request a new one.')).toBeVisible()
})
