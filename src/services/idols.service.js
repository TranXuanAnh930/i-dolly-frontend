import { BaseService } from './base.service'
import { toFormData } from '@/utils/formData'

// GET /idols/all, GET /idols/{id} — public, no auth. See docs/api-spec.md
// §3 (Talent) in the E-commerce backend repo for the full IdolRead shape:
// id, name, company_id, group_id, date_of_birth, hometown, color_id,
// short_intro, long_description, profile_image_url, created_at, updated_at.
export class IdolsService extends BaseService {
  static get entity () {
    return 'idols'
  }

  // POST /idols/add is multipart/form-data (an optional `image` file
  // alongside the rest of the profile), unlike the base class's JSON
  // `create` — manager/admin only.
  static async create (fields = {}) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/add`, toFormData(fields))
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // POST /idols/{id}/image — replaces an existing idol's photo without
  // touching any other field, the complement to the inline upload on create.
  static async uploadImage (id, file) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/${id}/image`, toFormData({ image: file }))
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
