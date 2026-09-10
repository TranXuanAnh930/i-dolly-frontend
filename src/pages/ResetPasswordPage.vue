<template>
  <div class="login-page">
    <div class="login-card">
      <div class="badge" aria-hidden="true">
        <BowIcon class="badge__icon"/>
      </div>

      <p class="eyebrow">{{ $t('resetPassword.eyebrow') }}</p>
      <h1 class="title">{{ $t('resetPassword.title') }}</h1>
      <p class="subtitle">{{ $t('resetPassword.subtitle') }}</p>

      <form v-if="!done" class="form" @submit.prevent="submit">
        <label class="field">
          <span class="field__label">{{ $t('resetPassword.token') }}</span>
          <div class="field__control">
            <svg class="field__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="3" y="8" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.6"/>
              <path d="M6 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <input id="token" type="text" v-model="token" :placeholder="$t('resetPassword.tokenPlaceholder')" autocomplete="one-time-code">
          </div>
        </label>

        <label class="field">
          <span class="field__label">{{ $t('resetPassword.newPassword') }}</span>
          <div class="field__control">
            <svg class="field__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="4" y="9" width="12" height="9" rx="2.2" stroke="currentColor" stroke-width="1.6"/>
              <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              :placeholder="$t('register.passwordPlaceholder')"
              autocomplete="new-password">
            <button type="button" class="field__toggle" @click="showPassword = !showPassword" :aria-label="showPassword ? $t('common.hidePassword') : $t('common.showPassword')">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <circle cx="10" cy="10" r="2.4" stroke="currentColor" stroke-width="1.5"/>
                <line v-if="!showPassword" x1="3" y1="17" x2="17" y2="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </label>

        <label class="field">
          <span class="field__label">{{ $t('common.confirmPassword') }}</span>
          <div class="field__control">
            <svg class="field__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="4" y="9" width="12" height="9" rx="2.2" stroke="currentColor" stroke-width="1.6"/>
              <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <input id="confirm" :type="showPassword ? 'text' : 'password'" v-model="confirmPassword" :placeholder="$t('register.confirmPasswordPlaceholder')" autocomplete="new-password">
          </div>
        </label>

        <p class="form-error" v-if="error" :key="error">{{ error }}</p>

        <button type="submit" class="submit-btn" :disabled="saving">{{ saving ? $t('common.saving') : $t('resetPassword.submit') }}</button>
      </form>

      <div v-else class="sent-note">
        <p>{{ $t('resetPassword.successMessage') }}</p>
        <router-link to="/login" class="submit-btn sent-note__cta">{{ $t('resetPassword.goToLogin') }}</router-link>
      </div>

      <p class="register-link" v-if="!done">
        {{ $t('resetPassword.noToken') }} <router-link to="/forgot-password">{{ $t('resetPassword.requestOne') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { UsersService } from '@/services/users.service'
import BowIcon from '@/components/icons/BowIcon.vue'

export default {
  name: 'ResetPasswordPage',

  components: { BowIcon },

  data () {
    return {
      token: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      saving: false,
      done: false,
      error: ''
    }
  },

  methods: {
    async submit () {
      if (!this.token.trim()) {
        this.error = this.$t('resetPassword.errorTokenRequired')
        return
      }
      if (this.password.length < 6) {
        this.error = this.$t('register.errorPasswordLength')
        return
      }
      if (this.password !== this.confirmPassword) {
        this.error = this.$t('register.errorPasswordMatch')
        return
      }
      this.error = ''
      this.saving = true
      try {
        await UsersService.setPassword(this.token.trim(), this.password)
        this.done = true
      } catch (error) {
        this.error = error.status === 401 ? this.$t('resetPassword.errorInvalidToken') : error.message
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  flex: 1;
  min-height: 520px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background: $color-white;
  border-radius: 28px;
  padding: 44px 36px 36px;
  box-shadow: 0 30px 60px -24px rgba($color-brand, .3), 0 10px 24px -10px rgba($color-ink, .15);
}

.badge {
  position: absolute;
  top: -26px;
  right: 28px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #e4007f, #f2b705, #1f8fd6, #b6379c, #1fa876, #e4007f);
  padding: 3px;
  animation: spin 10s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.badge__icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: $color-brand;
  color: $color-white;
  padding: 15px;
  box-sizing: border-box;
}

.eyebrow {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: $color-gray-400;
}

.title {
  margin-top: 6px;
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: 34px;
  color: $color-brand;
  transform: rotate(-1.5deg);
  transform-origin: left center;
}

.subtitle {
  margin-top: 10px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-font-main;
}

.form {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  color: $color-gray-500;
}

.field__control {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid $color-line;
  border-radius: 999px;
  padding: 12px 18px;
  transition: border-color .15s ease, box-shadow .15s ease;

  &:focus-within {
    border-color: $color-brand;
    box-shadow: 0 0 0 4px $color-brand-tint;
  }
}

.field__icon {
  width: 18px;
  height: 18px;
  flex: none;
  color: $color-gray-300;
}

.field__control input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;

  &::placeholder {
    color: $color-gray-300;
  }
}

.field__toggle {
  flex: none;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: $color-gray-300;
  display: flex;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: $color-gray-500;
  }
}

.form-error {
  background: #fdeaf1;
  color: $color-error;
  border-radius: 12px;
  padding: 10px 14px;
  font-family: $font-content;
  font-size: 13px;
  font-weight: 700;
  animation: shake .4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(3px); }
}

.submit-btn {
  margin-top: 4px;
  border: none;
  border-radius: 999px;
  padding: 14px;
  background: $color-brand;
  color: $color-white;
  font-family: $font-content;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: block;
  transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .55);

  &:hover {
    background: $color-brand-deep;
    transform: translateY(-2px);
    box-shadow: 0 14px 24px -8px rgba($color-brand, .6);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: .6;
    cursor: default;
    transform: none;
  }
}

.sent-note {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  p {
    font-family: $font-content;
    font-size: 14px;
    color: $color-font-main;
    line-height: 1.5;
  }
}

.register-link {
  margin-top: 20px;
  text-align: center;
  font-family: $font-content;
  font-size: 13px;
  color: $color-gray-500;

  a {
    color: $color-brand;
    font-weight: 700;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
