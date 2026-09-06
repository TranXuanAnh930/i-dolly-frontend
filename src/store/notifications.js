import { defineStore } from 'pinia'

const STORAGE_KEY = 'i-dolly-notifications'

// order/ticket/lottery notifications are added for real from Checkout and
// TicketPurchasePage. `detail` carries the structured data their /history
// detail pages render (see OrderDetailsPage/TicketDetailsPage/
// LotteryResultDetailsPage).
function loadItems () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveItems (items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore — storage may be unavailable
  }
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items: loadItems()
  }),

  getters: {
    sorted (state) {
      return [...state.items].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    },
    unreadCount (state) {
      return state.items.filter(item => !item.read).length
    },
    // detail pages (OrderDetailsPage/TicketDetailsPage/LotteryResultDetailsPage)
    // are routed by order/entry number rather than the internal notification
    // id, since that's what the confirmation screen and history list both
    // already show the user.
    byOrderNumber: (state) => (orderNumber) => state.items.find(item => item.detail && item.detail.orderNumber === orderNumber)
  },

  actions: {
    add (notification) {
      const item = {
        id: `n-${Date.now()}`,
        read: false,
        timestamp: new Date().toISOString(),
        ...notification
      }
      this.items.unshift(item)
      saveItems(this.items)
      return item
    },
    markRead (id) {
      const item = this.items.find(i => i.id === id)
      if (!item) return
      item.read = true
      saveItems(this.items)
    },
    markAllRead () {
      this.items = this.items.map(item => ({ ...item, read: true }))
      saveItems(this.items)
    },
    // Called on logout, alongside cartStore.clearOnLogout() — history is
    // per-account, so the next person on this device (or a guest) shouldn't
    // see the previous fan's order/ticket/lottery notifications.
    clearOnLogout () {
      this.items = []
      saveItems(this.items)
    }
  }
})
