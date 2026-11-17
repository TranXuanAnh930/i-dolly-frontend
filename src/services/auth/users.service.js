import { BaseService } from '../base.service'
import { ResponseWrapper } from '../util'
import { toApiError } from '../apiError'

export class UsersService extends BaseService {
  static get entity () {
    return 'profile'
  }

  // GET /profile/me — returns the flat UserOut object (id, name, email,
  // is_active, is_admin, is_verified, created_at, updated_at), not wrapped
  // under a `data` key.
  static async getCurrent () {
    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/me`)
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  // PUT /profile/change-password — auth required. 400 incorrect_password
  // when oldPassword doesn't match (nothing changes). On success the backend
  // revokes every refresh token the account has and issues a new pair, like
  // POST /account/refresh: the access token in the body, the refresh token
  // as an httpOnly Set-Cookie. withCredentials so the browser keeps that
  // cookie — otherwise the next refresh presents the revoked one, 401s, and
  // the fan is logged out once this access token expires.
  static async changePassword (oldPassword, newPassword) {
    try {
      const response = await this.request({ auth: true }).put(
        `${this.entity}/change-password`,
        { old_password: oldPassword, new_password: newPassword },
        { withCredentials: true }
      )
      if (response.data && response.data.access_token) {
        // dynamic import, same module cycle as http.init
        // (auth.service -> store/user -> users.service)
        const { AuthService } = await import('./auth.service')
        AuthService.applyAccessToken(response.data.access_token)
      }
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  // POST /profile/forgot-password — no auth. Always resolves with the same
  // generic message server-side, whether or not the email is registered
  // (see reset_password_process), so this never reveals account existence.
  static async forgotPassword (email) {
    try {
      const response = await this.request().post(`${this.entity}/forgot-password`, { email })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  // POST /profile/set-password — no auth. `token` is the raw reset token
  // emailed by forgot-password, valid for 15 minutes.
  static async setPassword (token, newPassword) {
    try {
      const response = await this.request().post(`${this.entity}/set-password`, { token, new_password: newPassword })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }
}
