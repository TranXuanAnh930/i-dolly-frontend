<template>
  <div class="login-page">
    <div class="login-card">
      <div class="badge" aria-hidden="true">
        <BowIcon class="badge__icon"/>
      </div>

      <p class="eyebrow">{{ $t('forgotPassword.eyebrow') }}</p>
      <h1 class="title">{{ $t('forgotPassword.title') }}</h1>
      <p class="subtitle">{{ $t('forgotPassword.subtitle') }}</p>

      <form v-if="!sent" class="form" @submit.prevent="submit">
        <label class="field">
          <span class="field__label">{{ $t('common.email') }}</span>
          <div class="field__control">
            <svg class="field__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="16" height="12" rx="2.5" stroke="currentColor" stroke-width="1.6"/>
              <path d="M3 5.5 10 11 17 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input id="email" type="text" v-model="email" placeholder="you@example.com" autocomplete="username">
          </div>
        </label>

        <p class="form-error" v-if="error" :key="error">{{ error }}</p>

        <button type="submit" class="submit-btn" :disabled="sending">{{ sending ? $t('common.saving') : $t('forgotPassword.submit') }}</button>
      </form>

      <div v-else class="sent-note">
        <p>{{ $t('forgotPassword.sentMessage', { email }) }}</p>
        <router-link to="/reset-password" class="submit-btn sent-note__cta">{{ $t('forgotPassword.haveToken') }}</router-link>
      </div>

      <p class="register-link">
        <router-link to="/login">{{ $t('forgotPassword.backToLogin') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { UsersService } from '@/services/auth/users.service'
import BowIcon from '@/components/icons/BowIcon.vue'

export default {
  name: 'ForgotPasswordPage',

  components: { BowIcon },

  data () {
    return {
      email: '',
      sending: false,
      sent: false,
      error: ''
    }
  },

  methods: {
    async submit () {
      if (!/^\S+@\S+\.\S+$/.test(this.email)) {
        this.error = this.$t('register.errorEmail')
        return
      }
      this.error = ''
      this.sending = true
      try {
        await UsersService.forgotPassword(this.email)
        this.sent = true
      } catch (error) {
        this.error = error.message
      } finally {
        this.sending = false
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
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
