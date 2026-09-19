import { defineStore } from 'pinia'

import { CompaniesService } from '@/services/members/companies.service'

// Admin-only (AdminCompaniesPage) — nothing on the public side reads
// company data directly, so this store exists solely for that page.
export const useCompaniesStore = defineStore('companies', {
  state: () => ({
    companies: [],
    loading: false,
    loaded: false,
    error: null
  }),

  actions: {
    async fetchAll ({ force = false } = {}) {
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        const response = await CompaniesService.getAllPublic()
        this.companies = response.data
        this.loaded = true
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createCompany (fields) {
      await CompaniesService.create(fields)
      await this.fetchAll({ force: true })
    },
    async updateCompany (id, fields) {
      await CompaniesService.update(id, fields)
      await this.fetchAll({ force: true })
    },
    async removeCompany (id) {
      await CompaniesService.remove(id)
      await this.fetchAll({ force: true })
    },
    // Doesn't touch `companies` state — this creates a user, not a company.
    async createManagerAccount (fields) {
      return CompaniesService.createManagerAccount(fields)
    }
  }
})
