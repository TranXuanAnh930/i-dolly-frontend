import { BaseService } from './base.service'

// Wraps /direct_sale_campaigns — the direct-sale mirror of
// lottery_campaigns (see lottery.service.js): a time-boxed on-sale window
// for one direct-sale ticket tier. checkout_ticket now requires an
// open, in-window campaign to exist before it'll sell a ticket for that
// tier (ticket_service.checkout_ticket), so a direct-sale tier is only
// really "on sale" while one of these says so, same as a lottery tier only
// being enterable while its own campaign is open.
export class DirectSaleCampaignService extends BaseService {
  static get entity () {
    return 'direct_sale_campaigns'
  }

  // GET /direct_sale_campaigns/ticket_type/{id} — public, no auth. Every
  // campaign ever run for one direct-sale tier. 404s on none — treated as
  // an empty list like every other list endpoint here.
  static async getCampaignsForTicketType (ticketTypeId) {
    try {
      const response = await this.request().get(`${this.entity}/ticket_type/${ticketTypeId}`)
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
