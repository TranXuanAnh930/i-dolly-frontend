<template>
  <div class="session-restore">
    <div class="card" role="status" aria-live="polite">
      <p class="card__eyebrow">{{ $t('sessionRestore.eyebrow') }}</p>
      <h1 class="card__title">{{ $t('sessionRestore.title') }}</h1>
      <p class="card__reason">{{ reason }}</p>
      <p class="card__countdown">{{ retrying ? $t('sessionRestore.retrying') : $t('sessionRestore.retryingIn', { seconds: secondsLeft }) }}</p>

      <div class="card__actions">
        <button type="button" class="card__retry" :disabled="retrying" @click="retry">{{ $t('sessionRestore.retryNow') }}</button>
        <button type="button" class="card__login" @click="logInAgain">{{ $t('sessionRestore.logInAgain') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { AuthService } from '@/services/auth/auth.service'
import { useAuthStore } from '@/store/auth/auth'

// Shown by AppLayout in place of a page that needs a signed-in user, while
// a stored session couldn't be loaded yet (the refresh was rate limited,
// the server was unreachable or errored) — see AuthService.restoreSession.
// The session may still be valid, so instead of sending the fan to login
// this retries on its own once authStore.sessionRestore.retryAt passes,
// and reloads the current route when it succeeds.
export default {
  name: 'SessionRestoreNotice',

  data () {
    return {
      now: Date.now(),
      retrying: false,
      timer: null
    }
  },

  computed: {
    restore () {
      return useAuthStore().sessionRestore
    },
    secondsLeft () {
      return Math.max(0, Math.ceil((this.restore.retryAt - this.now) / 1000))
    },
    reason () {
      const error = this.restore.error
      if (error && error.status === 429) return this.$t('sessionRestore.reasonBusy')
      if (error && error.isNetworkError) return this.$t('sessionRestore.reasonOffline')
      return this.$t('sessionRestore.reasonGeneric')
    }
  },

  mounted () {
    this.timer = setInterval(() => {
      this.now = Date.now()
      if (this.secondsLeft === 0 && !this.retrying) this.retry()
    }, 1000)
  },

  beforeUnmount () {
    clearInterval(this.timer)
  },

  methods: {
    async retry () {
      if (this.retrying) return
      this.retrying = true
      const restored = await AuthService.restoreSession()
      this.retrying = false
      this.now = Date.now()
      // force: re-run the route guards for the same location, now that the
      // user (and role) is loaded.
      if (restored) {
        const { path, query, hash } = this.$route
        this.$router.replace({ path, query, hash, force: true }).catch(() => {})
      }
    },
    logInAgain () {
      AuthService.expireSession()
    }
  }
}
</script>

<style lang="scss" scoped>
.session-restore {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 16px 100px;
}

.card {
  width: 100%;
  max-width: 460px;
  background: $color-white;
  border-radius: 24px;
  padding: 32px 28px;
  text-align: center;
  box-shadow: 0 20px 40px -24px rgba($color-brand, .35);
}

.card__eyebrow {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: $color-brand;
}

.card__title {
  margin-top: 6px;
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(24px, 5vw, 32px);
  line-height: 1.2;
  color: $color-ink;
}

.card__reason {
  margin-top: 12px;
  font-family: $font-content;
  font-size: 14px;
  line-height: 1.5;
  color: $color-ink;
}

.card__countdown {
  margin-top: 8px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-brand;
}

.card__actions {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.card__retry,
.card__login {
  border-radius: 999px;
  padding: 12px 22px;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
}

.card__retry {
  border: none;
  background: $color-brand;
  color: $color-white;

  &:disabled {
    opacity: .5;
    cursor: default;
  }
}

.card__login {
  border: 2px solid $color-brand;
  background: transparent;
  color: $color-brand;
}
</style>
