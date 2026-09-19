import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessTokenExpDate: ''
  }),

  actions: {
    setAccessTokenExpDate (expDate) {
      this.accessTokenExpDate = expDate
    }
  }
})
