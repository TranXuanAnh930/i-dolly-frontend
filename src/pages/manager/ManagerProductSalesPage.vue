<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'manager-products' }" class="back-link">&larr; {{ $t('managerProductSales.backToProducts') }}</router-link>

    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerProductSales.title', { name: productName }) }}</h2>
    </div>

    <div class="table-card" v-if="sales.length">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('managerProductSales.date') }}</th>
            <th>{{ $t('managerProductSales.order') }}</th>
            <th>{{ $t('managerProductSales.quantity') }}</th>
            <th>{{ $t('managerProductSales.unitPrice') }}</th>
            <th>{{ $t('managerProductSales.total') }}</th>
            <th>{{ $t('managerOrders.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in sales" :key="sale.order_id">
            <td>{{ formatDate(sale.order_created_at) }}</td>
            <td class="order-id">#{{ sale.order_id.slice(0, 8) }}</td>
            <td>{{ sale.quantity }}</td>
            <td>&yen;{{ sale.price.toLocaleString('en-US') }}</td>
            <td>&yen;{{ sale.line_total.toLocaleString('en-US') }}</td>
            <td>
              <span class="status-badge" :class="`status-badge--${sale.order_status}`">{{ statusLabel(sale.order_status) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="empty-note" v-else-if="!loading">{{ $t('managerProductSales.noResults') }}</p>

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

import { ProductsService } from '@/services/products.service'

const PAGE_SIZE = 10

export default {
  name: 'ManagerProductSalesPage',

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
    // Carried over from the products list link (query.name) so this page
    // doesn't need its own product-name lookup just to render a title.
    productName () {
      return this.$route.query.name || ''
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
        const response = await ProductsService.getSalesHistory(this.id, { page: this.page, limit: this.limit })
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
    statusLabel (status) {
      const key = 'status' + status.charAt(0).toUpperCase() + status.slice(1)
      return this.$t(`managerOrders.${key}`)
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

.order-id {
  font-variant-numeric: tabular-nums;
  color: $color-gray-500;
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

  &--confirmed {
    background: #e6f7ef;
    color: #147a52;
  }

  &--pending {
    background: #fff4e0;
    color: #9a6400;
  }

  &--cancelled {
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
