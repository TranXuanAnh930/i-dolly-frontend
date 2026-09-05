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

  // GET /idols/members-page — public, no auth. One bundled response for the
  // Members grid: every idol with its positions and color embedded, plus
  // the group list the unit filter needs. Replaces separately fetching
  // idols/all + idol_colors/all + positions/idol_positions/all.
  static async getMembersPagePublic () {
    try {
      const response = await this.request().get(`${this.entity}/members-page`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /idols/{id}/detail — public, no auth. One bundled response for an
  // idol's own detail page: the idol (positions + color embedded), its
  // group, and its siblings (other members, or other solo idols).
  static async getDetailPublic (id) {
    try {
      const response = await this.request().get(`${this.entity}/${id}/detail`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
