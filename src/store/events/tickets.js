import { defineStore } from 'pinia'

import { TicketService } from '@/services/events/ticket.service'
import { useUserStore } from '../auth/user'

// Real tickets, fan-account-only server-side — mirrors ordersStore exactly
// (see its own comment for why there's no local/guest equivalent).
export const useTicketsStore = defineStore('tickets', {
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
    byId: (state) => (id) => state.items.find(ticket => ticket.id === id),
    // A lottery win creates a Ticket row pointing back at the LotteryEntry
    // that won it (see lotteryEntries store's comment on why that link
    // can't be read the other way round) — used by LotteryResultDetailsPage
    // to find the ticket a "Pay now" button should link to.
    byLotteryEntryId: (state) => (lotteryEntryId) => state.items.find(ticket => ticket.lottery_entry_id === lotteryEntryId)
  },

  actions: {
    async fetchAll ({ force = false } = {}) {
      const user = useUserStore().currentUser
      if (!user.id || user.role !== 'fan') return
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        const response = await TicketService.fetchAll()
        this.items = response.data
        this.loaded = true
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Called right after a successful checkout — the ticket we just bought
    // is already known in full, so cache it directly instead of waiting on
    // a refetch to see it show up in history.
    add (ticket) {
      this.items = [ticket, ...this.items.filter(item => item.id !== ticket.id)]
    },

    clearOnLogout () {
      this.items = []
      this.loaded = false
      this.error = null
    }
  }
})
