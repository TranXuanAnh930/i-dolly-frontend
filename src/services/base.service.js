import qs from 'qs'
import { assert } from '@/core'

import { Http } from './http.init'
import { ResponseWrapper, ErrorWrapper } from './util'

// The rate limiter's 429 detail reads "... try again after N seconds." —
// wait that long before the one retry. Capped at the limiter's own 60s
// window; the fallback covers a detail without a number in it.
const RATE_LIMIT_FALLBACK_SECONDS = 5
const RATE_LIMIT_MAX_SECONDS = 60

function _retryAfterMs (error) {
  const detail = error.response && error.response.data ? error.response.data.detail : ''
  const match = typeof detail === 'string' ? detail.match(/(\d+)\s*seconds?/) : null
  const seconds = match ? Number(match[1]) : RATE_LIMIT_FALLBACK_SECONDS
  return Math.min(Math.max(seconds, 1), RATE_LIMIT_MAX_SECONDS) * 1000
}

/**
 * Sends a staff-only request (`send` must build a fresh `auth: true`
 * request each call, so a retry picks up a refreshed bearer) and recovers
 * from the errors those endpoints add:
 * - 401: refresh the access token and retry once; if that's impossible or
 *   the retry still 401s, drop the session and go to login.
 * - 403: the server doesn't consider this session staff — leave the staff
 *   area (AuthService.leaveStaffArea).
 * - 429: wait out the rate limit, then retry once.
 * An error that caused a redirect is flagged `redirected` so the page
 * doesn't flash its message on the way out.
 */
async function _sendStaffRequest (send, attempt = { refreshed: false, backedOff: false }) {
  try {
    return await send()
  } catch (error) {
    const status = error.response && error.response.status
    if (status === 429 && !attempt.backedOff) {
      await new Promise(resolve => setTimeout(resolve, _retryAfterMs(error)))
      return _sendStaffRequest(send, { ...attempt, backedOff: true })
    }
    if (status !== 401 && status !== 403) throw error

    // dynamic import for the same module-cycle reason as http.init.js
    const { AuthService } = await import('@/services/auth/auth.service')
    if (status === 403) {
      error.redirected = await AuthService.leaveStaffArea()
      throw error
    }
    if (!attempt.refreshed && AuthService.hasRefreshToken()) {
      try {
        await AuthService.refreshTokensOnce()
      } catch {
        // refreshTokens() has already reset the session and gone to login
        error.redirected = true
        throw error
      }
      return _sendStaffRequest(send, { ...attempt, refreshed: true })
    }
    AuthService.expireSession()
    error.redirected = true
    throw error
  }
}

export class BaseService {
  static get entity () {
    throw new Error('entity getter not defined')
  }
  /**
   * ------------------------------
   * @HELPERS
   * ------------------------------
   */

  static request (status = { auth: false }) {
    return new Http(status)
  }

  static responseWrapper (...rest) {
    return new ResponseWrapper(...rest)
  }

  static errorWrapper (...rest) {
    return new ErrorWrapper(...rest)
  }

  static querystring (obj) {
    return qs.stringify(obj, {
      encode: false
    })
  }

  /**
   * ------------------------------
   * @API_CALLS_PUBLIC
   * ------------------------------
   */

  /**
   * GET {entity}/all — this backend's "list everything" convention (see
   * docs/api-spec.md in the E-commerce backend repo): unpaginated, no auth,
   * and — unlike a typical REST list endpoint — an EMPTY collection responds
   * 404 rather than `[]`. Treat that specific 404 as an empty list instead
   * of an error so callers don't have to special-case it themselves.
   */
  static async getAllPublic () {
    try {
      const response = await this.request().get(`${this.entity}/all`)
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return new ResponseWrapper(error.response, [])
      }
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw new ErrorWrapper(error, message)
    }
  }

  static async getListPublic (parameters = {}) {
    assert.object(parameters)

    const params = { ...parameters }

    try {
      const response = await this.request().get(`${this.entity}`, { params })
      const data = {
        content: response.data.data,
        total: Number(response.headers['x-total-count'])
      }

      return new ResponseWrapper(response, data)
    } catch (error) {
      const message = error.response.data ? error.response.data.error : error.response.statusText
      throw new ErrorWrapper(error, message)
    }
  }

  static async getByIdPublic (id) {
    assert.id(id, { required: true })

    try {
      const response = await this.request().get(`${this.entity}/${id}`)
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw new ErrorWrapper(error, message)
    }
  }

  /**
   * ------------------------------
   * @API_CALLS_PRIVATE
   * ------------------------------
   */

  /**
   * GET {entity}/{page} — the manager/admin settings-page bundles
   * (manager-idols-page, manager-events-page, ...). Manager/admin only and
   * company-scoped server-side: a manager always gets their own company's
   * rows, an admin every company's. 401/403/429 are handled by
   * _sendStaffRequest above; the thrown error carries `redirected` when
   * the visitor has already been sent elsewhere.
   */
  static async getStaffPage (page, params = {}) {
    try {
      const response = await _sendStaffRequest(() => this.request({ auth: true }).get(`${this.entity}/${page}`, { params }))
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      const wrapped = new ErrorWrapper(error, message)
      wrapped.redirected = Boolean(error.redirected)
      throw wrapped
    }
  }

  static async getById (id) {
    assert.id(id, { required: true })

    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/${id}`)
      return new ResponseWrapper(response, response.data.data)
    } catch (error) {
      const message = error.response.data ? error.response.data.error : error.response.statusText
      throw new ErrorWrapper(error, message)
    }
  }

  /**
   * POST {entity}/add — the manager/admin write convention shared by
   * idols, groups, concerts, venues, ticket_types and management_companies
   * (see docs/api-spec.md in the E-commerce backend repo). `data` may be a
   * plain object (sent as JSON) or a FormData instance (for the two
   * entities — idols, products — whose /add endpoint is multipart).
   */
  static async create (data = {}) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/add`, data)
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw new ErrorWrapper(error, message)
    }
  }

  static async update (id, data = {}) {
    assert.id(id, { required: true })
    assert.object(data, { required: true })

    try {
      const response = await this.request({ auth: true }).put(`${this.entity}/update/${id}`, data)
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw new ErrorWrapper(error, message)
    }
  }

  static async remove (id) {
    assert.id(id, { required: true })

    try {
      const response = await this.request({ auth: true }).delete(`${this.entity}/delete/${id}`)
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw new ErrorWrapper(error, message)
    }
  }
}
