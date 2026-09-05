import { defineStore } from 'pinia'

const STORAGE_KEY = 'i-dolly-notifications'

// seeded so the dropdown/history page have something to show on first visit —
// purchase notifications are added for real from Checkout
const SEED = [
  {
    id: 'seed-lottery-1',
    type: 'lottery-won',
    titleKey: 'notifications.seedLotteryResultTitle',
    messageKey: 'notifications.seedLotteryWonMessage',
    messageParams: { event: 'Nova Iris Anniversary Live 2026' },
    to: '/events/nova-anniversary-2026',
    timestamp: '2026-09-01T10:00:00',
    read: false
  },
  {
    id: 'seed-lottery-2',
    type: 'lottery-lost',
    titleKey: 'notifications.seedLotteryResultTitle',
    messageKey: 'notifications.seedLotteryLostMessage',
    messageParams: { event: 'Starlight Aria x Nova Iris: Collab Night' },
    to: '/events/aria-nova-collab-night',
    timestamp: '2026-08-28T14:30:00',
    read: true
  }
]

function loadItems () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : SEED
  } catch {
    return SEED
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
    }
  },

  actions: {
    add (notification) {
      this.items.unshift({
        id: `n-${Date.now()}`,
        read: false,
        timestamp: new Date().toISOString(),
        ...notification
      })
      saveItems(this.items)
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
    }
  }
})
