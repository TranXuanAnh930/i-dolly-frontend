/**
 * toast notification store
 */
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toastsList: []
  }),

  actions: {
    add (payload) {
      const toast = {
        id: new Date().getTime(),
        message: typeof payload === 'string' ? payload : payload.message,
        type: payload.type || 'default',
        duration: payload.duration || 5000
      }
      if (payload.type === 'error') {
        console.error(payload.message)
      }
      this.toastsList.push(toast)
    },
    remove (id) {
      this.toastsList = this.toastsList.filter(toast => toast.id !== id)
    },
    clear () {
      this.toastsList = []
    }
  }
})
