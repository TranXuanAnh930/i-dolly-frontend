import { BaseService } from './base.service'

// POST /tickets/checkout — direct-sale purchase, fan-account-only
// server-side (a manager/admin or guest attempt 403s via
// FanOnlyPurchaseError). Returns the created Ticket with its ticket_type
// (tier/price/concert_id) already nested. The mock payment gateway always
// responds 200 — even a declined payment (simulate_succ:false) comes back
// as a normal Ticket, just with status:"cancelled" — so callers must branch
// on `ticket.status`, not on the HTTP status, same convention as
// OrderService.checkout.
export class TicketService extends BaseService {
  static get entity () {
    return 'tickets'
  }

  static async checkout (data) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/checkout`, data)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /tickets/mine — every ticket this fan has ever bought or been
  // issued (each with ticket_type already populated). 404s on none yet —
  // treated as an empty list like every other list endpoint here.
  static async fetchAll () {
    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/mine`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return this.responseWrapper(error.response, [])
      }
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /tickets/concert/{id}/sales — manager/admin only. Paginated ticket
  // sales history for one concert, mirroring ProductsService.getSalesHistory.
  static async getConcertSalesHistory (concertId, { page = 1, limit = 10 } = {}) {
    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/concert/${concertId}/sales`, { params: { page, limit } })
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
