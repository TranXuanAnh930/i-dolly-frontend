<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'manager-events' }" class="back-link">&larr; {{ $t('managerLotteryResults.backToEvents') }}</router-link>

    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerLotteryResults.title', { title: eventTitle }) }}</h2>
    </div>

    <label class="company-picker" v-if="tiers.length > 1">
      <span>{{ $t('managerLotteryResults.tier') }}</span>
      <select v-model="tierFilter">
        <option value="">{{ $t('managerLotteryResults.filterAllTiers') }}</option>
        <option v-for="tier in tiers" :key="tier" :value="tier">{{ tierLabel(tier) }}</option>
      </select>
    </label>

    <div class="table-card" v-if="sortedResults.length">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('managerLotteryResults.email') }}</th>
            <th>{{ $t('managerLotteryResults.tier') }}</th>
            <th>{{ $t('managerLotteryResults.status') }}</th>
            <th>{{ $t('managerLotteryResults.paymentStatus') }}</th>
            <th>{{ $t('managerLotteryResults.paymentDeadline') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in sortedResults" :key="entry.lottery_entry_id">
            <td>{{ entry.email }}</td>
            <td>{{ tierLabel(entry.tier) }}</td>
            <td>
              <span class="status-badge" :class="`status-badge--${entry.status}`">
                {{ entry.status === 'won' ? $t('managerLotteryResults.statusWon') : $t('managerLotteryResults.statusLost') }}
              </span>
            </td>
            <td>
              <span v-if="entry.payment_status" class="status-badge" :class="`status-badge--${entry.payment_status}`">{{ paymentStatusLabel(entry.payment_status) }}</span>
              <span v-else>&mdash;</span>
            </td>
            <td>{{ entry.payment_deadline_at ? formatDate(entry.payment_deadline_at) : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" v-else-if="!loading">
      <p class="empty-note" v-if="drawInProgress">{{ $t('managerLotteryResults.drawInProgress') }}</p>
      <p class="empty-note" v-else-if="drawFailed">{{ $t('managerLotteryResults.drawFailedHint') }}</p>
      <p class="empty-note" v-else>{{ $t('managerLotteryResults.noResults') }}</p>
    </div>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns'

import { LotteryService } from '@/services/events/lottery.service'
import { useLotteryDrawStore } from '@/store/events/lotteryDraw'

export default {
  name: 'ManagerLotteryResultsPage',

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      results: [],
      tierFilter: '',
      loading: false,
      error: ''
    }
  },

  computed: {
    // Carried over from the events list / notification link (query.title)
    // so this page doesn't need its own concert lookup just for a heading.
    eventTitle () {
      return this.$route.query.title || ''
    },
    // These only reflect a draw the store watched live in THIS browser
    // session — a manager landing here fresh (e.g. a new tab from a
    // notification) sees neither flag and falls through to the generic
    // empty state below, same limitation as ManagerEventFormPage.vue's own
    // drawInProgress/drawFailed computeds.
    drawInProgress () {
      return useLotteryDrawStore().isDrawing(this.id)
    },
    drawFailed () {
      return useLotteryDrawStore().hasFailed(this.id)
    },
    tiers () {
      return [...new Set(this.results.map(entry => entry.tier))]
    },
    sortedResults () {
      const list = this.tierFilter ? this.results.filter(entry => entry.tier === this.tierFilter) : this.results
      // Winners first — the group a manager actually acts on — then by how
      // soon their payment window closes, surfacing tickets closest to
      // expiring. Losers carry no payment_deadline_at, so they stay in
      // arrival order among themselves.
      return [...list].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'won' ? -1 : 1
        if (a.status !== 'won') return 0
        return new Date(a.payment_deadline_at) - new Date(b.payment_deadline_at)
      })
    }
  },

  created () {
    this.fetchResults()
  },

  methods: {
    async fetchResults () {
      this.loading = true
      this.error = ''
      try {
        const response = await LotteryService.getResults(this.id)
        this.results = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    formatDate (iso) {
      return format(parseISO(iso), 'MMM d, yyyy · h:mm a')
    },
    tierLabel (tier) {
      return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : ''
    },
    paymentStatusLabel (status) {
      const key = 'status' + status.split('_').map(part => part[0].toUpperCase() + part.slice(1)).join('')
      return this.$t(`ticketDetails.${key}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.crud-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 0 80px;
}

.back-link {
  align-self: flex-start;
  color: $color-gray-500;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;

  &:hover {
    color: $color-brand;
  }
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-head__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 22px;
  color: $color-ink;
}

.company-picker {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 280px;

  span {
    font-family: $font-content;
    font-weight: 700;
    font-size: 12px;
    color: $color-gray-500;
  }

  select {
    border: 1.5px solid $color-line;
    border-radius: 10px;
    padding: 10px 12px;
    font-family: $font-content;
    font-size: 14px;
    color: $color-ink;
    background: $color-white;
  }
}

.empty-state {
  padding: 20px 0;
}

.empty-note {
  font-family: $font-content;
  font-size: 14px;
  color: $color-gray-500;
}

.table-card {
  background: $color-white;
  border-radius: 16px;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-family: $font-content;
  font-size: 13.5px;

  th, td {
    padding: 12px 16px;
    text-align: left;
    white-space: nowrap;
  }

  th {
    font-weight: 700;
    color: $color-gray-500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .03em;
    border-bottom: 1px solid $color-line;
  }

  tbody tr {
    border-bottom: 1px solid $color-line;

    &:last-child {
      border-bottom: none;
    }
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .02em;
  background: $color-gray-100;
  color: $color-gray-500;

  &--won,
  &--paid,
  &--used {
    background: #e6f7ef;
    color: #147a52;
  }

  &--reserved,
  &--pending_payment {
    background: #fff4e0;
    color: #9a6400;
  }

  &--lost,
  &--cancelled,
  &--expired {
    background: #fdeaf1;
    color: $color-error;
  }
}

.form-error {
  background: #fdeaf1;
  color: $color-error;
  border-radius: 12px;
  padding: 10px 14px;
  font-family: $font-content;
  font-size: 13px;
  font-weight: 700;
}
</style>
