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

  // GET /order/manager-orders-page — manager/admin only. Paginated
  // (page/limit query params), newest-first, `{page, limit, count, data}`
  // envelope like /products/pagination. Unlike the other manager-*-page
  // bundles (idols/groups/products), this one requires auth since orders
  // carry real customer purchase history — company_id is only honored
  // server-side for an admin (a manager is always scoped to their own
  // company_id regardless of what's passed).
  static async getManagerOrdersPage ({ companyId, page = 1, limit = 10 } = {}) {
    try {
      const params = { page, limit }
      if (companyId) params.company_id = companyId
      const response = await this.request({ auth: true }).get(`${this.entity}/manager-orders-page`, { params })
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
