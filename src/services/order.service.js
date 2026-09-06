import { BaseService } from './base.service'

// POST /order/checkout — fan-account-only server-side (a manager/admin or
// guest attempt 403s via FanOnlyPurchaseError). Returns the full created
// Order (id, status, items, shippingstatus, shippingaddress). The mock
// payment gateway always responds 200 — even a declined payment (simulate
// succ:false) comes back as a normal Order, just with status:"cancelled" —
// so callers must branch on `order.status`, not on the HTTP status, to know
// whether the payment actually went through.
export class OrderService extends BaseService {
  static get entity () {
    return 'order'
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

  // GET /order/fetch_placed_order — every order this fan has ever placed
  // (each with items/shippingstatus/shippingaddress already populated, same
  // as checkout's response). 404s on no orders yet — treated as an empty
  // list like every other list endpoint here.
  static async fetchAll () {
    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/fetch_placed_order`)
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
