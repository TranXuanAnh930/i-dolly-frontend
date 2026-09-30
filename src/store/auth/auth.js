import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessTokenExpDate: '',
    // Set when a stored session couldn't be loaded (the refresh was rate
    // limited, the server was unreachable or errored) — the session may
    // still be perfectly valid, so this is NOT a logout. `retryAt` is when
    // it's worth trying again (the rate limit's own wait for a 429). See
    // AuthService.restoreSession and SessionRestoreNotice.vue.
    sessionRestore: {
      error: null,
      retryAt: 0
    }
  }),

  actions: {
    setAccessTokenExpDate (expDate) {
      this.accessTokenExpDate = expDate
    },
    setSessionRestoreFailed (error, retryAt) {
      this.sessionRestore = { error, retryAt }
    },
    clearSessionRestore () {
      this.sessionRestore = { error: null, retryAt: 0 }
    },
    // An action rather than a getter: it depends on the clock, which a
    // cached getter wouldn't re-read.
    isSessionRestoreBackingOff () {
      return this.sessionRestore.error !== null && Date.now() < this.sessionRestore.retryAt
    }
  }
})
