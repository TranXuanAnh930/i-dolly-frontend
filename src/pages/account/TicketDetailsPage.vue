<template>
  <div v-if="ticket" class="ticket-details-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <router-link to="/history" class="back-link">&larr; {{ $t('ticketDetails.backToHistory') }}</router-link>
        <h1 class="hero__title">{{ $t('ticketDetails.title') }}</h1>
        <p class="hero__meta">{{ formatTimestamp(ticket.created_at) }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <div class="info-table">
        <div class="info-row">
          <span class="info-row__label">{{ $t('ticketDetails.ticketId') }}</span>
          <span class="info-row__value">{{ ticket.id.slice(0, 8) }}</span>
        </div>
        <div class="info-row">
          <span class="info-row__label">{{ $t('ticketDetails.event') }}</span>
          <span class="info-row__value">
            <router-link v-if="concert" :to="`/events/${concert.id}`" class="info-row__link">{{ concert.title }}</router-link>
            <template v-else>—</template>
          </span>
        </div>
        <div class="info-row">
          <span class="info-row__label">{{ $t('ticketDetails.tier') }}</span>
          <span class="info-row__value">{{ tierLabel }}</span>
        </div>
        <div class="info-row">
          <span class="info-row__label">{{ $t('ticketDetails.total') }}</span>
          <span class="info-row__value">&yen;{{ formatNumber(total) }}</span>
        </div>
        <div class="info-row">
          <span class="info-row__label">{{ $t('ticketDetails.status') }}</span>
          <span class="info-row__value">{{ statusLabel }}</span>
        </div>
      </div>

      <router-link v-if="concert" :to="`/events/${concert.id}`" class="cta-btn">{{ $t('ticketDetails.viewEvent') }}</router-link>
    </div>
  </div>

  <div v-else-if="loading" class="not-found">
    <p class="not-found__title">{{ $t('common.loading') }}</p>
  </div>

  <div v-else class="not-found">
    <p class="not-found__title">{{ $t('ticketDetails.notFound') }}</p>
    <router-link to="/history" class="not-found__link">&larr; {{ $t('ticketDetails.backToHistory') }}</router-link>
  </div>
</template>

<script>
import { parseISO } from 'date-fns'

import { useTicketsStore } from '@/store/events/tickets'
import { useConcertsStore } from '@/store/events/concerts'
import { formatDate, formatNumber } from '@/utils/format'
import { withTax } from '@/utils/tax'

export default {
  name: 'TicketDetailsPage',

  props: {
    orderNumber: { type: String, required: true }
  },

  data () {
    return {
      loading: true
    }
  },

  computed: {
    ticketsStore () {
      return useTicketsStore()
    },
    concertsStore () {
      return useConcertsStore()
    },
    // The route param is named orderNumber for consistency with
    // order-details/lottery-details, but carries the ticket's real id —
    // same convention CheckoutPage uses when it links here.
    ticket () {
      return this.ticketsStore.byId(this.orderNumber)
    },
    concert () {
      return this.ticket ? this.concertsStore.concertById(this.ticket.ticket_type.concert_id) : null
    },
    tierLabel () {
      const tier = this.ticket && this.ticket.ticket_type.tier
      return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : ''
    },
    total () {
      return this.ticket ? withTax(this.ticket.ticket_type.price) : 0
    },
    statusLabel () {
      if (!this.ticket) return ''
      const key = this.ticket.status.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
      return this.$t(`ticketDetails.status${key}`)
    }
  },

  watch: {
    ticket: {
      immediate: true,
      handler (ticket) {
        if (ticket) document.title = `${ticket.id.slice(0, 8)} | I-Dolly`
      }
    }
  },

  created () {
    // The concert can only be resolved once the ticket is loaded (its id comes
    // off ticket.ticket_type), so this chains rather than running alongside —
    // one concert by id, not the whole table.
    Promise.all([this.ticketsStore.fetchAll()])
      .then(() => {
        const concertId = this.ticket && this.ticket.ticket_type.concert_id
        if (concertId) return this.concertsStore.ensureConcert(concertId)
      })
      .finally(() => {
        this.loading = false
      })
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
.ticket-details-page {
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
