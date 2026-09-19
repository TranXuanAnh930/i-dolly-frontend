import { BaseService } from '../base.service'

// Wraps /payment — only the bits a "paypal" gateway checkout needs once
// order.service.js's checkout() / ticket.service.js's checkout() has
// already returned a "pending" order/ticket (see docs/api-spec.md §6's
// redirect + capture flow). The "mock" gateway never touches this service
// at all — it resolves synchronously inside the checkout call itself.
export class PaymentService extends BaseService {
  static get entity () {
    return 'payment'
  }

  // PATCH /payment/status/order/{id} — re-fetches the Payment row for a
  // just-created pending order so the buyer can be sent to
  // pg_approval_url (PayPal's own approval page).
  static async getOrderStatus (orderId) {
    try {
      const response = await this.request({ auth: true }).patch(`${this.entity}/status/order/${orderId}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // PATCH /payment/status/ticket/{id} — same, for a pending direct-sale
  // ticket purchase.
  static async getTicketStatus (ticketId) {
    try {
      const response = await this.request({ auth: true }).patch(`${this.entity}/status/ticket/${ticketId}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // POST /payment/paypal/capture/{pg_order_id} — finalizes the payment once
  // PayPal redirects the buyer back with ?token=&PayerID= (token IS the
  // pg_order_id). Returns the updated PaymentResponse — whichever of
  // order_id/ticket_id is set says what this payment was for, since PayPal
  // itself never tells the frontend which kind of purchase this was.
  static async capturePaypal (pgOrderId) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/paypal/capture/${pgOrderId}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
