import { defineStore } from 'pinia'

import { NotificationService } from '@/services/account/notification.service'
import { useUserStore } from '../auth/user'

// api-spec.md §7's suggested range is 15-30s; 20s splits the difference.
const POLL_INTERVAL_MS = 20000

// Module-level, not store state — a setInterval id and a DOM event
// listener reference aren't plain reactive data, and Pinia is a singleton
// per app anyway, so there's only ever one poll loop to track.
let pollTimer = null
let visibilityHandler = null

// Real notifications — short-polling since there's no WebSocket/SSE layer.
// Not actually fan-only server-side: managers get lottery_draw_triggered/
// _failed rows too (concert_service.notify_managers_of_draw_trigger/
// _failure), so this polls for manager/admin sessions as well, not just
// fan ones. Only GET /notifications/unread-count is actually polled; the
// heavier GET /notifications/mine is fetched only when that count goes up,
// never on every tick.
export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items: [],
    unreadCount: 0,
    loading: false,
    error: null
  }),

  getters: {
    sorted (state) {
      return [...state.items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
  },

  actions: {
    // The cheap poll target — see startPolling(). Escalates to fetchMine()
    // only when the count actually increased, per the spec's "only fetch
    // the heavier endpoint when the count goes up."
    async pollUnreadCount () {
      const user = useUserStore().currentUser
      if (!user.id) return
      try {
        const previous = this.unreadCount
        const response = await NotificationService.getUnreadCount()
        this.unreadCount = response.data.count
        if (this.unreadCount > previous) await this.fetchMine()
      } catch (error) {
        // A 429 here just means this poll cadence overlapped with another
        // tab's (or itself) — not a real error per api-spec.md §7, so it's
        // swallowed rather than surfaced like every other action's errors.
        if (error.status === 429) return
        this.error = error.message
      }
    },

    async fetchMine () {
      this.loading = true
      try {
        const response = await NotificationService.getMine()
        this.items = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async markRead (id) {
      try {
        const response = await NotificationService.markRead(id)
        const index = this.items.findIndex(item => item.id === id)
        const wasUnread = index !== -1 && !this.items[index].is_read
        if (index !== -1) this.items[index] = response.data
        if (wasUnread) this.unreadCount = Math.max(0, this.unreadCount - 1)
      } catch (error) {
        this.error = error.message
      }
    },

    async markAllRead () {
      try {
        await NotificationService.markAllRead()
        this.items = this.items.map(item => ({ ...item, is_read: true }))
        this.unreadCount = 0
      } catch (error) {
        this.error = error.message
      }
    },

    // Called once from Header.vue (mounted for the whole session) on app
    // boot if already logged in, and again on an interactive login. Fires
    // an immediate poll rather than waiting out the first interval, then
    // pauses/resumes around tab visibility so a backgrounded tab isn't
    // still hitting the server every 20s (api-spec.md §7).
    startPolling () {
      const user = useUserStore().currentUser
      if (!user.id) return
      this.stopPolling()
      this.pollUnreadCount()
      pollTimer = setInterval(() => this.pollUnreadCount(), POLL_INTERVAL_MS)
      visibilityHandler = () => {
        if (document.hidden) {
          if (pollTimer) {
            clearInterval(pollTimer)
            pollTimer = null
          }
        } else if (!pollTimer) {
          this.pollUnreadCount()
          pollTimer = setInterval(() => this.pollUnreadCount(), POLL_INTERVAL_MS)
        }
      }
      document.addEventListener('visibilitychange', visibilityHandler)
    },

    stopPolling () {
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler)
        visibilityHandler = null
      }
    },

    clearOnLogout () {
      this.stopPolling()
      this.items = []
      this.unreadCount = 0
      this.error = null
    }
  }
})
