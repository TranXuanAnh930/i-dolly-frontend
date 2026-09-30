import { defineStore } from 'pinia'

import { UsersService } from '@/services/auth/users.service'
import { useToastStore } from '../toast'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: {
      id: '',
      role: '',
      company_id: null,
      name: '',
      email: ''
    }
  }),

  actions: {
    // throwOnError: for a caller that handles the failure itself
    // (AuthService.restoreSession) instead of the default error toast.
    async getCurrent ({ throwOnError = false } = {}) {
      try {
        const user = await UsersService.getCurrent()
        this.currentUser = user.data
      } catch (error) {
        if (throwOnError) throw error
        useToastStore().add({ type: 'error', message: error.message })
      }
    },
    setCurrentUser (userData) {
      this.currentUser = userData
    }
  }
})
