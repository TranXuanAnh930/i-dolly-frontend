<template>
  <div v-if="entry" class="lottery-details-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <router-link to="/history" class="back-link">&larr; {{ $t('lotteryDetails.backToHistory') }}</router-link>
        <p class="hero__eyebrow">{{ $t('lotteryDetails.title') }}</p>
        <h1 class="hero__title">{{ entry.detail.orderNumber }}</h1>
        <p class="hero__meta">{{ formatTimestamp(entry.timestamp) }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <span class="status-badge" :class="`status-badge--${entry.type}`">{{ statusLabel }}</span>

      <div class="info-table">
        <div class="info-row">
          <span class="info-row__label">{{ $t('lotteryDetails.event') }}</span>
          <span class="info-row__value">
            <router-link v-if="entry.detail.concertId" :to="`/events/${entry.detail.concertId}`" class="info-row__link">{{ entry.detail.concertTitle }}</router-link>
            <template v-else>{{ entry.detail.concertTitle }}</template>
          </span>
        </div>
        <div class="info-row" v-if="entry.detail.tier">
          <span class="info-row__label">{{ $t('lotteryDetails.tier') }}</span>
          <span class="info-row__value">{{ entry.detail.tier }}</span>
        </div>
        <div class="info-row" v-if="entry.detail.qty">
          <span class="info-row__label">{{ $t('lotteryDetails.quantity') }}</span>
          <span class="info-row__value">{{ entry.detail.qty }}</span>
        </div>
      </div>

      <router-link v-if="entry.detail.concertId" :to="`/events/${entry.detail.concertId}`" class="cta-btn">{{ $t('lotteryDetails.viewEvent') }}</router-link>
    </div>
  </div>

  <div v-else class="not-found">
    <p class="not-found__title">{{ $t('lotteryDetails.notFound') }}</p>
    <router-link to="/history" class="not-found__link">&larr; {{ $t('lotteryDetails.backToHistory') }}</router-link>
  </div>
</template>

<script>
import { parseISO } from 'date-fns'

import { useNotificationStore } from '@/store/notifications'
import { formatDate } from '@/utils/format'

const LOTTERY_TYPES = ['lottery-entry', 'lottery-won', 'lottery-lost']

export default {
  name: 'LotteryResultDetailsPage',

  props: {
    orderNumber: { type: String, required: true }
  },

  computed: {
    entry () {
      const item = useNotificationStore().byOrderNumber(this.orderNumber)
      return item && LOTTERY_TYPES.includes(item.type) ? item : null
    },
    statusLabel () {
      if (!this.entry) return ''
      if (this.entry.type === 'lottery-won') return this.$t('lotteryDetails.statusWon')
      if (this.entry.type === 'lottery-lost') return this.$t('lotteryDetails.statusLost')
      return this.$t('lotteryDetails.statusPending')
    }
  },

  watch: {
    entry: {
      immediate: true,
      handler (entry) {
        if (entry) document.title = `${entry.detail.orderNumber} | I-Dolly`
      }
    }
  },

  methods: {
    formatTimestamp (timestamp) {
      return formatDate(parseISO(timestamp), 'MMM d, yyyy · h:mm a')
    }
  }
}
</script>

<style lang="scss" scoped>
.lottery-details-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 24px 0 36px;
}

.back-link {
  display: inline-block;
  color: $color-gray-500;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;

  &:hover {
    color: $color-brand;
  }
}

.hero__eyebrow {
  margin-top: 16px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: $color-gray-400;
}

.hero__title {
  margin-top: 4px;
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(28px, 5vw, 40px);
  color: $color-brand;
}

.hero__meta {
  margin-top: 8px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13.5px;
  color: $color-font-main;
}

.content {
  padding-bottom: 90px;
  max-width: 480px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 14px;
  margin-bottom: 16px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .02em;

  &--lottery-entry {
    background: #e9f2fb;
    color: #2a6fa8;
  }

  &--lottery-won {
    background: #e6f7ef;
    color: #147a52;
  }

  &--lottery-lost {
    background: $color-gray-50;
    color: $color-gray-500;
  }
}

.info-table {
  background: $color-white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
}

.info-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid $color-line;

  &:last-child {
    border-bottom: none;
  }

  @include media_mobile {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

.info-row__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-brand;
}

.info-row__value {
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
}

.info-row__link {
  color: $color-ink;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    color: $color-brand;
    text-decoration: underline;
  }
}

.cta-btn {
  margin-top: 20px;
  display: inline-block;
  border: none;
  border-radius: 999px;
  padding: 13px 28px;
  background: $color-brand;
  color: $color-white;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14.5px;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

  &:hover {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }
}

.not-found {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 20px;
  text-align: center;
}

.not-found__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  color: $color-ink;
}

.not-found__link {
  color: $color-brand;
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
