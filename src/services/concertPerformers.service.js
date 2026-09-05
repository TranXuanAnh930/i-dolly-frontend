import { BaseService } from './base.service'

// GET /concerts/performers/concert/{concert_id} — public, no auth. See
// docs/api-spec.md §4 (Events & Ticketing) in the E-commerce backend repo
// for the full ConcertPerformerRead shape: id, concert_id, idol_id,
// group_id — exactly one of idol_id/group_id is set (never both), the
// same convention as album_details.
export class ConcertPerformersService extends BaseService {
  static get entity () {
    return 'concerts/performers'
  }

  static async getByConcertPublic (concertId) {
    try {
      const response = await this.request().get(`${this.entity}/concert/${concertId}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
