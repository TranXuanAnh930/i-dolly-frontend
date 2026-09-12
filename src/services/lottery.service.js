import { BaseService } from './base.service'

// Wraps the three lottery routers (campaigns/entries/preferences) — see
// docs/api-spec.md in the E-commerce backend repo. All three are real,
// wired-up endpoints (not stubs), but there's still no endpoint to run the
// draw itself or to pay for a ticket won through one — see
// LotteryPaymentPage.vue's comment for how that gap is handled on the
// frontend for now.
export class LotteryService extends BaseService {
  static get entity () {
    return 'lottery_campaigns'
  }

  // GET /lottery_campaigns/ticket_type/{id} — public, no auth. Every
  // campaign ever run for one lottery ticket tier (usually just the current
  // open one, but a concert can be re-run). 404s on none — treated as an
  // empty list like every other list endpoint here.
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

  // GET /lottery_campaigns/{id} — public, no auth.
  static async getCampaignPublic (id) {
    try {
      const response = await this.request().get(`${this.entity}/${id}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // POST /lottery_preferences/set — auth required. Replaces the fan's whole
  // ranked wishlist for this concert in one call; `ticketTypeIds` order IS
  // the rank (1st element = rank 1). A LotteryEntry.apply() call for any of
  // these tiers requires a matching preference to already exist (DB
  // trigger trg_lottery_entries_require_preference), so this must run
  // before the apply() calls below, not after.
  static async setPreferences (concertId, ticketTypeIds) {
    try {
      const response = await this.request({ auth: true }).post('lottery_preferences/set', {
        concert_id: concertId,
        ticket_type_ids_in_order: ticketTypeIds
      })
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // POST /lottery_entries/apply — auth required, fan-account-only
  // server-side. One call per campaign (= per tier) the fan wants to enter;
  // ranking across the tiers they entered is read off their
  // LotteryPreference rows by the draw, not passed here.
  static async applyToEntry (campaignId) {
    try {
      const response = await this.request({ auth: true }).post('lottery_entries/apply', { campaign_id: campaignId })
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /lottery_entries/mine — auth required. Every lottery entry this fan
  // has ever placed, across every concert/tier. 404s on none — treated as
  // an empty list like every other list endpoint here.
  static async getMyEntries () {
    try {
      const response = await this.request({ auth: true }).get('lottery_entries/mine')
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
