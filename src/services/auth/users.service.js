import { BaseService } from '../base.service'
import { ErrorWrapper, ResponseWrapper } from '../util'

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
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw new ErrorWrapper(error, message)
    }
  }

  // PUT /profile/change-password — auth required. 400s with "Incorrect old
  // password" when oldPassword doesn't match — callers should surface that
  // detail directly rather than a generic error.
  static async changePassword (oldPassword, newPassword) {
    try {
      const response = await this.request({ auth: true }).put(`${this.entity}/change-password`, { old_password: oldPassword, new_password: newPassword })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw new ErrorWrapper(error, message)
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
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw new ErrorWrapper(error, message)
    }
  }

  // POST /profile/set-password — no auth. `token` is the raw reset token
  // emailed by forgot-password, valid for 15 minutes.
  static async setPassword (token, newPassword) {
    try {
      const response = await this.request().post(`${this.entity}/set-password`, { token, new_password: newPassword })
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw new ErrorWrapper(error, message)
    }
  }
}
