import { BaseService } from '../base.service'
import { toApiError } from '../apiError'

// POST /Cart/add_cart, GET /Cart/see_cart, DELETE /Cart/delete_cart/{cart_id}
// — all require auth, and are fan-account-only server-side (anything else
// 403s via FanOnlyPurchaseError). Note the capitalized "/Cart" prefix and
// the action-verb paths (add_cart/see_cart/delete_cart) — this entity
// predates and doesn't follow the {entity}/all convention every other
// service here uses, so this class doesn't lean on BaseService's generic
// getAllPublic/create/update/remove.
export class CartService extends BaseService {
  static get entity () {
    return 'cart'
  }

  // Adding an already-in-cart product increments its quantity server-side
  // rather than erroring — this doubles as the only way to increase a
  // line's quantity, since there's no separate "update quantity" endpoint.
  static async add (productId, quantity = 1) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/add_cart`, { product_id: productId, quantity })
      return this.responseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  // An empty cart is 200 {"items": [], "total_price": 0}, not an error.
  static async fetch () {
    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/see_cart`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  // Removes the whole line — there's no partial-quantity decrement, only
  // add (increment) and this (remove entirely).
  static async remove (cartId) {
    try {
      const response = await this.request({ auth: true }).delete(`${this.entity}/delete_cart/${cartId}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }
}
