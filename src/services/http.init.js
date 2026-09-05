/**
 * HTTP request layer
 * if auth is required return patched axios instance(with access token in headers)
 * else return clear axios instance
 */

import axios from 'axios'

import { API_URL } from '../env'

export class Http {
  constructor (status) {
    this.isAuth = status && status.auth ? status.auth : false
    this.instance = axios.create({
      baseURL: API_URL
    })

    return this.init()
  }

  init () {
    if (this.isAuth) {
      this.instance.interceptors.request.use(async request => {
        // dynamic import breaks the http.init <-> auth.service module cycle
        // (auth.service -> store/user -> users.service -> base.service -> http.init)
        const { AuthService } = await import('@/services/auth.service')

        request.headers.authorization = AuthService.getBearer()
        // if access token expired and refreshToken is exist >> go to API and get new access token
        if (AuthService.isAccessTokenExpired() && AuthService.hasRefreshToken()) {
          return AuthService.debounceRefreshTokens()
            .then(response => {
              AuthService.setBearer(response.data.access_token)
              request.headers.authorization = AuthService.getBearer()
              return request
            }).catch(error => Promise.reject(error))
        } else {
          return request
        }
      }, error => {
        return Promise.reject(error)
      })
    }

    return this.instance
  }
}
