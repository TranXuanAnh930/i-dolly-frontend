import { defineStore } from 'pinia'

import { UsersService } from '@/services/users.service'
import { useToastStore } from './toast'

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
    async getCurrent () {
      try {
        const user = await UsersService.getCurrent()
        this.currentUser = user.data
      } catch (error) {
        useToastStore().add({ type: 'error', message: error.message })
      }
    },
    setCurrentUser (userData) {
      this.currentUser = userData
    }
  }
})
