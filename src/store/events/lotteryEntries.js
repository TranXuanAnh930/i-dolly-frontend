import { defineStore } from 'pinia'

import { LotteryService } from '@/services/events/lottery.service'
import { useUserStore } from '../auth/user'
import { useConcertsStore } from './concerts'

// Module-level, not store state — Header (on mount/login) and whichever
// page is loading (e.g. HistoryPage) can both call fetchAll() before the
// first finishes and flips `loaded`; shared here so the second caller
// awaits the same request instead of firing its own /lottery_entries/mine.
let fetchAllPromise = null

// Real lottery entries, fan-account-only server-side — mirrors
// ordersStore/ticketsStore exactly (see their own comments for why there's
// no local/guest equivalent).
export const useLotteryEntriesStore = defineStore('lotteryEntries', {
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
    byId: (state) => (id) => state.items.find(entry => entry.id === id)
  },

  actions: {
    async fetchAll ({ force = false } = {}) {
      const user = useUserStore().currentUser
      if (!user.id || user.role !== 'fan') return
      if (this.loaded && !force) return
      if (fetchAllPromise) return fetchAllPromise
      this.loading = true
      this.error = null
      fetchAllPromise = (async () => {
        try {
          const response = await LotteryService.getMyEntries()
          this.items = response.data
          this.loaded = true
        } catch (error) {
          this.error = error.message
        } finally {
          this.loading = false
          fetchAllPromise = null
        }
      })()
      return fetchAllPromise
    },

    // Called right after a successful apply() — the entry we just created
    // is already known in full, so cache it directly instead of waiting on
    // a refetch to see it show up in history.
    add (entry) {
      this.items = [entry, ...this.items.filter(item => item.id !== entry.id)]
    },

    // Resolves one entry down to { campaign, ticketType, concert } for
    // display. GET /lottery_entries/mine now embeds campaign (and campaign
    // embeds ticket_type) directly, so this used to take two extra
    // round-trips per entry (campaign, then ticket_type) and now takes
    // none — only the concert lookup remains, and that's a cached,
    // already-loaded-app-wide read, not a fresh fetch.
    async resolveContext (entry) {
      if (!entry) return null

      const { campaign } = entry
      const { ticket_type: ticketType } = campaign

      const concertsStore = useConcertsStore()
      await concertsStore.ensureConcert(ticketType.concert_id)
      const concert = concertsStore.concertById(ticketType.concert_id)

      return { campaign, ticketType, concert }
    },

    clearOnLogout () {
      this.items = []
      this.loaded = false
      this.error = null
    }
  }
})
