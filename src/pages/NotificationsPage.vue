<template>
  <div class="notifications-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('notifications.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('notifications.title') }}</h1>
        <p class="hero__sub">{{ $t('notifications.sub') }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <div class="panel">
        <div class="panel__header">
          <span class="panel__count">{{ $t('notifications.entries', { count: items.length }) }}</span>
          <button v-if="unreadCount" type="button" class="mark-read-btn" @click="markAllRead">{{ $t('notifications.markAllRead') }}</button>
        </div>

        <div v-if="items.length" class="list">
          <router-link
            v-for="item in items"
            :key="item.id"
            :to="linkFor(item)"
            class="item"
            :class="{ 'is-unread': !item.is_read }"
            @click="onItemClick(item)">
            <span class="item__icon" :class="`item__icon--${iconType(item)}`">
              <svg v-if="iconType(item) === 'order'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 6.5h10l-.8 8.5a1.5 1.5 0 0 1-1.5 1.4H7.3a1.5 1.5 0 0 1-1.5-1.4L5 6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M7 6.5V5a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="iconType(item) === 'ticket'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 17 6v1.5a1.5 1.5 0 0 0 0 3V14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14v-3.5a1.5 1.5 0 0 0 0-3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M11 5v10" stroke="currentColor" stroke-width="1.5" stroke-dasharray="1.6 1.6" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="iconType(item) === 'lottery-won'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path fill="currentColor" d="M10 2 11.9 7.1 17.5 7.5 13.2 11 14.5 16.5 10 13.3 5.5 16.5 6.8 11 2.5 7.5 8.1 7.1 10 2Z"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </span>

            <span class="item__body">
              <span class="item__top">
                <span class="item__title">{{ notificationTitle(item) }}</span>
                <span class="item__time">{{ formatTimestamp(item.created_at) }}</span>
              </span>
              <span class="item__message">{{ notificationMessage(item) }}</span>
            </span>
          </router-link>
        </div>

        <div v-else class="empty-state">
          <p class="empty-state__title">{{ $t('notifications.empty') }}</p>
          <p class="empty-state__hint">{{ $t('notifications.emptyHint') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { parseISO } from 'date-fns'

import { useNotificationStore } from '@/store/notifications'
import { useLotteryEntriesStore } from '@/store/lotteryEntries'
import { formatDate } from '@/utils/format'
import { notificationIconType, notificationLink, notificationTitleKey, notificationMessageKey, isLotteryWin } from '@/utils/notification'

export default {
  name: 'NotificationsPage',

  computed: {
    notifications () {
      return useNotificationStore()
    },
    items () {
      return this.notifications.sorted
    },
    unreadCount () {
      return this.notifications.unreadCount
    }
  },

  created () {
    this.notifications.fetchMine()
  },

  methods: {
    markAllRead () {
      this.notifications.markAllRead()
    },
    onItemClick (item) {
      if (!item.is_read) this.notifications.markRead(item.id)
    },
    formatTimestamp (timestamp) {
      return formatDate(parseISO(timestamp), 'MMM d, yyyy · h:mm a')
    },
    iconType (item) {
      return notificationIconType(item, isLotteryWin(item, useLotteryEntriesStore()))
    },
    linkFor (item) {
      return notificationLink(item)
    },
    notificationTitle (item) {
      return this.$t(notificationTitleKey(item, isLotteryWin(item, useLotteryEntriesStore())))
    },
    notificationMessage (item) {
      return this.$t(notificationMessageKey(item, isLotteryWin(item, useLotteryEntriesStore())))
    }
  }
}
</script>

<style lang="scss" scoped>
.notifications-page {
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
  font-size: clamp(34px, 6vw, 48px);
  color: $color-brand;
}

.hero__sub {
  margin-top: 10px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-font-main;
}

.content {
  padding-bottom: 90px;
}

.panel {
  background: $color-white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid $color-line;
}

.panel__count {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;
}

.mark-read-btn {
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

.list {
  display: flex;
  flex-direction: column;
}

.item {
  display: flex;
  gap: 14px;
  padding: 18px 22px;
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

.item__icon {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }

  &--order,
  &--ticket {
    background: $color-brand-tint;
    color: $color-brand;
  }

  &--lottery-won {
    background: #e6f7ef;
    color: #147a52;
  }

  &--lottery-lost {
    background: $color-gray-50;
    color: $color-gray-400;
  }
}

.item__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.item__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;

  @include media_mobile {
    flex-direction: column;
    gap: 2px;
  }
}

.item__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
}

.item__time {
  flex: none;
  font-family: $font-content;
  font-size: 11.5px;
  color: $color-gray-400;
  white-space: nowrap;
}

.item__message {
  font-family: $font-content;
  font-size: 13px;
  line-height: 1.5;
  color: $color-font-main;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  color: $color-ink;
}

.empty-state__hint {
  margin-top: 6px;
  font-family: $font-content;
  font-size: 13px;
  color: $color-gray-500;
}
</style>
