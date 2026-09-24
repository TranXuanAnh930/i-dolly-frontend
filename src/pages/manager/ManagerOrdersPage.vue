<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerOrders.title') }}</h2>
    </div>

    <div class="table-card" v-if="orders.length">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('managerOrders.date') }}</th>
            <th>{{ $t('managerOrders.buyer') }}</th>
            <th>{{ $t('managerOrders.items') }}</th>
            <th>{{ $t('managerOrders.total') }}</th>
            <th>{{ $t('managerOrders.status') }}</th>
            <th>{{ $t('managerOrders.shippingStatus') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ formatDate(order.created_at) }}</td>
            <td>
              <div class="buyer">
                <span class="buyer__name">{{ order.buyer_name }}</span>
                <span class="buyer__email">{{ order.buyer_email }}</span>
              </div>
            </td>
            <td>
              <ul class="items-list">
                <li v-for="item in order.items" :key="item.product_id">{{ item.product_name }} × {{ item.quantity }}</li>
              </ul>
            </td>
            <td>&yen;{{ order.company_total.toLocaleString('en-US') }}</td>
            <td>
              <span class="status-badge" :class="`status-badge--${order.status}`">{{ statusLabel(order.status) }}</span>
            </td>
            <td>
              <span v-if="order.shippingstatus" class="status-badge" :class="`status-badge--ship-${order.shippingstatus.status}`">{{ shippingStatusLabel(order.shippingstatus.status) }}</span>
              <span v-else>&mdash;</span>
            </td>
            <td class="actions">
              <button
                v-if="canShip(order)"
                type="button"
                :disabled="shippingId === order.id"
                @click="shipOrder(order)">
                {{ shippingId === order.id ? $t('common.saving') : $t('managerOrders.shipAction') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="empty-note" v-else-if="!loading">{{ $t('managerOrders.noResults') }}</p>

    <div class="pagination" v-if="orders.length || page > 1">
      <button type="button" class="page-btn" :disabled="page <= 1 || loading" @click="goToPage(page - 1)">{{ $t('common.previous') }}</button>
      <span class="pagination__page">{{ $t('common.pageLabel', { page }) }}</span>
      <button type="button" class="page-btn" :disabled="!hasNextPage || loading" @click="goToPage(page + 1)">{{ $t('common.next') }}</button>
    </div>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns'

import { OrderService } from '@/services/store/order.service'
import { useToastStore } from '@/store/toast'

const PAGE_SIZE = 10
const SHIPPABLE_STATUSES = ['pending', 'processing']

export default {
  name: 'ManagerOrdersPage',

  data () {
    return {
      orders: [],
      page: 1,
      limit: PAGE_SIZE,
      loading: false,
      // The order.id currently mid-ship — disables just that row's button
      // rather than every row's, and doubles as a double-click guard.
      shippingId: null,
      error: ''
    }
  },

  computed: {
    // The backend's count is this page's length, not a grand total (same
    // convention as /products/pagination) — a full page is the only signal
    // that another one might exist.
    hasNextPage () {
      return this.orders.length === this.limit
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
        const response = await OrderService.getManagerOrdersPage({ page: this.page, limit: this.limit })
        this.orders = response.data.data
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
    },
    shippingStatusLabel (status) {
      const key = 'shipping' + status.charAt(0).toUpperCase() + status.slice(1)
      return this.$t(`managerOrders.${key}`)
    },
    // The list itself is already company-scoped (every order shown here
    // has at least one of this company's products in it), so the only real
    // gate left is shipping status — a 403 from the endpoint's own scope
    // check would only fire on some genuine edge case, handled defensively
    // in shipOrder's catch rather than pre-checked here.
    canShip (order) {
      return !!order.shippingstatus && SHIPPABLE_STATUSES.includes(order.shippingstatus.status)
    },
    async shipOrder (order) {
      if (!window.confirm(this.$t('managerOrders.confirmShip'))) return
      this.shippingId = order.id
      try {
        const response = await OrderService.ship(order.id)
        // Patched straight from the response, matching every other
        // "the write already returns the full row" endpoint in this app —
        // no need to refetch the whole page just to see the new status.
        order.shippingstatus = response.data.shippingstatus
        useToastStore().add({ type: 'success', message: this.$t('managerOrders.shipSuccess') })
      } catch (error) {
        useToastStore().add({ type: 'error', message: error.message })
      } finally {
        this.shippingId = null
      }
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
    vertical-align: top;
  }

  th {
    font-weight: 700;
    color: $color-gray-500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .03em;
    border-bottom: 1px solid $color-line;
    white-space: nowrap;
  }

  tbody tr {
    border-bottom: 1px solid $color-line;

    &:last-child {
      border-bottom: none;
    }
  }
}

.buyer {
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: nowrap;
}

.buyer__name {
  font-weight: 700;
  color: $color-ink;
}

.buyer__email {
  font-size: 12px;
  color: $color-gray-500;
}

.items-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
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
  white-space: nowrap;
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

  &--ship-pending {
    background: #fff4e0;
    color: #9a6400;
  }

  &--ship-processing {
    background: #e9f2fb;
    color: #2a6fa8;
  }

  &--ship-shipped,
  &--ship-delivered {
    background: #e6f7ef;
    color: #147a52;
  }

  &--ship-cancelled {
    background: #fdeaf1;
    color: $color-error;
  }
}

.actions button {
  border: 1.5px solid $color-line;
  background: $color-white;
  border-radius: 8px;
  padding: 6px 12px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  color: $color-ink;
  white-space: nowrap;

  &:hover:not(:disabled) {
    border-color: $color-brand;
    color: $color-brand;
  }

  &:disabled {
    opacity: .6;
    cursor: default;
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
