import { BaseService } from './base.service'

// GET /groups/all, GET /groups/{id} — public, no auth. See
// docs/api-spec.md §3 (Talent) in the E-commerce backend repo for the full
// GroupRead shape: id, name, company_id, debut_date, description,
// created_at, updated_at.
export class GroupsService extends BaseService {
  static get entity () {
    return 'groups'
  }

  // GET /groups/groups-page — public, no auth. One bundled response for the
  // Groups grid: every group with a precomputed member_count.
  static async getGroupsPagePublic () {
    try {
      const response = await this.request().get(`${this.entity}/groups-page`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /groups/{id}/detail — public, no auth. One bundled response for a
  // group's own detail page: the group, its members (positions + color
  // embedded), the concerts it's performing at (venue embedded), and its
  // products (genres + resolved artist embedded).
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
