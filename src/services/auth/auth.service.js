import axios from 'axios'

import { Http } from '../http.init'
import { ResponseWrapper, ErrorWrapper } from '../util'
import { useAuthStore } from '@/store/auth/auth'
import { useUserStore } from '@/store/auth/user'
import $router from '@/router'

import { API_URL } from '@/env'

let BEARER = ''

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
      const response = await axios.post(`${API_URL}/account/register`, { name, email, password })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      const detail = error.response && error.response.data ? error.response.data.detail : undefined
      const message = Array.isArray(detail) ? detail.map(d => d.msg).join(' ') : detail
      throw new ErrorWrapper(error, message)
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
        { withCredentials: true })
      _setAuthData({
        accessToken: response.data.access_token,
        exp: _parseTokenData(response.data.access_token).exp
      })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw new ErrorWrapper(error, error.response && error.response.data ? error.response.data.detail : undefined)
    }
  }

  static async makeLogout () {
    try {
      const response = await new Http({ auth: true }).post('profile/logout', {}, { withCredentials: true })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw new ErrorWrapper(error, error.response && error.response.data ? error.response.data.detail : undefined)
    } finally {
      // clear the local session and redirect even if the logout request
      // itself failed (e.g. network error, already-expired token)
      _resetAuthData()
      $router.push({ name: 'login' }).catch(() => {})
    }
  }

  static async refreshTokens () {
    try {
      // POST /account/refresh reads the refresh token straight off the
      // httpOnly cookie set at login — nothing to send in the body, just
      // withCredentials so the cookie rides along.
      const response = await axios.post(`${API_URL}/account/refresh`, {}, { withCredentials: true })

      _setAuthData({
        accessToken: response.data.access_token,
        exp: _parseTokenData(response.data.access_token).exp
      })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      _resetAuthData()
      $router.push({ name: 'login' }).catch(() => {})
      throw new ErrorWrapper(error, error.response && error.response.data ? error.response.data.detail : undefined)
    }
  }

  static debounceRefreshTokens = this._debounce(() => {
    return this.refreshTokens()
  }, 100)

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

  static getBearer () {
    return BEARER
  }

  static setBearer (accessToken) {
    BEARER = `Bearer ${accessToken}`
  }

  /**
   * https://stackoverflow.com/questions/35228052/debounce-function-implemented-with-promises
   * @param inner
   * @param ms
   * @returns {function(...[*]): Promise<unknown>}
   * @private
   */
  static _debounce (inner, ms = 0) {
    let timer = null
    let resolves = []

    return function () {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const result = inner()
        resolves.forEach(r => r(result))
        resolves = []
      }, ms)

      return new Promise(resolve => resolves.push(resolve))
    }
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

function _resetAuthData () {
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
