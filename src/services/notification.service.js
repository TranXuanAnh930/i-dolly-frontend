import { BaseService } from './base.service'

// Wraps /notifications — see docs/api-spec.md §7 in the backend repo for
// the full polling contract: no WebSocket/SSE layer exists, so a client
// polls GET /notifications/unread-count on an interval and only fetches
// the heavier GET /notifications/mine when the count goes up. See
// store/notifications.js for where that polling loop actually lives.
export class NotificationService extends BaseService {
  static get entity () {
    return 'notifications'
  }

  // GET /notifications/unread-count — auth required, fan-only server-side.
  // Cheap, meant to be polled; rate-limited at 30 req/60s per user — a 429
  // here means this client (or another tab) is polling too aggressively,
  // not a real error, so callers shouldn't surface it to the user.
  static async getUnreadCount () {
    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/unread-count`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /notifications/mine — auth required. 404s when the fan has no
  // notifications at all (also true for unreadOnly with zero matches) —
  // treated as an empty list like every other list endpoint here.
  static async getMine ({ unreadOnly = false } = {}) {
    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/mine`, { params: { unread_only: unreadOnly } })
      return this.responseWrapper(response, response.data)
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return this.responseWrapper(error.response, [])
      }
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // POST /notifications/{id}/read — auth required. Returns the updated
  // NotificationRead (is_read/read_at now set).
  static async markRead (id) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/${id}/read`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // POST /notifications/read-all — auth required.
  static async markAllRead () {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/read-all`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
