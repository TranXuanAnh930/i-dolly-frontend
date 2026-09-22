import { defineStore } from 'pinia'

import { ConcertsService } from '@/services/events/concerts.service'

// One in-flight request per concert id. Several callers routinely ask for the
// same concert in the same tick — HistoryPage resolves every lottery entry's
// context in parallel and a fan's entries often share a concert — so they wait
// on one request instead of each firing their own.
const inFlightById = new Map()

// A by-id cache of individual concerts, and nothing else. Every list view has
// its own page-shaped endpoint (concerts.service.js's getEventsPagePublic /
// getDetailPublic / getManagerEventsPagePublic), and the settings pages call
// ConcertsService directly for mutations — so the only job left for this store
// is answering "which concert is this ticket/lottery entry for?", a single-row
// lookup. That's TicketDetailsPage and lotteryEntries.resolveContext; it used
// to answer them by pulling /concerts/all plus /venues/all, a pair of full
// table reads for one title.
export const useConcertsStore = defineStore('concerts', {
  state: () => ({
    concertsById: {},
    error: null
  }),

  getters: {
    // Coerced to string on both sides — callers may pass a route param, which
    // is always a string, against an id that came back from the API.
    concertById: (state) => (id) => state.concertsById[String(id)] || null
  },

  actions: {
    // Loads one concert unless it's already cached. Resolves either way, so a
    // caller can await it and then read concertById without branching.
    ensureConcert (id) {
      if (!id) return Promise.resolve(null)

      const key = String(id)
      if (this.concertsById[key]) return Promise.resolve(this.concertsById[key])
      if (inFlightById.has(key)) return inFlightById.get(key)

      const request = ConcertsService.getByIdPublic(id)
        .then(response => {
          this.concertsById[key] = response.data
          return response.data
        })
        .catch(error => {
          this.error = error.message
          return null
        })
        .finally(() => inFlightById.delete(key))

      inFlightById.set(key, request)
      return request
    }
  }
})
