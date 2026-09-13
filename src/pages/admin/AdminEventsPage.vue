<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerEvents.title') }}</h2>
      <router-link v-if="companyId" :to="{ name: 'admin-events-new', query: { company_id: companyId } }" class="add-btn">{{ $t('managerEvents.addEvent') }}</router-link>
    </div>

    <label class="company-picker">
      <span>{{ $t('common.company') }}</span>
      <select v-model="selectedCompanyId">
        <option value="">{{ $t('common.selectCompanyPlaceholder') }}</option>
        <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">{{ company.name }}</option>
      </select>
    </label>

    <p class="empty-note" v-if="!companyId">{{ $t('managerEvents.selectCompanyPrompt') }}</p>

    <template v-else>
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
                <router-link :to="{ name: 'admin-events-edit', params: { id: concert.id } }">{{ $t('common.edit') }}</router-link>
                <button v-if="concert.status !== 'cancelled'" type="button" @click="runLotteryDraw(concert)">{{ $t('managerEvents.runLotteryDraw') }}</button>
                <button v-if="concert.status !== 'cancelled'" type="button" class="danger" @click="cancelEvent(concert)">{{ $t('managerEvents.cancelEvent') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="empty-note" v-else>{{ $t('managerEvents.noResults') }}</p>
    </template>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns'

import { ConcertsService } from '@/services/concerts.service'
import { useCompaniesStore } from '@/store/companies'
import { useToastStore } from '@/store/toast'

export default {
  name: 'AdminEventsPage',

  data () {
    return {
      concerts: [],
      venues: [],
      selectedCompanyId: '',
      error: ''
    }
  },

  computed: {
    companiesStore () {
      return useCompaniesStore()
    },
    // Unlike a manager (always scoped to their own company — see
    // ManagerEventsPage), an admin isn't tied to any single company and
    // picks one to manage here.
    companyId () {
      return this.selectedCompanyId
    },
    myEvents () {
      return this.concerts.filter(concert => concert.company_id === this.companyId)
    }
  },

  created () {
    this.fetchPage()
    this.companiesStore.fetchAll()
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
    },
    // "Delete" cancels server-side (sets status="cancelled" — see
    // concert_service.delete_concert) rather than removing the row, so the
    // confirm/action pair is named to match: cancelling, not a destructive
    // "gone for good" delete. An admin can move the status off "cancelled"
    // again from Edit.
    async cancelEvent (concert) {
      if (!window.confirm(this.$t('managerEvents.confirmCancel', { title: concert.title }))) return
      try {
        await ConcertsService.remove(concert.id)
        await this.fetchPage()
      } catch (error) {
        this.error = error.message
      }
    },
    // Enqueues the backend's async draw job (see concerts.service.js) —
    // this call only confirms the job was scheduled, not its outcome, so
    // there's nothing here to refetch immediately after.
    async runLotteryDraw (concert) {
      if (!window.confirm(this.$t('managerEvents.confirmLotteryDraw', { title: concert.title }))) return
      try {
        await ConcertsService.drawLottery(concert.id)
        useToastStore().add({ type: 'success', message: this.$t('managerEvents.lotteryDrawQueued') })
      } catch (error) {
        useToastStore().add({ type: 'error', message: error.message })
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

    &.danger:hover {
      border-color: $color-error;
      color: $color-error;
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
