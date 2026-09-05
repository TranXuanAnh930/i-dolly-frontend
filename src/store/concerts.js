import { defineStore } from 'pinia'

import { ConcertsService } from '@/services/concerts.service'
import { VenuesService } from '@/services/venues.service'
import { TicketTypesService } from '@/services/ticketTypes.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'

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
      this.loading = true
      this.error = null
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
      }
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
    },

    // Manager/admin mutations (ManagerEventsPage) — errors bubble up to the
    // calling form rather than being caught here.
    async createConcert (fields) {
      await ConcertsService.create(fields)
      await this.fetchAll({ force: true })
    },
    async updateConcert (id, fields) {
      await ConcertsService.update(id, fields)
      await this.fetchAll({ force: true })
    },
    async removeConcert (id) {
      await ConcertsService.remove(id)
      await this.fetchAll({ force: true })
    }
  }
})
