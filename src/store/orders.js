import { defineStore } from 'pinia'

import { OrderService } from '@/services/order.service'
import { useUserStore } from './user'

// Real orders, fan-account-only server-side — mirrors cartStore's
// isServerBacked split, but there's no local/guest equivalent here at all
// (an order without a real backend record makes no sense), so a non-fan or
// guest session just always sees an empty list.
export const useOrdersStore = defineStore('orders', {
  state: () => ({
    items: [],
    loading: false,
    loaded: false,
    error: null
  }),

  getters: {
    sorted (state) {
      return [...state.items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
    byId: (state) => (id) => state.items.find(order => order.id === id)
  },

  actions: {
    async fetchAll ({ force = false } = {}) {
      const user = useUserStore().currentUser
      if (!user.id || user.role !== 'fan') return
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        const response = await OrderService.fetchAll()
        this.items = response.data
        this.loaded = true
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Called right after a successful checkout — the order we just placed
    // is already known in full, so cache it directly instead of waiting on
    // a refetch to see it show up in history.
    add (order) {
      this.items = [order, ...this.items.filter(item => item.id !== order.id)]
    },

    clearOnLogout () {
      this.items = []
      this.loaded = false
      this.error = null
    }
  }
})
