import { BaseService } from '../base.service'
import { toFormData } from '@/utils/formData'
import { toApiError } from '../apiError'

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
      throw toApiError(error)
    }
  }

  // POST /idols/{id}/image — replaces an existing idol's photo without
  // touching any other field, the complement to the inline upload on create.
  static async uploadImage (id, file) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/${id}/image`, toFormData({ image: file }))
      return this.responseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
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
      throw toApiError(error)
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
      throw toApiError(error)
    }
  }

  // GET /idols/manager-idols-page — manager/admin only (see
  // BaseService.getStaffPage). One bundled response for ManagerIdolsPage's
  // table: idols, plus the group list its "Group" column resolves against —
  // both already scoped to a manager's own company. No idol_colors — this
  // table never shows a color.
  static getManagerIdolsPage () {
    return this.getStaffPage('manager-idols-page')
  }

  // GET /idols/manager-idol-form-page — manager/admin only (see
  // BaseService.getStaffPage). One bundled response for
  // ManagerIdolFormPage: idols (for the isEditing lookup) and groups (the
  // group <select>), both scoped to a manager's own company, plus colors
  // (the color <select>, unscoped reference data).
  static getManagerIdolFormPage () {
    return this.getStaffPage('manager-idol-form-page')
  }

  // PATCH /idols/activate/{id} — manager/admin only. `remove()` (DELETE)
  // is a soft delete server-side (sets is_active=false, keeps the row and
  // every FK pointing at it intact) — this is its undo.
  static async activate (id) {
    try {
      const response = await this.request({ auth: true }).patch(`${this.entity}/activate/${id}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }
}
