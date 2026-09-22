import { BaseService } from '../base.service'

// Wraps the fan-facing lottery_preferences/lottery_entries routers, plus
// the manager-facing lottery_campaigns add/update/remove CRUD (all
// inherited straight from BaseService — POST .../add, PUT .../update/{id},
// DELETE .../delete/{id} — see ManagerEventFormPage.vue). Reading campaign
// data is a different path: GET /concerts/{id}/detail (concerts.service.js)
// bundles it in already, not fetched through here. There's still no
// endpoint to pay for a ticket won through a lottery — see
// LotteryPaymentPage.vue's comment for how that gap is handled on the
// frontend for now.
export class LotteryService extends BaseService {
  static get entity () {
    return 'lottery_campaigns'
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

  // POST /lottery_entries/apply-batch — auth required, fan-account-only
  // server-side. Enters every tier the fan picked in one request: one
  // transaction and one rate-limit slot, so they either get all of them or
  // none. This replaced a per-tier loop over the single POST
  // /lottery_entries/apply — that endpoint still exists server-side, but it
  // costs a slot per call against a 3/60s budget, so a concert with more tiers
  // than that would 429 the tail of a submission with the earlier tiers
  // already committed. Ranking comes from setPreferences, not from the order
  // of this array.
  static async applyToEntries (campaignIds) {
    try {
      const response = await this.request({ auth: true }).post('lottery_entries/apply-batch', { campaign_ids: campaignIds })
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
