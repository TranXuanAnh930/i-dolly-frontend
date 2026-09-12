import { BaseService } from './base.service'

// GET /concerts/all, GET /concerts/{id} — public, no auth. See
// docs/api-spec.md §4 (Events & Ticketing) in the E-commerce backend repo
// for the full ConcertRead shape: id, venue_id, title, description,
// capacity, event_datetime, doors_open_at, company_id, status,
// created_at, updated_at. Pair with TicketTypesService (concert ticket
// tiers) and the concert-performers endpoint to build a full concert page.
export class ConcertsService extends BaseService {
  static get entity () {
    return 'concerts'
  }

  // GET /concerts/events-page — public, no auth. One bundled response for
  // the Events grid: every concert with its venue embedded.
  static async getEventsPagePublic () {
    try {
      const response = await this.request().get(`${this.entity}/events-page`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /concerts/{id}/detail — public, no auth. One bundled response for a
  // concert's own detail page: the concert, its venue, its ticket types,
  // the resolved idol lineup, and the distinct performing groups.
  static async getDetailPublic (id) {
    try {
      const response = await this.request().get(`${this.entity}/${id}/detail`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /concerts/manager-events-page — public, no auth. One bundled
  // response for ManagerEventsPage's table and ManagerEventFormPage's venue
  // <select>: concerts and venues as separate lists (not embedded per-
  // concert) since the form's dropdown needs every venue, not just ones
  // already booked.
  static async getManagerEventsPagePublic () {
    try {
      const response = await this.request().get(`${this.entity}/manager-events-page`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // PUT /concerts/lottery-draw/{id} — manager/admin only. Enqueues the
  // backend's async lottery-draw job for every open campaign on this
  // concert; the response is just a "queued" acknowledgement, not the
  // actual results — winners/losers show up once the worker finishes by
  // re-fetching the campaign(s) (status flips open → drawn) or the
  // affected fans' own lottery entries, not from this call's response.
  static async drawLottery (id) {
    try {
      const response = await this.request({ auth: true }).put(`${this.entity}/lottery-draw/${id}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
