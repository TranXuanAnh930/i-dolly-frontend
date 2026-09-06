<template>
  <UiOnClickOutside :do="close">
    <div class="more-menu">
      <button type="button" class="more-menu__trigger" aria-label="More" @click="toggle">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </button>

      <div v-if="open" class="more-menu__panel">
        <router-link v-if="$currentUser.id" to="/history" class="more-menu__item" @click="close">
          <span class="more-menu__icon">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10.5" r="7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M10 6.5v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="more-menu__text">
            <span class="more-menu__title">{{ $t('menu.history.title') }}</span>
            <span class="more-menu__desc">{{ $t('menu.history.desc') }}</span>
          </span>
        </router-link>

        <router-link v-if="$currentUser.id" to="/account" class="more-menu__item" @click="close">
          <span class="more-menu__icon">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="6.5" r="3.2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3.5 17c.7-3.4 3.6-5.5 6.5-5.5s5.8 2.1 6.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="more-menu__text">
            <span class="more-menu__title">{{ $t('menu.accountSettings.title') }}</span>
            <span class="more-menu__desc">{{ $t('menu.accountSettings.desc') }}</span>
          </span>
        </router-link>

        <router-link to="/contact" class="more-menu__item" @click="close">
          <span class="more-menu__icon">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="3.5" y="4.5" width="13" height="11" rx="1.8" stroke="currentColor" stroke-width="1.5"/>
              <path d="M4 6l6 4.5L16 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="more-menu__text">
            <span class="more-menu__title">{{ $t('menu.contact.title') }}</span>
            <span class="more-menu__desc">{{ $t('menu.contact.desc') }}</span>
          </span>
        </router-link>

        <router-link to="/guidelines" class="more-menu__item" @click="close">
          <span class="more-menu__icon">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="4" y="3" width="12" height="14" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 7h6M7 10h6M7 13h3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="more-menu__text">
            <span class="more-menu__title">{{ $t('menu.guidelines.title') }}</span>
            <span class="more-menu__desc">{{ $t('menu.guidelines.desc') }}</span>
          </span>
        </router-link>

        <router-link to="/about" class="more-menu__item" @click="close">
          <span class="more-menu__icon">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M10 9v4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="10" cy="6.7" r=".9" fill="currentColor"/>
            </svg>
          </span>
          <span class="more-menu__text">
            <span class="more-menu__title">{{ $t('menu.about.title') }}</span>
            <span class="more-menu__desc">{{ $t('menu.about.desc') }}</span>
          </span>
        </router-link>
      </div>
    </div>
  </UiOnClickOutside>
</template>

<script>
import UiOnClickOutside from './UiOnClickOutside.vue'

export default {
  name: 'UiHeaderDropdownMenu',

  components: { UiOnClickOutside },

  data () {
    return {
      open: false
    }
  },

  methods: {
    toggle () {
      this.open = !this.open
    },
    close () {
      this.open = false
    }
  }
}
</script>

<style lang="scss" scoped>
.more-menu {
  position: relative;
}

.more-menu__trigger {
  display: flex;
  border: none;
  background: none;
  padding: 0;
  color: $color-white;
  cursor: pointer;

  svg {
    width: 22px;
    height: 22px;
  }

  &:hover {
    opacity: .8;
  }
}

.more-menu__panel {
  position: absolute;
  top: calc(100% + 14px);
  right: -10px;
  width: 260px;
  max-width: calc(100vw - 20px);
  background: $color-white;
  border-radius: 16px;
  box-shadow: 0 20px 40px -14px rgba($color-ink, .35);
  overflow: hidden;
  z-index: 10;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.more-menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  border-radius: 10px;
  text-decoration: none;
  transition: background .12s ease;

  &:hover {
    background: $color-gray-50;
  }
}

.more-menu__icon {
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: $color-brand-tint;
  color: $color-brand;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 17px;
    height: 17px;
  }
}

.more-menu__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.more-menu__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13.5px;
  color: $color-ink;
}

.more-menu__desc {
  font-family: $font-content;
  font-size: 11.5px;
  color: $color-gray-400;
}
</style>
