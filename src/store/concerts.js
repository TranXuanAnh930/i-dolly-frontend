import { defineStore } from 'pinia'

import { ConcertsService } from '@/services/concerts.service'
import { VenuesService } from '@/services/venues.service'
import { TicketTypesService } from '@/services/ticketTypes.service'
import { ConcertPerformersService } from '@/services/concertPerformers.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { useIdolsStore } from './idols'

export const useConcertsStore = defineStore('concerts', {
  state: () => ({
    concerts: [],
    venues: [],
    // Ticket types and performers are scoped to one concert (no /all
    // route for either) — fetched lazily per event-detail visit and
    // cached here by concert id rather than eagerly with fetchAll.
    ticketTypesByConcert: {},
    performersByConcert: {},
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
    performersForConcert: (state) => (concertId) => state.performersByConcert[concertId] || [],

    // Every idol appearing at a concert: a group performer expands to that
    // whole group's current members, a solo performer is just that one
    // idol — de-duplicated in case the same idol shows up via both a solo
    // and a group credit.
    lineupForConcert () {
      return (concertId) => {
        const idolsStore = useIdolsStore()
        const seen = new Set()
        const lineup = []
        this.performersForConcert(concertId).forEach(performer => {
          const idols = performer.group_id
            ? idolsStore.membersOfGroup(performer.group_id)
            : [idolsStore.idolById(performer.idol_id)].filter(Boolean)
          idols.forEach(idol => {
            if (seen.has(idol.id)) return
            seen.add(idol.id)
            lineup.push(idol)
          })
        })
        return lineup
      }
    },

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

    // Ticket types + performers for one concert — fetched on demand by the
    // event-detail and ticket-purchase pages rather than upfront for every
    // concert in fetchAll.
    async fetchConcertExtras (concertId, { force = false } = {}) {
      if (!force && this.ticketTypesByConcert[concertId] && this.performersByConcert[concertId]) return
      try {
        const [ticketTypesRes, performersRes] = await Promise.all([
          TicketTypesService.getByConcertPublic(concertId),
          ConcertPerformersService.getByConcertPublic(concertId)
        ])
        this.ticketTypesByConcert[concertId] = ticketTypesRes.data
        this.performersByConcert[concertId] = performersRes.data
      } catch (error) {
        this.error = error.message
      }
    }
  }
})
