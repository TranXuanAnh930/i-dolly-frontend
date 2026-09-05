<template>
  <div class="account-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('account.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('account.title') }}</h1>
      </div>
    </section>

    <div class="wrapper content">
      <form class="panel" @submit.prevent="saveProfile">
        <h2 class="panel__title">{{ $t('account.profile') }}</h2>
        <div class="section-rule"></div>

        <div class="field-grid">
          <label class="field">
            <span class="field__label">{{ $t('common.name') }}</span>
            <input type="text" v-model="profile.name" placeholder="Your name">
          </label>
          <label class="field">
            <span class="field__label">{{ $t('common.email') }}</span>
            <input type="text" v-model="profile.email" placeholder="you@example.com">
          </label>
        </div>

        <button type="submit" class="save-btn">{{ $t('account.saveChanges') }}</button>
      </form>

      <form class="panel" @submit.prevent="changePassword">
        <h2 class="panel__title">{{ $t('account.password') }}</h2>
        <div class="section-rule"></div>

        <div class="field-grid">
          <label class="field field--full">
            <span class="field__label">{{ $t('account.currentPassword') }}</span>
            <input :type="showPasswords ? 'text' : 'password'" v-model="password.current" autocomplete="current-password">
          </label>
        </div>

        <div class="field-grid field-grid--spaced">
          <label class="field">
            <span class="field__label">{{ $t('account.newPassword') }}</span>
            <input :type="showPasswords ? 'text' : 'password'" v-model="password.next" autocomplete="new-password">
          </label>
          <label class="field">
            <span class="field__label">{{ $t('account.confirmNewPassword') }}</span>
            <input :type="showPasswords ? 'text' : 'password'" v-model="password.confirm" autocomplete="new-password">
          </label>
        </div>

        <button type="button" class="show-password-toggle" @click="showPasswords = !showPasswords">
          {{ showPasswords ? $t('common.hidePassword') : $t('common.showPassword') }}
        </button>

        <p class="form-error" v-if="passwordError" :key="passwordError">{{ passwordError }}</p>

        <button type="submit" class="save-btn">{{ $t('account.changePassword') }}</button>
      </form>

      <form class="panel" @submit.prevent="saveAddress">
        <h2 class="panel__title">{{ $t('account.shippingAddress') }}</h2>
        <div class="section-rule"></div>

        <div class="field-grid">
          <label class="field field--full">
            <span class="field__label">{{ $t('common.address') }}</span>
            <input type="text" v-model="address.street" :placeholder="$t('common.streetAddress')" autocomplete="street-address">
          </label>
          <label class="field">
            <span class="field__label">{{ $t('common.city') }}</span>
            <input type="text" v-model="address.city" :placeholder="$t('common.city')" autocomplete="address-level2">
          </label>
          <label class="field">
            <span class="field__label">{{ $t('common.postalCode') }}</span>
            <input type="text" v-model="address.postalCode" placeholder="000-0000" autocomplete="postal-code">
          </label>
        </div>

        <p class="form-error" v-if="addressError" :key="addressError">{{ addressError }}</p>

        <button type="submit" class="save-btn">{{ $t('account.saveAddress') }}</button>
      </form>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/store/user'
import { useToastStore } from '@/store/toast'

export default {
  name: 'AccountSettingsPage',

  data () {
    return {
      profile: {
        name: '',
        email: ''
      },
      password: {
        current: '',
        next: '',
        confirm: ''
      },
      showPasswords: false,
      passwordError: '',
      address: {
        street: '',
        city: '',
        postalCode: ''
      },
      addressError: ''
    }
  },

  created () {
    if (this.$currentUser.name) this.profile.name = this.$currentUser.name
    if (this.$currentUser.email) this.profile.email = this.$currentUser.email
  },

  methods: {
    saveProfile () {
      // This boilerplate has no real "update profile" endpoint yet — mocked
      // so the flow can be demoed end to end, same as Register/Checkout.
      useUserStore().setCurrentUser({ ...this.$currentUser, ...this.profile })
      useToastStore().add({ type: 'success', message: this.$t('account.profileSaved') })
    },
    changePassword () {
      if (!this.password.current.trim()) {
        this.passwordError = this.$t('account.errorCurrentPassword')
        return
      }
      if (this.password.next.length < 6) {
        this.passwordError = this.$t('register.errorPasswordLength')
        return
      }
      if (this.password.next !== this.password.confirm) {
        this.passwordError = this.$t('register.errorPasswordMatch')
        return
      }

      // No real "change password" endpoint yet — mocked, same as the rest
      // of this page.
      this.passwordError = ''
      this.password = { current: '', next: '', confirm: '' }
      useToastStore().add({ type: 'success', message: this.$t('account.passwordChanged') })
    },
    saveAddress () {
      if (!this.address.street.trim() || !this.address.city.trim() || !this.address.postalCode.trim()) {
        this.addressError = this.$t('account.errorAddress')
        return
      }

      this.addressError = ''
      useToastStore().add({ type: 'success', message: this.$t('account.addressSaved') })
    }
  }
}
</script>

<style lang="scss" scoped>
.account-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 40px 0 40px;
}

.hero__eyebrow {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: $color-brand;
  margin-bottom: 8px;
}

.hero__title {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(30px, 5vw, 44px);
  color: $color-brand;
}

.content {
  padding-bottom: 90px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.panel {
  background: $color-white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
}

.panel__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 20px;
  color: $color-ink;
}

.section-rule {
  margin-top: 8px;
  margin-bottom: 18px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, $color-brand, #f2b705, #1f8fd6, #b6379c, #1fa876);
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @include media_mobile {
    grid-template-columns: 1fr;
  }

  &--spaced {
    margin-top: 14px;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--full {
    grid-column: 1 / -1;
  }
}

.field__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  color: $color-gray-500;
}

.field input {
  border: 1.5px solid $color-line;
  border-radius: 12px;
  padding: 11px 14px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;

  &::placeholder {
    color: $color-gray-300;
  }

  &:focus {
    border-color: $color-brand;
    box-shadow: 0 0 0 4px $color-brand-tint;
  }
}

.save-btn {
  margin-top: 18px;
  border: none;
  border-radius: 999px;
  padding: 12px 26px;
  background: $color-brand;
  color: $color-white;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

  &:hover {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }
}

.show-password-toggle {
  display: block;
  margin-top: 10px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12.5px;
  color: $color-brand;

  &:hover {
    text-decoration: underline;
  }
}

.form-error {
  margin-top: 14px;
  background: #fdeaf1;
  color: $color-error;
  border-radius: 12px;
  padding: 10px 14px;
  font-family: $font-content;
  font-size: 13px;
  font-weight: 700;
}
</style>
