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

      <div class="panel">
        <h2 class="panel__title">{{ $t('account.preferences') }}</h2>
        <div class="section-rule"></div>

        <div class="pref-list">
          <label class="pref">
            <span class="pref__text">
              <span class="pref__title">{{ $t('account.lotteryAlertsTitle') }}</span>
              <span class="pref__desc">{{ $t('account.lotteryAlertsDesc') }}</span>
            </span>
            <span class="switch" :class="{ 'is-on': prefs.lotteryAlerts }" @click="prefs.lotteryAlerts = !prefs.lotteryAlerts">
              <span class="switch__knob"></span>
            </span>
          </label>

          <label class="pref">
            <span class="pref__text">
              <span class="pref__title">{{ $t('account.orderReceiptsTitle') }}</span>
              <span class="pref__desc">{{ $t('account.orderReceiptsDesc') }}</span>
            </span>
            <span class="switch" :class="{ 'is-on': prefs.orderReceipts }" @click="prefs.orderReceipts = !prefs.orderReceipts">
              <span class="switch__knob"></span>
            </span>
          </label>

          <label class="pref">
            <span class="pref__text">
              <span class="pref__title">{{ $t('account.releaseAlertsTitle') }}</span>
              <span class="pref__desc">{{ $t('account.releaseAlertsDesc') }}</span>
            </span>
            <span class="switch" :class="{ 'is-on': prefs.releaseAlerts }" @click="prefs.releaseAlerts = !prefs.releaseAlerts">
              <span class="switch__knob"></span>
            </span>
          </label>
        </div>

        <button type="button" class="save-btn" @click="savePreferences">{{ $t('account.savePreferences') }}</button>
      </div>
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
      prefs: {
        lotteryAlerts: true,
        orderReceipts: true,
        releaseAlerts: false
      }
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
    savePreferences () {
      useToastStore().add({ type: 'success', message: this.$t('account.preferencesSaved') })
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

.pref-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pref {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid $color-line;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
}

.pref__text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pref__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13.5px;
  color: $color-ink;
}

.pref__desc {
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-500;
}

.switch {
  flex: none;
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: $color-gray-100;
  position: relative;
  transition: background .15s ease;

  &.is-on {
    background: $color-brand;
  }
}

.switch__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: $color-white;
  box-shadow: 0 1px 3px rgba($color-ink, .3);
  transition: transform .15s ease;

  .is-on & {
    transform: translateX(18px);
  }
}
</style>
