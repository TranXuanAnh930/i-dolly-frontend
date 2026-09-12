import { defineStore } from 'pinia'

import { LotteryService } from '@/services/lottery.service'
import { TicketTypesService } from '@/services/ticketTypes.service'
import { useUserStore } from './user'
import { useConcertsStore } from './concerts'

// Real lottery entries, fan-account-only server-side — mirrors
// ordersStore/ticketsStore exactly (see their own comments for why there's
// no local/guest equivalent).
export const useLotteryEntriesStore = defineStore('lotteryEntries', {
  state: () => ({
    items: [],
    loading: false,
    loaded: false,
    error: null,
    // LotteryEntryRead only carries campaign_id — no nested campaign or
    // ticket_type, and LotteryCampaignRead only carries ticket_type_id, not
    // the tier itself (see lottery.service.js). Resolving an entry down to
    // a human-readable "tier · concert" takes two more round trips
    // (campaign, then ticket_type); cached here by id so listing several
    // entries in History doesn't refetch the same campaign/ticket_type
    // over and over.
    campaignsById: {},
    ticketTypesById: {}
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
      this.loading = true
      this.error = null
      try {
        const response = await LotteryService.getMyEntries()
        this.items = response.data
        this.loaded = true
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Called right after a successful apply() — the entry we just created
    // is already known in full, so cache it directly instead of waiting on
    // a refetch to see it show up in history.
    add (entry) {
      this.items = [entry, ...this.items.filter(item => item.id !== entry.id)]
    },

    // Resolves one entry down to { campaign, ticketType, concert } for
    // display — concert comes from concertsStore (already loaded app-wide),
    // campaign/ticketType are fetched once and cached above.
    async resolveContext (entry) {
      if (!entry) return null

      let campaign = this.campaignsById[entry.campaign_id]
      if (!campaign) {
        const response = await LotteryService.getCampaignPublic(entry.campaign_id)
        campaign = response.data
        this.campaignsById[campaign.id] = campaign
      }

      let ticketType = this.ticketTypesById[campaign.ticket_type_id]
      if (!ticketType) {
        const response = await TicketTypesService.getByIdPublic(campaign.ticket_type_id)
        ticketType = response.data
        this.ticketTypesById[ticketType.id] = ticketType
      }

      const concertsStore = useConcertsStore()
      await concertsStore.fetchAll()
      const concert = concertsStore.concertById(ticketType.concert_id)

      return { campaign, ticketType, concert }
    },

    clearOnLogout () {
      this.items = []
      this.loaded = false
      this.error = null
      this.campaignsById = {}
      this.ticketTypesById = {}
    }
  }
})
