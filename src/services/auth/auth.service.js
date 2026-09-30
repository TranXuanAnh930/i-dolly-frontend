import axios from 'axios'

import { Http, requestTimeout } from '../http.init'
import { ResponseWrapper } from '../util'
import { useAuthStore } from '@/store/auth/auth'
import { useUserStore } from '@/store/auth/user'
import $router from '@/router'

import { API_URL } from '@/env'
import { toApiError } from '../apiError'

let BEARER = ''
// The one refresh currently in flight, shared by every caller until it
// settles — see refreshTokensOnce(). Module-level rather than store state: a
// promise isn't reactive data, and there's only ever one session per app.
let refreshInFlight = null
// Set while an expired session is already being torn down, so a burst of
// failing requests produces one logout + one redirect, not one each.
let sessionExpiring = false

// A rate-limited refresh (429) is retried once, but only if the limiter's
// wait is short — a longer one would hold the page on a loader for that
// long, so it's left to restoreSession()'s caller to retry later instead.
const REFRESH_RETRY_MAX_WAIT_SECONDS = 10
// Used when a 429 doesn't say how long to wait.
const RATE_LIMIT_FALLBACK_SECONDS = 5
// How long to wait before retrying a session restore that failed for any
// other reason (offline, timeout, server error).
const SESSION_RESTORE_RETRY_SECONDS = 10

export class AuthService {
  /**
   ******************************
   * @API
   ******************************
   */

  // POST /account/register — no auth. Returns the created UserOut; the
  // caller still has to log in separately afterward (register doesn't
  // return tokens). A duplicate email comes back as a plain-string 400
  // detail ("E-mail already registered"); bad input is a 422 with an array
  // of per-field validation errors — flatten that to a readable message.
  static async register ({ name, email, password }) {
    try {
      const response = await axios.post(`${API_URL}/account/register`, { name, email, password }, { timeout: requestTimeout() })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  static async makeLogin ({ username, password }) {
    try {
      const payload = new URLSearchParams()
      payload.append('username', username)
      payload.append('password', password)
      payload.append('grant_type', 'password')

      // withCredentials: the refresh token comes back as an httpOnly
      // Set-Cookie (see POST /account/login in docs/api-spec.md), not in the
      // JSON body — the browser needs to be told to accept/store it.
      const response = await axios.post(`${API_URL}/account/login`,
        payload,
        { withCredentials: true, timeout: requestTimeout() })
      _setAuthData({
        accessToken: response.data.access_token,
        exp: _parseTokenData(response.data.access_token).exp
      })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  static async makeLogout () {
    try {
      const response = await new Http({ auth: true }).post('profile/logout', {}, { withCredentials: true })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    } finally {
      // clear the local session and redirect even if the logout request
      // itself failed (e.g. network error, already-expired token)
      _resetAuthData()
      $router.push({ name: 'login' }).catch(() => {})
    }
  }

  static async refreshTokens () {
    for (let attempt = 1; ; attempt++) {
      try {
        // POST /account/refresh reads the refresh token straight off the
        // httpOnly cookie set at login — nothing to send in the body, just
        // withCredentials so the cookie rides along.
        const response = await axios.post(`${API_URL}/account/refresh`, {}, { withCredentials: true, timeout: requestTimeout() })

        _setAuthData({
          accessToken: response.data.access_token,
          exp: _parseTokenData(response.data.access_token).exp
        })
        return new ResponseWrapper(response, response.data)
      } catch (error) {
        const apiError = toApiError(error)
        // invalid_refresh_token (or any other 401): the session is really
        // gone. Anything else — rate limited, offline, timeout, a server
        // error — is not a reason to log the fan out; the caller just sees
        // the error.
        if (apiError.status === 401) {
          AuthService.expireSession()
          throw apiError
        }
        if (apiError.status === 429) {
          apiError.retryAfter = _retryAfterSeconds(error, apiError)
          if (attempt === 1 && apiError.retryAfter <= REFRESH_RETRY_MAX_WAIT_SECONDS) {
            await new Promise(resolve => setTimeout(resolve, apiError.retryAfter * 1000))
            continue
          }
        }
        throw apiError
      }
    }
  }

  // Loads the session a stored refresh token points at — on app boot
  // (initCurrentUserStateMiddleware) and from SessionRestoreNotice's retry.
  // Never throws. Resolves true once the user is loaded. On failure: a
  // rejected refresh token has already ended the session (refreshTokens ->
  // expireSession); anything else keeps it and is recorded in
  // authStore.sessionRestore, with when to try again, so the route guard
  // doesn't mistake it for a logout.
  static async restoreSession () {
    const authStore = useAuthStore()
    try {
      await AuthService.refreshTokensOnce()
      await useUserStore().getCurrent({ throwOnError: true })
      authStore.clearSessionRestore()
      return true
    } catch (error) {
      if (!AuthService.hasRefreshToken()) {
        authStore.clearSessionRestore()
        return false
      }
      const seconds = error.status === 429 ? (error.retryAfter || RATE_LIMIT_FALLBACK_SECONDS) : SESSION_RESTORE_RETRY_SECONDS
      authStore.setSessionRestoreFailed(error, Date.now() + seconds * 1000)
      return false
    }
  }

  // Single-flight, deliberately NOT a debounce. The backend rotates refresh
  // tokens on every use — create_tokens revokes every outstanding one for the
  // user before issuing the replacement — so two overlapping refreshes mean
  // the second presents a cookie the first already revoked, gets a 401, and
  // refreshTokens()' catch logs the fan out mid-session with a perfectly valid
  // session. A debounce couldn't prevent that: it released its waiters when
  // the refresh was DISPATCHED, so any request arriving while one was still in
  // flight started a second one. Sharing the promise until it settles means
  // exactly one refresh per expiry no matter how many requests pile up behind
  // it, and no artificial delay on the first one.
  // Ends a session the server no longer accepts: clears it locally and
  // sends the fan to login with ?redirect= back to where they were — once,
  // however many in-flight requests discover it at the same moment.
  static expireSession () {
    if (sessionExpiring) return
    sessionExpiring = true
    _resetAuthData()
    const current = $router.currentRoute.value
    const redirect = current.name === 'login' ? current.query.redirect : current.fullPath
    $router.push({ name: 'login', query: redirect && redirect !== '/' ? { redirect } : {} })
      .catch(() => {})
      .finally(() => { sessionExpiring = false })
  }

  static refreshTokensOnce () {
    if (!refreshInFlight) {
      refreshInFlight = this.refreshTokens().finally(() => { refreshInFlight = null })
    }
    return refreshInFlight
  }

  /**
   ******************************
   * @METHODS
   ******************************
   */

  static isAccessTokenExpired () {
    const accessTokenExpDate = useAuthStore().accessTokenExpDate - 10
    const nowTime = Math.floor(new Date().getTime() / 1000)

    return accessTokenExpDate <= nowTime
  }

  static hasRefreshToken () {
    return Boolean(localStorage.getItem('refreshToken'))
  }

  static setRefreshToken (status) {
    if (!['', 'true'].includes(status)) {
      throw new Error(`setRefreshToken: invalid value ${status}; Expect one of ['', 'true']`)
    }

    localStorage.setItem('refreshToken', status)
  }

  // A 403 from a manager/admin-only endpoint means the server doesn't see
  // this session as staff, while the route guard (which only lets a manager/
  // admin role in) still did — i.e. currentUser.role is stale. Reload it and
  // send the visitor out of the staff area. Stays put if the server still
  // reports a staff role, since 'events' would just bounce a manager
  // straight back here (redirectManagerHomeMiddleware) in a loop. Resolves
  // true if it navigated away.
  static async leaveStaffArea () {
    const userStore = useUserStore()
    await userStore.getCurrent()
    if (['manager', 'admin'].includes(userStore.currentUser.role)) return false
    $router.push({ name: 'events' }).catch(() => {})
    return true
  }

  static getBearer () {
    return BEARER
  }

  static setBearer (accessToken) {
    BEARER = `Bearer ${accessToken}`
  }

}

/**
 ******************************
 * @private_methods
 ******************************
 */

function _parseTokenData (accessToken) {
  let payload = ''
  let tokenData = {}

  try {
    payload = accessToken.split('.')[1]
    tokenData = JSON.parse(atob(payload))
  } catch (error) {
    throw new Error(error)
  }

  return tokenData
}

// Seconds to wait before retrying a 429: the standard Retry-After header
// when the server sends one, else the number in the limiter's own detail
// ("... try again after N seconds.", already parsed into apiError.retryAfter).
function _retryAfterSeconds (error, apiError) {
  const header = error && error.response && error.response.headers && error.response.headers['retry-after']
  const fromHeader = Number(header)
  if (header && Number.isFinite(fromHeader) && fromHeader >= 0) return fromHeader
  return apiError.retryAfter != null ? apiError.retryAfter : RATE_LIMIT_FALLBACK_SECONDS
}

function _resetAuthData () {
  useAuthStore().clearSessionRestore()
  // reset userData in store
  useUserStore().setCurrentUser({})
  useAuthStore().setAccessTokenExpDate(null)
  // reset tokens
  AuthService.setRefreshToken('')
  AuthService.setBearer('')
}

function _setAuthData ({ accessToken, exp } = {}) {
  AuthService.setRefreshToken('true')
  AuthService.setBearer(accessToken)
  useAuthStore().setAccessTokenExpDate(exp)
}
