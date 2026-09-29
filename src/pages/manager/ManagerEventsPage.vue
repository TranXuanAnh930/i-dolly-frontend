<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerEvents.title') }}</h2>
    </div>

    <div class="toolbar">
      <div class="search-field">
        <svg class="search-field__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2"/>
          <line x1="13.5" y1="13.5" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input type="text" class="search-field__input" v-model="search" :placeholder="$t('managerEvents.searchPlaceholder')">
      </div>
      <router-link :to="{ name: 'manager-events-new' }" class="add-btn">{{ $t('managerEvents.addEvent') }}</router-link>
    </div>

    <div class="table-card" v-if="filteredEvents.length">
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
          <tr v-for="concert in filteredEvents" :key="concert.id" :class="{ 'is-cancelled': concert.status === 'cancelled' }">
            <td :data-label="$t('managerEvents.titleLabel')">{{ concert.title }}</td>
            <td :data-label="$t('managerEvents.venue')">{{ venueName(concert.venue_id) }}</td>
            <td :data-label="$t('managerEvents.date')">{{ formatDate(concert.event_datetime) }}</td>
            <td :data-label="$t('managerEvents.status')">
              <span class="status-badge" :class="{ 'status-badge--cancelled': concert.status === 'cancelled' }">
                {{ statusLabel(concert.status) }}
              </span>
            </td>
            <td class="actions">
              <UiRowActions>
                <router-link :to="{ name: 'manager-events-sales', params: { id: concert.id }, query: { title: concert.title } }">{{ $t('managerProducts.viewSales') }}</router-link>
                <router-link :to="{ name: 'manager-events-edit', params: { id: concert.id } }">{{ $t('common.edit') }}</router-link>
              </UiRowActions>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="empty-state" v-else>
      <p class="empty-note">{{ concerts.length ? $t('managerEvents.noSearchResults') : $t('managerEvents.noResults') }}</p>
      <button v-if="concerts.length && search" type="button" class="clear-search-btn" @click="search = ''">{{ $t('common.clearSearch') }}</button>
    </div>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns'

import UiRowActions from '@/components/UiRowActions.vue'
import { ConcertsService } from '@/services/events/concerts.service'

export default {
  name: 'ManagerEventsPage',

  components: { UiRowActions },

  data () {
    return {
      concerts: [],
      venues: [],
      search: '',
      error: ''
    }
  },

  computed: {
    filteredEvents () {
      const query = this.search.trim().toLowerCase()
      if (!query) return this.concerts
      return this.concerts.filter(concert => `${concert.title} ${this.venueName(concert.venue_id)}`.toLowerCase().includes(query))
    }
  },

  created () {
    this.fetchPage()
  },

  methods: {
    async fetchPage () {
      try {
        // Already just this manager's company — the server scopes it; see
        // AdminEventsPage for the admin equivalent, which picks a company
        // via a dropdown.
        const response = await ConcertsService.getManagerEventsPage()
        this.concerts = response.data.concerts
        this.venues = response.data.venues
      } catch (error) {
        if (!error.redirected) this.error = error.message
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

  // .wrapper's own side padding is overridden by the shorthand above; fine
  // on desktop where the wrapper is centered with room either side, but
  // on a phone it leaves the content flush against the screen edges.
  @include media_mobile {
    padding: 20px 16px 80px;
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

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.add-btn {
  flex: none;
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
  white-space: nowrap;

  &:hover {
    background: $color-brand-deep;
  }
}

.search-field {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.search-field__icon {
  position: absolute;
  left: 14px;
  width: 16px;
  height: 16px;
  color: $color-gray-400;
  pointer-events: none;
}

.search-field__input {
  width: 100%;
  border: 1.5px solid $color-line;
  border-radius: 999px;
  padding: 10px 14px 10px 38px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
  outline: none;
  background: $color-white;
  transition: border-color .15s ease;

  &::placeholder {
    color: $color-gray-300;
  }

  &:focus {
    border-color: $color-brand;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 20px 0;
}

.empty-note {
  font-family: $font-content;
  font-size: 14px;
  color: $color-gray-500;
}

.clear-search-btn {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-brand;

  &:hover {
    text-decoration: underline;
  }
}

.table-card {
  background: $color-white;
  border-radius: 16px;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
  overflow-x: auto;

  @include media_mobile {
    overflow-x: visible;
  }
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
    vertical-align: middle;
  }

  th {
    font-weight: 700;
    color: $color-gray-500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .03em;
    border-bottom: 1px solid $color-line;
  }

  // Fixed row height regardless of content — keeps every row the same
  // size instead of one cell's content nudging its row taller than its
  // neighbors.
  tbody tr {
    height: 64px;
    border-bottom: 1px solid $color-line;

    &:last-child {
      border-bottom: none;
    }

    // Dims the row's data but not its actions cell — otherwise the phone
    // dropdown menu opened from a cancelled row renders see-through too.
    &.is-cancelled td:not(.actions) {
      opacity: .55;
    }
  }

  // A 5-column table has no honest way to fit an iPhone's width — rather
  // than leave it as a horizontally-scrolling strip (easy to miss there's
  // more off to the right), each row becomes its own card: the title
  // across the top, the remaining columns label-over-value in two columns
  // beneath it (label re-shown via data-label, kept in sync with the real
  // <th> text/i18n above, not hardcoded here, so it never drifts), and the
  // row actions collapsed into a dropdown at the bottom right — the same
  // card as ManagerProductsPage/ManagerIdolsPage, minus the image half.
  @include media_mobile {
    display: block;

    thead {
      display: none;
    }

    tbody {
      display: block;

      // Same specificity as the fixed-height rule above (also "tbody tr")
      // so this actually wins instead of losing to it under the cascade.
      tr {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 14px;
        row-gap: 10px;
        height: auto;
        padding: 16px;
      }
    }

    td {
      display: block;
      min-width: 0;
      padding: 0;
      white-space: normal;
      overflow-wrap: anywhere;

      &[data-label]::before {
        content: attr(data-label);
        display: block;
        margin-bottom: 2px;
        font-weight: 700;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: .03em;
        color: $color-gray-500;
      }

      // Title — the card's heading, so full width and a touch heavier.
      &:first-child {
        grid-column: 1 / -1;
        font-weight: 700;
        font-size: 15px;
      }
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
  align-items: center;
  justify-content: center;
  gap: 8px;

  @include media_mobile {
    align-self: end;
  }

  a, button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1.5px solid $color-line;
    background: $color-white;
    border-radius: 8px;
    padding: 6px 12px;
    font-family: $font-content;
    font-weight: 700;
    font-size: 12px;
    // Pinned so a <router-link> (inherits the page's line-height) and a
    // <button> (UA default) render the same height side by side.
    line-height: 1.4;
    // One shared width so a row's Edit / Deactivate / Sales buttons read as
    // a matched set instead of each hugging its own label; wide enough for
    // the longest common label ("Deactivate"), longer ones just grow past it.
    min-width: 92px;
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
