<template>
  <div class="history-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('history.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('history.title') }}</h1>
        <p class="hero__sub">{{ $t('history.sub') }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <div class="panel">
        <div class="panel__header">
          <span class="panel__count">{{ $t('history.entries', { count: items.length }) }}</span>
        </div>

        <div v-if="items.length" class="list">
          <router-link
            v-for="item in items"
            :key="item.id"
            :to="item.to || '#'"
            class="item">
            <span class="item__icon" :class="`item__icon--${item.type}`">
              <svg v-if="item.type === 'order'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 6.5h10l-.8 8.5a1.5 1.5 0 0 1-1.5 1.4H7.3a1.5 1.5 0 0 1-1.5-1.4L5 6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M7 6.5V5a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="item.type === 'ticket'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 17 6v1.5a1.5 1.5 0 0 0 0 3V14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14v-3.5a1.5 1.5 0 0 0 0-3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M11 5v10" stroke="currentColor" stroke-width="1.5" stroke-dasharray="1.6 1.6" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="item.type === 'lottery-won'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path fill="currentColor" d="M10 2 11.9 7.1 17.5 7.5 13.2 11 14.5 16.5 10 13.3 5.5 16.5 6.8 11 2.5 7.5 8.1 7.1 10 2Z"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </span>

            <span class="item__body">
              <span class="item__top">
                <span class="item__title">{{ notificationTitle(item) }}</span>
                <span class="item__time">{{ formatTimestamp(item.timestamp) }}</span>
              </span>
              <span class="item__message">{{ notificationMessage(item) }}</span>
            </span>
          </router-link>
        </div>

        <div v-else class="empty-state">
          <p class="empty-state__title">{{ $t('history.emptyTitle') }}</p>
          <p class="empty-state__hint">{{ $t('history.emptyHint') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { parseISO } from 'date-fns'

import { useOrdersStore } from '@/store/store/orders'
import { useTicketsStore } from '@/store/events/tickets'
import { useLotteryEntriesStore } from '@/store/events/lotteryEntries'
import { formatDate, formatNumber } from '@/utils/format'
import { withTax } from '@/utils/tax'

export default {
  name: 'HistoryPage',

  data () {
    return {
      lotteryContexts: {}
    }
  },

  async created () {
    // A no-op for guests/non-fan roles, and already loaded on every page
    // once Header's own fetch resolves — this just covers a direct/refresh
    // landing straight on this page.
    useOrdersStore().fetchAll()
    useTicketsStore().fetchAll()

    const lotteryEntriesStore = useLotteryEntriesStore()
    await lotteryEntriesStore.fetchAll()
    const contexts = {}
    await Promise.all(lotteryEntriesStore.items.map(async entry => {
      contexts[entry.id] = await lotteryEntriesStore.resolveContext(entry)
    }))
    this.lotteryContexts = contexts
  },

  computed: {
    // Real orders come from the backend (see ordersStore) while lottery
    // entries are still client-only (no backend for those yet) — mapped to
    // the same shape the list/icons below already render, then merged with
    // ticketItems and the notification store's entries and re-sorted.
    orderItems () {
      // A "pending" order only exists for a paypal checkout that hasn't been
      // approved/captured yet (docs/api-spec.md §6) — the mock gateway never
      // leaves an order in this state, so this used to be an unreachable
      // third case.
      return useOrdersStore().sorted.map(order => ({
        id: `order-${order.id}`,
        type: 'order',
        timestamp: order.created_at,
        to: `/history/orders/${order.id}`,
        titleKey: order.status === 'cancelled' ? 'history.orderCancelledTitle' : order.status === 'pending' ? 'history.orderPendingTitle' : 'history.orderPlacedTitle',
        messageKey: order.status === 'cancelled' ? 'history.orderCancelledMessage' : order.status === 'pending' ? 'history.orderPendingMessage' : 'history.orderPlacedMessage',
        messageParams: { orderNumber: order.id.slice(0, 8), amount: formatNumber(order.total_price) }
      }))
    },
    // Real tickets from the backend (see ticketsStore) — a still-unpaid
    // lottery win (status pending_payment) is left out here since the
    // lotteryItems entry below already covers it with a "pay now" link;
    // showing both would read as two contradictory entries for one ticket.
    ticketItems () {
      return useTicketsStore().sorted
        .filter(ticket => ticket.status !== 'pending_payment')
        .map(ticket => ({
          id: `ticket-${ticket.id}`,
          type: 'ticket',
          timestamp: ticket.created_at,
          to: `/history/tickets/${ticket.id}`,
          titleKey: ticket.status === 'cancelled' ? 'history.ticketCancelledTitle' : 'history.ticketPurchasedTitle',
          messageKey: ticket.status === 'cancelled' ? 'history.ticketCancelledMessage' : 'history.ticketPurchasedMessage',
          messageParams: { orderNumber: ticket.id.slice(0, 8), amount: formatNumber(withTax(ticket.ticket_type.price)) }
        }))
    },
    // Lottery entries come from the real backend too (see lotteryEntries
    // store), but need an async lookup to resolve tier/concert labels —
    // resolved contexts are cached in this.lotteryContexts by created().
    lotteryItems () {
      return useLotteryEntriesStore().sorted
        .map(entry => {
          const context = this.lotteryContexts[entry.id]
          if (!context) return null
          const tier = context.ticketType.tier.charAt(0).toUpperCase() + context.ticketType.tier.slice(1)
          const title = context.concert ? context.concert.title : ''
          const iconType = entry.status === 'won' ? 'lottery-won' : (entry.status === 'lost' || entry.status === 'expired') ? 'lottery-lost' : 'lottery-pending'
          const outcomeKey = entry.status === 'won' ? 'Won' : (entry.status === 'lost' || entry.status === 'expired') ? 'Lost' : 'Pending'
          return {
            id: `lottery-${entry.id}`,
            type: iconType,
            timestamp: entry.created_at,
            to: `/history/lottery/${entry.id}`,
            titleKey: `history.lottery${outcomeKey}Title`,
            messageKey: `history.lottery${outcomeKey}Message`,
            messageParams: { tier, title }
          }
        })
        .filter(Boolean)
    },
    // Every current notification type (order/ticket/lottery-payment
    // confirmation, lottery result) already has a richer equivalent row
    // above sourced straight from its own domain store — so unlike
    // NotificationsPage.vue/NotificationDropdown.vue, this page doesn't
    // additionally merge in raw notification rows: doing so used to crash
    // formatTimestamp() (a NotificationRead has no `timestamp` field) the
    // first time this page ever rendered with a non-empty notification
    // store, and even mapped correctly would just duplicate every entry
    // already listed here under a second, less detailed title/message.
    items () {
      return [...this.orderItems, ...this.ticketItems, ...this.lotteryItems]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    }
  },

  methods: {
    formatTimestamp (timestamp) {
      return formatDate(parseISO(timestamp), 'MMM d, yyyy · h:mm a')
    },
    notificationTitle (item) {
      return item.titleKey ? this.$t(item.titleKey, item.titleParams || {}) : item.title
    },
    notificationMessage (item) {
      return item.messageKey ? this.$t(item.messageKey, item.messageParams || {}) : item.message
    }
  }
}
</script>

<style lang="scss" scoped>
.history-page {
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

  &--lottery-pending {
    background: $color-brand-tint;
    color: $color-brand;
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
