<template>
  <div v-if="order" class="order-details-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <router-link to="/history" class="back-link">&larr; {{ $t('orderDetails.backToHistory') }}</router-link>
        <p class="hero__eyebrow">{{ $t('orderDetails.title') }}</p>
        <h1 class="hero__title">{{ order.detail.orderNumber }}</h1>
        <p class="hero__meta">{{ formatTimestamp(order.timestamp) }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <section class="block">
        <h2 class="block__title">{{ $t('orderDetails.items') }}</h2>
        <div class="section-rule"></div>

        <div class="lines">
          <component
            :is="line.productId ? 'router-link' : 'div'"
            v-for="line in order.detail.lines"
            :key="line.productId || line.name"
            :to="line.productId ? `/products/${line.productId}` : undefined"
            class="line">
            <span class="line__info">
              <span class="line__name">{{ line.name }}</span>
              <span class="line__qty">&times;{{ line.qty }}</span>
            </span>
            <span class="line__price">&yen;{{ formatNumber(line.price * line.qty) }}</span>
          </component>
        </div>

        <div class="summary-row summary-row--total">
          <span>{{ $t('orderDetails.total') }}</span>
          <span>&yen;{{ formatNumber(order.detail.subtotal) }}</span>
        </div>
      </section>
    </div>
  </div>

  <div v-else class="not-found">
    <p class="not-found__title">{{ $t('orderDetails.notFound') }}</p>
    <router-link to="/history" class="not-found__link">&larr; {{ $t('orderDetails.backToHistory') }}</router-link>
  </div>
</template>

<script>
import { parseISO } from 'date-fns'

import { useNotificationStore } from '@/store/notifications'
import { formatDate, formatNumber } from '@/utils/format'

export default {
  name: 'OrderDetailsPage',

  props: {
    orderNumber: { type: String, required: true }
  },

  computed: {
    order () {
      const item = useNotificationStore().byOrderNumber(this.orderNumber)
      return item && item.type === 'order' ? item : null
    }
  },

  watch: {
    order: {
      immediate: true,
      handler (order) {
        if (order) document.title = `${order.detail.orderNumber} | I-Dolly`
      }
    }
  },

  methods: {
    formatNumber,
    formatTimestamp (timestamp) {
      return formatDate(parseISO(timestamp), 'MMM d, yyyy · h:mm a')
    }
  }
}
</script>

<style lang="scss" scoped>
.order-details-page {
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
}

.block {
  background: $color-white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  max-width: 560px;
}

.block__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 20px;
  color: $color-ink;
}

.section-rule {
  margin-top: 8px;
  margin-bottom: 16px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, $color-brand, #f2b705, #1f8fd6, #b6379c, #1fa876);
}

.lines {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: $color-line;
  border: 1px solid $color-line;
  border-radius: 14px;
  overflow: hidden;
}

.line {
  background: $color-white;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  transition: background .12s ease;

  &:where(a):hover {
    background: $color-gray-50;
  }
}

.line__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.line__name {
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
}

.line__qty {
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-400;
}

.line__price {
  flex: none;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14px;
  color: $color-ink;
  font-variant-numeric: tabular-nums;
}

.summary-row {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  font-family: $font-content;
  font-size: 13.5px;
  color: $color-font-main;

  &--total {
    padding-top: 14px;
    border-top: 1px solid $color-line;
    font-weight: 900;
    font-size: 17px;
    color: $color-ink;
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
