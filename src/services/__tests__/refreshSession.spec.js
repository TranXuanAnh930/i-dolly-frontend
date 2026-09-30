import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// AuthService talks to axios directly for /account/refresh and navigates via
// the app router; both are stubbed so these tests exercise only its own
// retry / session-keeping decisions.
const { post, push } = vi.hoisted(() => ({ post: vi.fn(), push: vi.fn(() => Promise.resolve()) }))

vi.mock('axios', () => {
  const interceptors = () => ({ request: { use: vi.fn() }, response: { use: vi.fn() } })
  return { default: { post, create: vi.fn(() => ({ interceptors: interceptors() })), interceptors: interceptors() } }
})
vi.mock('@/router', () => ({
  default: { push, currentRoute: { value: { name: 'history', fullPath: '/history', query: {} } } }
}))

const storage = new Map()
globalThis.localStorage = {
  getItem: key => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key)
}

const { AuthService } = await import('../auth/auth.service')
const { useAuthStore } = await import('@/store/auth/auth')

function accessToken () {
  const payload = Buffer.from(JSON.stringify({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + 900 })).toString('base64')
  return `header.${payload}.sig`
}
function ok () {
  return { status: 200, data: { access_token: accessToken() } }
}
function rateLimited (seconds, headers = {}) {
  return { message: 'Request failed with status code 429', response: { status: 429, headers, data: { detail: `Too many requests. Please try again after ${seconds} seconds.`, code: 'rate_limited' } } }
}
function unauthorized () {
  return { message: 'Request failed with status code 401', response: { status: 401, headers: {}, data: { detail: 'Invalid or expired refresh token', code: 'invalid_refresh_token' } } }
}

describe('AuthService.refreshTokens', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    storage.clear()
    AuthService.setRefreshToken('true')
    post.mockReset()
    push.mockClear()
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('retries a short 429 once after the wait, then succeeds', async () => {
    post.mockRejectedValueOnce(rateLimited(3)).mockResolvedValueOnce(ok())
    const result = AuthService.refreshTokens()
    await vi.advanceTimersByTimeAsync(3000)
    await expect(result).resolves.toBeTruthy()
    expect(post).toHaveBeenCalledTimes(2)
    expect(AuthService.hasRefreshToken()).toBe(true)
  })

  it('prefers the Retry-After header over the detail text', async () => {
    post.mockRejectedValueOnce(rateLimited(50, { 'retry-after': '2' })).mockResolvedValueOnce(ok())
    const result = AuthService.refreshTokens()
    await vi.advanceTimersByTimeAsync(2000)
    await expect(result).resolves.toBeTruthy()
    expect(post).toHaveBeenCalledTimes(2)
  })

  it('does not wait out a long 429 — fails fast and keeps the session', async () => {
    post.mockRejectedValueOnce(rateLimited(55))
    await expect(AuthService.refreshTokens()).rejects.toMatchObject({ status: 429, code: 'rate_limited', retryAfter: 55 })
    expect(post).toHaveBeenCalledTimes(1)
    expect(AuthService.hasRefreshToken()).toBe(true)
    expect(push).not.toHaveBeenCalled()
  })

  it('retries a 429 only once', async () => {
    post.mockRejectedValue(rateLimited(1))
    const result = AuthService.refreshTokens()
    const assertion = expect(result).rejects.toMatchObject({ status: 429 })
    await vi.advanceTimersByTimeAsync(1000)
    await assertion
    expect(post).toHaveBeenCalledTimes(2)
    expect(AuthService.hasRefreshToken()).toBe(true)
  })

  it('keeps the session on a network error', async () => {
    post.mockRejectedValueOnce({ message: 'Network Error' })
    await expect(AuthService.refreshTokens()).rejects.toMatchObject({ status: 0, code: 'network_error' })
    expect(AuthService.hasRefreshToken()).toBe(true)
    expect(push).not.toHaveBeenCalled()
  })

  it('ends the session on a 401', async () => {
    post.mockRejectedValueOnce(unauthorized())
    await expect(AuthService.refreshTokens()).rejects.toMatchObject({ status: 401 })
    expect(AuthService.hasRefreshToken()).toBe(false)
    expect(push).toHaveBeenCalledWith(expect.objectContaining({ name: 'login' }))
  })
})

describe('AuthService.restoreSession', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    storage.clear()
    AuthService.setRefreshToken('true')
    post.mockReset()
    push.mockClear()
  })

  it('records a rate-limited restore with when to retry, without logging out', async () => {
    post.mockRejectedValueOnce(rateLimited(40))
    const before = Date.now()
    await expect(AuthService.restoreSession()).resolves.toBe(false)
    const { sessionRestore } = useAuthStore()
    expect(sessionRestore.error).toMatchObject({ status: 429 })
    expect(sessionRestore.retryAt).toBeGreaterThanOrEqual(before + 40000)
    expect(useAuthStore().isSessionRestoreBackingOff()).toBe(true)
    expect(AuthService.hasRefreshToken()).toBe(true)
    expect(push).not.toHaveBeenCalled()
  })

  it('clears the restore state when the refresh token is rejected', async () => {
    useAuthStore().setSessionRestoreFailed({ status: 429 }, Date.now() - 1)
    post.mockRejectedValueOnce(unauthorized())
    await expect(AuthService.restoreSession()).resolves.toBe(false)
    expect(useAuthStore().sessionRestore.error).toBe(null)
    expect(AuthService.hasRefreshToken()).toBe(false)
  })
})
