import { BaseService } from './base.service'
import { ErrorWrapper, ResponseWrapper } from './util'

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
}
