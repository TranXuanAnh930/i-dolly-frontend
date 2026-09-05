import { BaseService } from './base.service'

// GET /positions/idol_positions/idol/{idol_id} — public, no auth. This
// entity has no `/all` route (positions are always scoped to one idol).
// IdolPositionRead: idol_id, position_id, is_primary, position (embedded
// PositionRead: id, name) — an idol usually carries one primary position
// (is_primary: true) plus zero or more secondary ones. Like `{entity}/all`
// elsewhere in this API, an idol with none tagged responds 404 rather
// than [] — treat that as no positions instead of an error.
export class IdolPositionsService extends BaseService {
  static get entity () {
    return 'positions'
  }

  static async getForIdolPublic (idolId) {
    try {
      const response = await this.request().get(`${this.entity}/idol_positions/idol/${idolId}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return this.responseWrapper(error.response, [])
      }
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
