/**
 * HTTP request layer
 * if auth is required return patched axios instance(with access token in headers)
 * else return clear axios instance
 */

import axios from 'axios'

import { API_URL } from '../env'

// Timeouts. The first request of a page load can land on a Render instance
// that's still cold-starting, which can take most of a minute — so until
// the server has answered anything at all, requests get a long timeout;
// after that a normal one. Either way a timeout surfaces as a request with
// no response, i.e. ApiError code "network_error".
const FIRST_REQUEST_TIMEOUT = 60000
const DEFAULT_TIMEOUT = 20000
let serverReached = false

export function requestTimeout () {
  return serverReached ? DEFAULT_TIMEOUT : FIRST_REQUEST_TIMEOUT
}

// Any HTTP response at all — success or error status — proves the server
// is up.
function markServerReached (response) {
  if (response) serverReached = true
}

// The same for the few calls that use the default axios instance directly
// (login/register/refresh in auth.service.js).
axios.interceptors.response.use(
  response => { markServerReached(response); return response },
  error => { markServerReached(error && error.response); return Promise.reject(error) }
)

// Auth endpoints where a 401 means "wrong credentials / bad token", never
// "access token expired" — refreshing and retrying them would be wrong.
const NO_REFRESH_PATHS = ['/account/login', '/account/refresh', '/profile/set-password']

function isNoRefreshPath (url = '') {
  return NO_REFRESH_PATHS.some(path => url.includes(path.slice(1)))
}

export class Http {
  constructor (status) {
    this.isAuth = status && status.auth ? status.auth : false
    this.instance = axios.create({
      baseURL: API_URL,
      timeout: requestTimeout()
    })
    this.instance.interceptors.response.use(
      response => { markServerReached(response); return response },
      error => { markServerReached(error && error.response); return Promise.reject(error) }
    )

    return this.init()
  }

  init () {
    if (this.isAuth) {
      this.instance.interceptors.request.use(async request => {
        // dynamic import breaks the http.init <-> auth.service module cycle
        // (auth.service -> store/user -> users.service -> base.service -> http.init)
        const { AuthService } = await import('@/services/auth/auth.service')

        request.headers.authorization = AuthService.getBearer()
        // if access token expired and refreshToken is exist >> go to API and get new access token
        if (AuthService.isAccessTokenExpired() && AuthService.hasRefreshToken()) {
          // Every request that lands here while a refresh is already running
          // waits on that same one (refreshTokensOnce) instead of starting its
          // own — the backend revokes the old refresh token as soon as the
          // first one succeeds, so a second concurrent refresh would 401 and
          // bounce the fan to /login mid-session.
          return AuthService.refreshTokensOnce()
            .then(() => {
              // refreshTokens() already stored the new bearer via
              // _setAuthData; just read it back onto this request.
              request.headers.authorization = AuthService.getBearer()
              return request
            })
        } else {
          return request
        }
      }, error => {
        return Promise.reject(error)
      })

      // A 401 not_authenticated mid-session (the access token was rejected
      // even though it looked unexpired — revoked, or the clock drifted):
      // refresh once (shared with every other request doing the same) and
      // replay the request once. If the replay 401s again, or the refresh
      // itself is rejected, the session is really gone — log out and send
      // the fan to login, exactly once (AuthService.expireSession). The
      // __authRetried flag is what stops a 401 → refresh → 401 loop.
      this.instance.interceptors.response.use(response => response, async error => {
        const response = error && error.response
        const config = error && error.config
        const code = response && response.data && response.data.code
        if (!response || !config || response.status !== 401 || code !== 'not_authenticated' || isNoRefreshPath(config.url)) {
          return Promise.reject(error)
        }

        const { AuthService } = await import('@/services/auth/auth.service')
        // A guest has no session to rescue — let the caller handle the 401.
        if (!AuthService.hasRefreshToken()) return Promise.reject(error)

        if (config.__authRetried) {
          AuthService.expireSession()
          return Promise.reject(error)
        }
        config.__authRetried = true

        try {
          await AuthService.refreshTokensOnce()
        } catch {
          // refreshTokens() has already expired the session if the server
          // rejected the refresh token; an offline refresh leaves it alone.
          return Promise.reject(error)
        }
        config.headers.authorization = AuthService.getBearer()
        return this.instance(config)
      })
    }

    return this.instance
  }
}
