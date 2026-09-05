import { defineStore } from 'pinia'

import { IdolsService } from '@/services/idols.service'
import { GroupsService } from '@/services/groups.service'
import { IdolColorsService } from '@/services/idolColors.service'
import { IdolPositionsService } from '@/services/idolPositions.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { createQueue } from '@/utils/concurrencyQueue'

// A members grid can mount 20+ IdolCards at once, each requesting its own
// idol's positions (no bulk route exists) — cap how many of those run
// concurrently so the page doesn't trip the backend's rate limiter.
const enqueuePositionsFetch = createQueue(4)

export const useIdolsStore = defineStore('idols', {
  state: () => ({
    idols: [],
    groups: [],
    colors: [],
    // Positions are scoped to one idol (no `/all` route) — fetched lazily
    // per idol card/detail view and cached here by idol id.
    positionsByIdol: {},
    loading: false,
    loaded: false,
    error: null
  }),

  getters: {
    groupById: (state) => (id) => state.groups.find(group => group.id === id),
    // Coerced to string on both sides — callers may pass a route param
    // (always a string) against idol.id (a number straight from the API).
    idolById: (state) => (id) => state.idols.find(idol => String(idol.id) === String(id)),
    membersOfGroup: (state) => (groupId) => state.idols.filter(idol => idol.group_id === groupId),

    positionsForIdol: (state) => (idolId) => state.positionsByIdol[idolId] || [],
    // The role shown front-and-center on a card — the is_primary credit,
    // falling back to whichever came back first if none is flagged.
    primaryPositionForIdol (state) {
      return (idolId) => {
        const positions = state.positionsByIdol[idolId] || []
        const primary = positions.find(p => p.is_primary)
        return (primary || positions[0] || {}).position || null
      }
    },

    // Idols carry a real color_id → idol_colors.hex_code; fall back to the
    // shared palette (by idol id) when none is set.
    colorForIdol: (state) => (idol) => {
      const match = idol && idol.color_id ? state.colors.find(c => c.id === idol.color_id) : null
      const hex = match ? match.hex_code : paletteColorForId(idol ? idol.id : 0)
      return { hex, text: contrastTextColor(hex) }
    },

    // Groups have no color of their own in this API — always the palette
    // fallback, keyed by group id so it's stable across reloads.
    colorForGroup: () => (group) => {
      const hex = paletteColorForId(group ? group.id : 0)
      return { hex, text: contrastTextColor(hex) }
    }
  },

  actions: {
    async fetchAll ({ force = false } = {}) {
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        const [idolsRes, groupsRes, colorsRes] = await Promise.all([
          IdolsService.getAllPublic(),
          GroupsService.getAllPublic(),
          IdolColorsService.getAllPublic()
        ])
        this.idols = idolsRes.data
        this.groups = groupsRes.data
        this.colors = colorsRes.data
        this.loaded = true
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Positions for one idol — fetched on demand by IdolCard/IdolDetailPage
    // rather than upfront for every idol in fetchAll.
    async fetchPositionsForIdol (idolId, { force = false } = {}) {
      if (!force && this.positionsByIdol[idolId]) return
      try {
        const response = await enqueuePositionsFetch(() => IdolPositionsService.getForIdolPublic(idolId))
        this.positionsByIdol[idolId] = response.data
      } catch (error) {
        this.error = error.message
      }
    }
  }
})
