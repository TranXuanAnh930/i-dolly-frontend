import { defineStore } from 'pinia'

import { ConcertsService } from '@/services/events/concerts.service'
import { VenuesService } from '@/services/events/venues.service'
import { TicketTypesService } from '@/services/events/ticketTypes.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'

// Module-level, not store state — several independent callers (Header on
// mount/login, plus whichever page is loading) can all call fetchAll()
// before the first one finishes and flips `loaded`; without this, each of
// those callers fires its own concerts/all+venues/all pair instead of
// sharing the one already in flight.
let fetchAllPromise = null

// The generic concert/venue collection — every customer-facing page and the
// manager/admin settings pages all have their own page-shaped endpoint
// instead (services/concerts.service.js's getEventsPagePublic/
// getDetailPublic/getManagerEventsPagePublic, and the settings pages call
// ConcertsService directly for mutations rather than through this store),
// so this store's only remaining consumer is TicketPurchasePage.
export const useConcertsStore = defineStore('concerts', {
  state: () => ({
    concerts: [],
    venues: [],
    // Ticket types stay scoped to one concert (no bulk route) — fetched
    // on demand by the event-detail/ticket-purchase pages and cached here
    // by concert id.
    ticketTypesByConcert: {},
    loading: false,
    loaded: false,
    error: null
  }),

  getters: {
    venueById: (state) => (id) => state.venues.find(venue => venue.id === id),
    // Coerced to string on both sides — callers may pass a route param
    // (always a string) against concert.id (a number straight from the API).
    concertById: (state) => (id) => state.concerts.find(concert => String(concert.id) === String(id)),
    ticketTypesForConcert: (state) => (concertId) => state.ticketTypesByConcert[concertId] || [],

    // Concerts carry no color of their own — same stable palette fallback
    // as an unthemed group (see store/idols.js).
    colorForConcert: () => (concert) => {
      const hex = paletteColorForId(concert ? concert.id : 0)
      return { hex, text: contrastTextColor(hex) }
    }
  },

  actions: {
    async fetchAll ({ force = false } = {}) {
      if (this.loaded && !force) return
      if (fetchAllPromise) return fetchAllPromise
      this.loading = true
      this.error = null
      fetchAllPromise = (async () => {
        try {
          const [concertsRes, venuesRes] = await Promise.all([
            ConcertsService.getAllPublic(),
            VenuesService.getAllPublic()
          ])
          this.concerts = concertsRes.data
          this.venues = venuesRes.data
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

    // Ticket types for one concert — fetched on demand by the event-detail
    // and ticket-purchase pages rather than upfront for every concert in
    // fetchAll.
    async fetchTicketTypesForConcert (concertId, { force = false } = {}) {
      if (!force && this.ticketTypesByConcert[concertId]) return
      try {
        const response = await TicketTypesService.getByConcertPublic(concertId)
        this.ticketTypesByConcert[concertId] = response.data
      } catch (error) {
        this.error = error.message
      }
    }
  }
})
