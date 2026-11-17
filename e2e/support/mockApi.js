// A fake backend for Playwright: intercepts every request to the API origin
// and answers it from a small routing table. Each test adds the handlers it
// cares about; the defaults below only cover what the app shell fetches on
// boot (session restore, header badges, catalog), so a page renders without
// a test having to know about them.

export const API_ORIGIN = 'http://localhost:8000'
export const APP_ORIGIN = 'http://localhost:8080'

export const users = {
  fan: { id: 'u-fan', role: 'fan', company_id: null, name: 'Fan Tester', email: 'fan@example.com' },
  manager: { id: 'u-manager', role: 'manager', company_id: 'c-1', name: 'Manager Tester', email: 'manager@example.com' },
  admin: { id: 'u-admin', role: 'admin', company_id: null, name: 'Admin Tester', email: 'admin@example.com' }
}

// AuthService only base64-decodes the payload to read `exp`; the signature
// is never checked client-side.
export function fakeJwt ({ sub = 'u', expiresIn = 3600, tag = 'token' } = {}) {
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64').replace(/=+$/, '')
  const exp = Math.floor(Date.now() / 1000) + expiresIn
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub, exp, tag })}.signature`
}

export function apiError (status, code, detail = code) {
  return { status, body: { code, detail } }
}

const corsHeaders = {
  'access-control-allow-origin': APP_ORIGIN,
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Installs the fake backend on `page`.
 *
 * - `user`: log in as this user (null = logged out). Seeds the
 *   "refreshToken" flag so the app restores the session through
 *   POST /account/refresh + GET /profile/me on boot.
 * - `routes`: { 'METHOD path': handler } where path is relative to the API
 *   root (e.g. 'GET order/manager-orders-page'), may end in '*' for a
 *   prefix match, and handler is a response object
 *   ({ status, body, headers, delay }) or a function (call) => response.
 *   These win over the defaults.
 *
 * Returns { calls, callsTo(key) } — every request the app made, in order,
 * with method, path, query, headers (including cookie) and parsed body.
 */
export async function mockApi (page, { user = null, routes = {} } = {}) {
  const calls = []

  const defaults = {
    'POST account/refresh': () => ({ body: { access_token: fakeJwt({ sub: user && user.id, tag: 'boot' }) } }),
    'GET profile/me': () => ({ body: user }),
    'GET products/store-page': { body: { products: [], groups: [] } },
    'GET cart/see_cart': { body: { items: [] } },
    'GET order/fetch_placed_order': { body: [] },
    'GET tickets/mine': { body: [] },
    'GET lottery_entries/mine': { body: [] },
    'GET notifications/unread-count': { body: { count: 0 } },
    'GET notifications/mine': { body: [] },
    'GET shipping_addresses/fetch': { body: [] }
  }
  const table = { ...defaults, ...routes }

  function resolve (method, path) {
    const exact = table[`${method} ${path}`]
    if (exact) return exact
    const prefix = Object.keys(table)
      .filter(key => key.endsWith('*'))
      .sort((a, b) => b.length - a.length)
      .find(key => {
        const [keyMethod, keyPath] = key.split(' ')
        return keyMethod === method && path.startsWith(keyPath.slice(0, -1))
      })
    return prefix ? table[prefix] : null
  }

  if (user) {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('e2e-seeded')) {
        localStorage.setItem('refreshToken', 'true')
        sessionStorage.setItem('e2e-seeded', '1')
      }
    })
  }

  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request()
    const method = request.method()
    if (method === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: corsHeaders })
    }

    const url = new URL(request.url())
    const path = url.pathname.replace(/^\/+/, '')
    let body = null
    const raw = request.postData()
    if (raw) {
      try { body = JSON.parse(raw) } catch { body = raw }
    }
    const call = {
      key: `${method} ${path}`,
      method,
      path,
      query: Object.fromEntries(url.searchParams),
      headers: await request.allHeaders(),
      body,
      at: Date.now()
    }
    calls.push(call)

    const handler = resolve(method, path)
    if (!handler) {
      // Unknown endpoint: an empty list keeps most pages rendering; tests
      // can assert on `calls` if they care that something was requested.
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: '[]' })
    }
    const response = (typeof handler === 'function' ? await handler(call) : handler) || {}
    if (response.delay) await sleep(response.delay)
    call.respondedAt = Date.now()
    return route.fulfill({
      status: response.status || 200,
      headers: { ...corsHeaders, ...(response.headers || {}) },
      contentType: 'application/json',
      body: JSON.stringify(response.body === undefined ? {} : response.body)
    })
  })

  return {
    calls,
    callsTo: key => calls.filter(call => call.key === key)
  }
}
