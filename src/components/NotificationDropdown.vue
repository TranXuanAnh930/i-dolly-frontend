<template>
  <UiOnClickOutside :do="close">
    <div class="notif">
      <button type="button" class="notif__trigger" :aria-label="$t('nav.notifications')" @click="toggle">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 3a4 4 0 0 1 4 4v2.2c0 1.3.4 2.6 1.2 3.6l.7.9a1 1 0 0 1-.8 1.6H4.9a1 1 0 0 1-.8-1.6l.7-.9c.8-1 1.2-2.3 1.2-3.6V7a4 4 0 0 1 4-4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M8 16.5a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span v-if="unreadCount" class="notif__badge">{{ unreadCount }}</span>
      </button>

      <div v-if="open" class="notif__panel">
        <div class="notif__header">
          <span>{{ $t('notifications.title') }}</span>
          <button v-if="unreadCount" type="button" class="notif__mark-read" @click="markAllRead">{{ $t('notifications.markAllRead') }}</button>
        </div>

        <div v-if="items.length" class="notif__list">
          <router-link
            v-for="item in items"
            :key="item.id"
            :to="linkFor(item)"
            class="notif__item"
            :class="{ 'is-unread': !item.is_read }"
            @click="onItemClick(item)">
            <span class="notif__icon" :class="`notif__icon--${iconType(item)}`">
              <svg v-if="iconType(item) === 'order'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 6.5h10l-.8 8.5a1.5 1.5 0 0 1-1.5 1.4H7.3a1.5 1.5 0 0 1-1.5-1.4L5 6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M7 6.5V5a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="iconType(item) === 'order-shipped'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 6.5 10 3l7 3.5v7L10 17l-7-3.5v-7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M3 6.5 10 10l7-3.5M10 10v7" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="iconType(item) === 'ticket'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 17 6v1.5a1.5 1.5 0 0 0 0 3V14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14v-3.5a1.5 1.5 0 0 0 0-3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M11 5v10" stroke="currentColor" stroke-width="1.5" stroke-dasharray="1.6 1.6" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="iconType(item) === 'lottery-won'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path fill="currentColor" d="M10 2 11.9 7.1 17.5 7.5 13.2 11 14.5 16.5 10 13.3 5.5 16.5 6.8 11 2.5 7.5 8.1 7.1 10 2Z"/>
              </svg>
              <svg v-else-if="iconType(item) === 'lottery-draw'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M16 6a6 6 0 1 0 .9 8.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M16 3v3.5h-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="iconType(item) === 'lottery-draw-failed'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 3 17.5 16H2.5L10 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M10 8.2v3.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="10" cy="13.7" r=".9" fill="currentColor"/>
              </svg>
              <svg v-else-if="iconType(item) === 'lottery-draw-done'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6.8 10.2 8.9 12.3 13.2 7.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </span>
            <span class="notif__body">
              <span class="notif__title">{{ notificationTitle(item) }}</span>
              <span class="notif__message">{{ notificationMessage(item) }}</span>
              <span class="notif__time">{{ relativeTime(item.created_at) }}</span>
            </span>
          </router-link>
        </div>
        <p v-else class="notif__empty">{{ $t('notifications.empty') }}</p>

        <router-link to="/notifications" class="notif__more" @click="close">{{ $t('notifications.more') }} &rarr;</router-link>
      </div>
    </div>
  </UiOnClickOutside>
</template>

<script>
import { parseISO } from 'date-fns'

import { useNotificationStore } from '@/store/account/notifications'
import { useLotteryEntriesStore } from '@/store/events/lotteryEntries'
import { formatRelativeTime } from '@/utils/format'
import { notificationIconType, notificationLink, notificationTitleKey, notificationMessageKey, isLotteryWin, lotteryResultTier } from '@/utils/notification'
import UiOnClickOutside from './UiOnClickOutside.vue'

export default {
  name: 'NotificationDropdown',

  components: { UiOnClickOutside },

  data () {
    return {
      open: false
    }
  },

  computed: {
    notifications () {
      return useNotificationStore()
    },
    items () {
      return this.notifications.sorted.slice(0, 5)
    },
    unreadCount () {
      return this.notifications.unreadCount
    }
  },

  methods: {
    toggle () {
      this.open = !this.open
      // Refreshes on every open rather than trusting the last poll's
      // snapshot — a notification marked read from another tab/device
      // wouldn't otherwise show up here until the count next changes.
      if (this.open) this.notifications.fetchMine()
    },
    close () {
      this.open = false
    },
    onItemClick (item) {
      if (!item.is_read) this.notifications.markRead(item.id)
      this.close()
    },
    markAllRead () {
      this.notifications.markAllRead()
    },
    relativeTime (timestamp) {
      return formatRelativeTime(parseISO(timestamp))
    },
    iconType (item) {
      return notificationIconType(item, isLotteryWin(item, useLotteryEntriesStore()))
    },
    linkFor (item) {
      return notificationLink(item)
    },
    notificationTitle (item) {
      return this.$t(notificationTitleKey(item, isLotteryWin(item, useLotteryEntriesStore())), { tier: lotteryResultTier(item, useLotteryEntriesStore()) })
    },
    notificationMessage (item) {
      return this.$t(notificationMessageKey(item, isLotteryWin(item, useLotteryEntriesStore())), { tier: lotteryResultTier(item, useLotteryEntriesStore()) })
    }
  }
}
</script>

<style lang="scss" scoped>
.notif {
  position: relative;
}

.notif__trigger {
  position: relative;
  display: flex;
  border: none;
  background: none;
  padding: 0;
  color: $color-white;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    opacity: .8;
  }
}

.notif__badge {
  position: absolute;
  top: -7px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 999px;
  background: #f2b705;
  color: $color-ink;
  font-family: $font-content;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
}

.notif__panel {
  position: absolute;
  top: calc(100% + 14px);
  right: -10px;
  width: 320px;
  max-width: calc(100vw - 20px);
  background: $color-white;
  border-radius: 16px;
  box-shadow: 0 20px 40px -14px rgba($color-ink, .35);
  overflow: hidden;
  z-index: 10;

  @include media_mobile {
    right: -60px;
  }
}

.notif__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid $color-line;
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
}

.notif__mark-read {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  color: $color-brand;

  &:hover {
    text-decoration: underline;
  }
}

.notif__list {
  max-height: 320px;
  overflow-y: auto;
}

.notif__item {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  text-decoration: none;
  border-bottom: 1px solid $color-line;
  transition: background .12s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: $color-gray-50;
  }

  &.is-unread {
    background: $color-brand-tint-2;
  }
}

.notif__icon {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 15px;
    height: 15px;
  }

  &--order,
  &--ticket {
    background: $color-brand-tint;
    color: $color-brand;
  }

  &--order-shipped {
    background: #e6f7ef;
    color: #147a52;
  }

  &--lottery-won {
    background: #e6f7ef;
    color: #147a52;
  }

  &--lottery-lost {
    background: $color-gray-50;
    color: $color-gray-400;
  }

  &--lottery-draw {
    background: $color-brand-tint;
    color: $color-brand;
  }

  &--lottery-draw-failed {
    background: #fdeceb;
    color: $color-error;
  }

  &--lottery-draw-done {
    background: #e6f7ef;
    color: #147a52;
  }
}

.notif__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.notif__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12.5px;
  color: $color-ink;
}

.notif__message {
  font-family: $font-content;
  font-size: 12.5px;
  line-height: 1.4;
  color: $color-font-main;
}

.notif__time {
  font-family: $font-content;
  font-size: 11px;
  color: $color-gray-400;
}

.notif__empty {
  padding: 24px 16px;
  text-align: center;
  font-family: $font-content;
  font-size: 13px;
  color: $color-gray-500;
}

.notif__more {
  display: block;
  text-align: center;
  padding: 12px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-brand;
  text-decoration: none;
  border-top: 1px solid $color-line;

  &:hover {
    background: $color-gray-50;
  }
}
</style>
