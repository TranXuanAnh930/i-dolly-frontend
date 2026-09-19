<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'manager-events' }" class="back-link">&larr; {{ $t('managerEventSales.backToEvents') }}</router-link>

    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerEventSales.title', { title: eventTitle }) }}</h2>
    </div>

    <div class="table-card" v-if="sales.length">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('managerEventSales.date') }}</th>
            <th>{{ $t('managerEventSales.tier') }}</th>
            <th>{{ $t('managerEventSales.source') }}</th>
            <th>{{ $t('managerEventSales.price') }}</th>
            <th>{{ $t('managerOrders.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in sales" :key="sale.ticket_id">
            <td>{{ formatDate(sale.created_at) }}</td>
            <td>{{ tierLabel(sale.tier) }}</td>
            <td>{{ sale.source === 'lottery' ? $t('managerEventSales.sourceLottery') : $t('managerEventSales.sourceDirect') }}</td>
            <td>&yen;{{ sale.price.toLocaleString('en-US') }}</td>
            <td>
              <span class="status-badge" :class="`status-badge--${sale.status}`">{{ statusLabel(sale.status) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="empty-note" v-else-if="!loading">{{ $t('managerEventSales.noResults') }}</p>

    <div class="pagination" v-if="sales.length || page > 1">
      <button type="button" class="page-btn" :disabled="page <= 1 || loading" @click="goToPage(page - 1)">{{ $t('common.previous') }}</button>
      <span class="pagination__page">{{ $t('common.pageLabel', { page }) }}</span>
      <button type="button" class="page-btn" :disabled="!hasNextPage || loading" @click="goToPage(page + 1)">{{ $t('common.next') }}</button>
    </div>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns'

import { TicketService } from '@/services/events/ticket.service'

const PAGE_SIZE = 10

export default {
  name: 'ManagerEventSalesPage',

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      sales: [],
      page: 1,
      limit: PAGE_SIZE,
      loading: false,
      error: ''
    }
  },

  computed: {
    hasNextPage () {
      return this.sales.length === this.limit
    },
    // Carried over from the events list link (query.title) so this page
    // doesn't need its own concert lookup just to render a title.
    eventTitle () {
      return this.$route.query.title || ''
    }
  },

  created () {
    this.fetchPage()
  },

  methods: {
    async fetchPage () {
      this.loading = true
      this.error = ''
      try {
        const response = await TicketService.getConcertSalesHistory(this.id, { page: this.page, limit: this.limit })
        this.sales = response.data.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    goToPage (page) {
      if (page < 1) return
      this.page = page
      this.fetchPage()
    },
    formatDate (iso) {
      return iso ? format(parseISO(iso), 'MMM d, yyyy · h:mm a') : '—'
    },
    tierLabel (tier) {
      return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : ''
    },
    statusLabel (status) {
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

.empty-note {
  font-family: $font-content;
  font-size: 14px;
  color: $color-gray-500;
  padding: 20px 0;
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

  &--cancelled,
  &--expired {
    background: #fdeaf1;
    color: $color-error;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.page-btn {
  border: 1.5px solid $color-line;
  background: $color-white;
  border-radius: 999px;
  padding: 8px 18px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  color: $color-ink;

  &:hover:not(:disabled) {
    border-color: $color-brand;
    color: $color-brand;
  }

  &:disabled {
    opacity: .5;
    cursor: default;
  }
}

.pagination__page {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;
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
