import { BaseService } from './base.service'

// GET /ticket_types/concert/{concert_id} — public, no auth. This entity has
// no `/all` route (ticket types are always scoped to one concert). See
// docs/api-spec.md §4 (Events & Ticketing) in the E-commerce backend repo
// for the full TicketTypeRead shape: id, concert_id, tier, price,
// total_quantity, sold_quantity, sale_method ('direct' | 'lottery'),
// created_at.
export class TicketTypesService extends BaseService {
  static get entity () {
    return 'ticket_types'
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

  // GET /ticket_types/{id} — public, no auth. Used to resolve a bare
  // ticket_type_id back to its tier/price/concert_id — e.g. a
  // LotteryCampaign only carries ticket_type_id, not the tier itself.
  static async getByIdPublic (id) {
    try {
      const response = await this.request().get(`${this.entity}/${id}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
