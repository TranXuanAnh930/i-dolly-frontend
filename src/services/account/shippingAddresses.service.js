import { BaseService } from '../base.service'
import { toApiError } from '../apiError'

// POST /shipping_addresses/add, PUT .../update/{id}, DELETE .../delete/{id}
// — all require auth (any logged-in role), and already match BaseService's
// generic create/update/remove exactly, so only the reads are defined
// here. Every call is scoped to the caller's own addresses: update/delete
// 404 an id that isn't theirs, same as fetchById. ShippingAddress: id,
// user_id, address_line1, address_line2, city, postal_code (a plain string, 1-20 chars — hyphenated
// formats like "150-0001" are fine), state, country.
export class ShippingAddressesService extends BaseService {
  static get entity () {
    return 'shipping_addresses'
  }

  // GET /shipping_addresses/fetch — auth required. Named distinctly from
  // the inherited getAllPublic(), which would hit `shipping_addresses/all`
  // — a route that doesn't exist here; this entity uses /fetch instead of
  // the {entity}/all convention every public list in this app follows.
  static async fetchAll () {
    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/fetch`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  // GET /shipping_addresses/fetch_byid/{address_id} — auth required.
  // Returns only the caller's own address; any other id (including one
  // belonging to another user) 404s. The 404 is thrown as-is
  // (error.status === 404) for the caller to treat as "address not found".
  static async fetchById (id) {
    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/fetch_byid/${id}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
