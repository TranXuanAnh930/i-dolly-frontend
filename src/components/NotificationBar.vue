<template>
  <div v-if="visible" class="notification-bar">
    <div class="wrapper notification-bar__inner">
      <router-link to="/store" class="notification-bar__message">
        <span class="notification-bar__icon">🎵</span>
        {{ $t('notificationBar.message') }}
      </router-link>
      <button type="button" class="notification-bar__close" aria-label="Dismiss" @click="dismiss">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 3 13 13M13 3 3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
const STORAGE_KEY = 'i-dolly-notice-dismissed'

export default {
  name: 'NotificationBar',

  data () {
    return {
      visible: true
    }
  },

  created () {
    try {
      this.visible = localStorage.getItem(STORAGE_KEY) !== 'true'
    } catch {
      this.visible = true
    }
  },

  methods: {
    dismiss () {
      this.visible = false
      try {
        localStorage.setItem(STORAGE_KEY, 'true')
      } catch {
        // ignore — storage may be unavailable
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-bar {
  background: #f2b705;
}

.notification-bar__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 10px;
}

.notification-bar__message {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-ink;
  text-align: center;

  &:hover {
    text-decoration: underline;
  }
}

.notification-bar__icon {
  flex: none;
}

.notification-bar__close {
  flex: none;
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
  color: $color-ink;
  opacity: .6;
  display: flex;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    opacity: 1;
  }
}
</style>
