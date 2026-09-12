<template>
  <div v-if="entry" class="lottery-details-page">
    <section class="hero" :class="{ 'hero--won': entry.status === 'won' }">
      <div class="wrapper hero__inner">
        <router-link to="/history" class="back-link">&larr; {{ $t('lotteryDetails.backToHistory') }}</router-link>
        <template v-if="entry.status === 'won'">
          <p class="hero__eyebrow hero__eyebrow--won">{{ $t('lotteryDetails.wonEyebrow') }}</p>
          <h1 class="hero__title hero__title--won">{{ $t('lotteryDetails.wonTitle') }} &#127881;</h1>
        </template>
        <template v-else>
          <p class="hero__eyebrow">{{ $t('lotteryDetails.title') }}</p>
          <h1 class="hero__title">{{ tierAndConcertLabel }}</h1>
        </template>
        <p class="hero__meta">{{ formatTimestamp(entry.created_at) }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <span class="status-badge" :class="`status-badge--${entry.status}`">{{ statusLabel }}</span>

      <p class="won-note" v-if="entry.status === 'won'">{{ $t('lotteryDetails.wonNote', { title: concertTitle }) }}</p>

      <div class="info-table" v-if="context">
        <div class="info-row">
          <span class="info-row__label">{{ $t('lotteryDetails.event') }}</span>
          <span class="info-row__value">
            <router-link v-if="context.concert" :to="`/events/${context.concert.id}`" class="info-row__link">{{ context.concert.title }}</router-link>
            <template v-else>&mdash;</template>
          </span>
        </div>
        <div class="info-row">
          <span class="info-row__label">{{ $t('lotteryDetails.tier') }}</span>
          <span class="info-row__value">{{ tierLabel }}</span>
        </div>
        <div class="info-row" v-if="entry.drawn_at">
          <span class="info-row__label">{{ $t('lotteryDetails.drawnAt') }}</span>
          <span class="info-row__value">{{ formatTimestamp(entry.drawn_at) }}</span>
        </div>
      </div>
      <p class="loading-note" v-else-if="loadingContext">{{ $t('common.loading') }}</p>

      <div class="cta-row">
        <router-link v-if="entry.status === 'won' && winningTicket" :to="`/history/lottery/${entry.id}/pay`" class="cta-btn cta-btn--pay">{{ $t('lotteryDetails.payNow') }}</router-link>
        <router-link v-if="context &amp;&amp; context.concert" :to="`/events/${context.concert.id}`" class="cta-btn">{{ $t('lotteryDetails.viewEvent') }}</router-link>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <p class="not-found__title">{{ loading ? $t('common.loading') : $t('lotteryDetails.notFound') }}</p>
    <router-link to="/history" class="not-found__link">&larr; {{ $t('lotteryDetails.backToHistory') }}</router-link>
  </div>
</template>

<script>
import { parseISO } from 'date-fns'

import { useLotteryEntriesStore } from '@/store/lotteryEntries'
import { useTicketsStore } from '@/store/tickets'
import { formatDate } from '@/utils/format'

export default {
  name: 'LotteryResultDetailsPage',

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      loading: true,
      loadingContext: false,
      context: null
    }
  },

  computed: {
    lotteryEntriesStore () {
      return useLotteryEntriesStore()
    },
    entry () {
      return this.lotteryEntriesStore.byId(this.id)
    },
    winningTicket () {
      return this.entry ? useTicketsStore().byLotteryEntryId(this.entry.id) : null
    },
    statusLabel () {
      if (!this.entry) return ''
      if (this.entry.status === 'won') return this.$t('lotteryDetails.statusWon')
      if (this.entry.status === 'lost') return this.$t('lotteryDetails.statusLost')
      if (this.entry.status === 'expired') return this.$t('lotteryDetails.statusExpired')
      return this.$t('lotteryDetails.statusPending')
    },
    tierLabel () {
      if (!this.context) return ''
      return this.context.ticketType.tier.charAt(0).toUpperCase() + this.context.ticketType.tier.slice(1)
    },
    concertTitle () {
      return this.context && this.context.concert ? this.context.concert.title : ''
    },
    tierAndConcertLabel () {
      if (!this.context) return this.$t('lotteryDetails.title')
      return `${this.tierLabel} · ${this.concertTitle}`
    }
  },

  watch: {
    entry: {
      immediate: true,
      async handler (entry) {
        if (!entry) return
        document.title = `${this.$t('lotteryDetails.title')} | I-Dolly`
        this.loadingContext = true
        try {
          this.context = await this.lotteryEntriesStore.resolveContext(entry)
        } finally {
          this.loadingContext = false
        }
      }
    }
  },

  async created () {
    await Promise.all([
      this.lotteryEntriesStore.fetchAll(),
      useTicketsStore().fetchAll()
    ])
    this.loading = false
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

  &--won {
    background: linear-gradient(135deg, rgba($color-brand, .08), rgba(#f2b705, .12));
  }
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

  &--won {
    color: #147a52;
  }
}

.hero__title {
  margin-top: 4px;
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(28px, 5vw, 40px);
  color: $color-brand;

  &--won {
    color: #147a52;
  }
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

  &--pending {
    background: #e9f2fb;
    color: #2a6fa8;
  }

  &--won {
    background: #e6f7ef;
    color: #147a52;
  }

  &--lost,
  &--expired {
    background: $color-gray-50;
    color: $color-gray-500;
  }
}

.won-note {
  margin: -8px 0 16px;
  font-family: $font-content;
  font-size: 14px;
  line-height: 1.6;
  color: $color-font-main;
  max-width: 46ch;
}

.loading-note {
  font-family: $font-content;
  font-size: 13px;
  color: $color-gray-400;
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

.cta-row {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.cta-btn {
  display: inline-block;
  border: none;
  border-radius: 999px;
  padding: 13px 28px;
  background: $color-white;
  color: $color-brand;
  border: 1.5px solid $color-brand;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14.5px;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease;

  &:hover {
    background: $color-brand-tint;
    transform: translateY(-2px);
  }

  &--pay {
    background: $color-brand;
    color: $color-white;
    border-color: transparent;
    box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

    &:hover {
      background: $color-brand-deep;
    }
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
