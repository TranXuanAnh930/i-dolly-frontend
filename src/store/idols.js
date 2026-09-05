import { defineStore } from 'pinia'

import { IdolsService } from '@/services/idols.service'
import { GroupsService } from '@/services/groups.service'
import { IdolColorsService } from '@/services/idolColors.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'

// The generic idol/group collection — Members/Store/Events/Groups grids and
// the idol/product/event/group detail pages all have their own page-shaped
// endpoint instead (services/idols.service.js's getMembersPagePublic/
// getDetailPublic, etc.), so this store's only remaining consumers are the
// manager/admin CRUD pages (ManagerIdolsPage, ManagerGroupsPage, their form
// pages) and catalogStore's colorForRelease — neither needs positions data,
// so it isn't fetched here.
export const useIdolsStore = defineStore('idols', {
  state: () => ({
    idols: [],
    groups: [],
    colors: [],
    loading: false,
    loaded: false,
    error: null
  }),

  getters: {
    groupById: (state) => (id) => state.groups.find(group => group.id === id),
    // Coerced to string on both sides — callers may pass a route param
    // (always a string) against idol.id (a number straight from the API).
    idolById: (state) => (id) => state.idols.find(idol => String(idol.id) === String(id)),

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

    // Manager/admin mutations (ManagerIdolsPage, ManagerGroupsPage) — errors
    // are left to bubble up to the calling form rather than caught here, so
    // the page can show them inline next to the field that failed.
    async createIdol (fields) {
      await IdolsService.create(fields)
      await this.fetchAll({ force: true })
    },
    async updateIdol (id, fields) {
      await IdolsService.update(id, fields)
      await this.fetchAll({ force: true })
    },
    async removeIdol (id) {
      await IdolsService.remove(id)
      await this.fetchAll({ force: true })
    },
    async createGroup (fields) {
      await GroupsService.create(fields)
      await this.fetchAll({ force: true })
    },
    async updateGroup (id, fields) {
      await GroupsService.update(id, fields)
      await this.fetchAll({ force: true })
    },
    async removeGroup (id) {
      await GroupsService.remove(id)
      await this.fetchAll({ force: true })
    }
  }
})
