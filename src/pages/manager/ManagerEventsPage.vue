<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerEvents.title') }}</h2>
      <router-link :to="{ name: 'manager-events-new' }" class="add-btn">{{ $t('managerEvents.addEvent') }}</router-link>
    </div>

    <div class="table-card" v-if="myEvents.length">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('managerEvents.titleLabel') }}</th>
            <th>{{ $t('managerEvents.venue') }}</th>
            <th>{{ $t('managerEvents.date') }}</th>
            <th>{{ $t('managerEvents.status') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="concert in myEvents" :key="concert.id" :class="{ 'is-cancelled': concert.status === 'cancelled' }">
            <td>{{ concert.title }}</td>
            <td>{{ venueName(concert.venue_id) }}</td>
            <td>{{ formatDate(concert.event_datetime) }}</td>
            <td>
              <span class="status-badge" :class="{ 'status-badge--cancelled': concert.status === 'cancelled' }">
                {{ statusLabel(concert.status) }}
              </span>
            </td>
            <td class="actions">
              <router-link :to="{ name: 'manager-events-sales', params: { id: concert.id }, query: { title: concert.title } }">{{ $t('managerProducts.viewSales') }}</router-link>
              <router-link :to="{ name: 'manager-events-edit', params: { id: concert.id } }">{{ $t('common.edit') }}</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="empty-note" v-else>{{ $t('managerEvents.noResults') }}</p>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns'

import { ConcertsService } from '@/services/concerts.service'

export default {
  name: 'ManagerEventsPage',

  data () {
    return {
      concerts: [],
      venues: [],
      error: ''
    }
  },

  computed: {
    // A manager only ever manages their own company — see AdminEventsPage
    // for the admin equivalent, which picks a company via a dropdown.
    companyId () {
      return this.$currentUser.company_id
    },
    myEvents () {
      return this.concerts.filter(concert => concert.company_id === this.companyId)
    }
  },

  created () {
    this.fetchPage()
  },

  methods: {
    async fetchPage () {
      try {
        const response = await ConcertsService.getManagerEventsPagePublic()
        this.concerts = response.data.concerts
        this.venues = response.data.venues
      } catch (error) {
        this.error = error.message
      }
    },
    venueName (venueId) {
      const venue = this.venues.find(v => v.id === venueId)
      return venue ? venue.name : '—'
    },
    formatDate (iso) {
      return iso ? format(parseISO(iso), 'MMM d, yyyy · h:mm a') : '—'
    },
    statusLabel (status) {
      const key = 'status' + status.split('_').map(part => part[0].toUpperCase() + part.slice(1)).join('')
      return this.$t(`events.${key}`)
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

.add-btn {
  border: none;
  border-radius: 999px;
  padding: 10px 20px;
  background: $color-brand;
  color: $color-white;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: $color-brand-deep;
  }
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

    &.is-cancelled {
      opacity: .55;
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
  background: #e6f7ef;
  color: #147a52;

  &--cancelled {
    background: $color-gray-100;
    color: $color-gray-500;
  }
}

.actions {
  display: flex;
  gap: 8px;

  a, button {
    border: 1.5px solid $color-line;
    background: $color-white;
    border-radius: 8px;
    padding: 6px 12px;
    font-family: $font-content;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    color: $color-ink;
    text-decoration: none;

    &:hover {
      border-color: $color-brand;
      color: $color-brand;
    }
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
