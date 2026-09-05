<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">Events</h2>
      <router-link v-if="companyId" :to="{ name: 'manager-events-new', query: adminQuery }" class="add-btn">+ Add event</router-link>
    </div>

    <label class="company-picker" v-if="isAdmin">
      <span>Company</span>
      <select v-model="selectedCompanyId">
        <option value="">Select a company…</option>
        <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">{{ company.name }}</option>
      </select>
    </label>

    <p class="empty-note" v-if="!companyId">Select a company above to manage its events.</p>

    <template v-else>
      <div class="table-card" v-if="myEvents.length">
        <table class="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Venue</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="concert in myEvents" :key="concert.id">
              <td>{{ concert.title }}</td>
              <td>{{ venueName(concert.venue_id) }}</td>
              <td>{{ formatDate(concert.event_datetime) }}</td>
              <td>{{ concert.status }}</td>
              <td class="actions">
                <router-link :to="{ name: 'manager-events-edit', params: { id: concert.id } }">Edit</router-link>
                <button type="button" class="danger" @click="remove(concert)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="empty-note" v-else>No events yet for this company.</p>
    </template>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns'

import { ConcertsService } from '@/services/concerts.service'
import { useCompaniesStore } from '@/store/companies'

export default {
  name: 'ManagerEventsPage',

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
    isAdmin () {
      return this.$currentUser.role === 'admin'
    },
    companyId () {
      return this.isAdmin ? this.selectedCompanyId : this.$currentUser.company_id
    },
    adminQuery () {
      return this.isAdmin ? { company_id: this.companyId } : {}
    },
    myEvents () {
      return this.concerts.filter(concert => concert.company_id === this.companyId)
    }
  },

  created () {
    this.fetchPage()
    if (this.isAdmin) this.companiesStore.fetchAll()
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
    async remove (concert) {
      if (!window.confirm(`Delete "${concert.title}"? This can't be undone.`)) return
      try {
        await ConcertsService.remove(concert.id)
        await this.fetchPage()
      } catch (error) {
        this.error = error.message
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
