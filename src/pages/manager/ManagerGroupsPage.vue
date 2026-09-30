<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerGroups.title') }}</h2>
      <router-link :to="{ name: 'manager-groups-new' }" class="add-btn">{{ $t('managerGroups.addGroup') }}</router-link>
    </div>

    <div class="table-card" v-if="groups.length">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('common.name') }}</th>
            <th>{{ $t('managerGroups.debutDate') }}</th>
            <th>{{ $t('common.description') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="group in groups" :key="group.id" :class="{ 'is-inactive': !group.is_active }">
            <td :data-label="$t('common.name')">{{ group.name }}</td>
            <td :data-label="$t('managerGroups.debutDate')">{{ group.debut_date || '—' }}</td>
            <td class="description-cell" :data-label="$t('common.description')">{{ group.description || '—' }}</td>
            <td :data-label="$t('common.status')">
              <span class="status-badge" :class="{ 'status-badge--inactive': !group.is_active }">
                {{ group.is_active ? $t('common.statusActive') : $t('common.statusInactive') }}
              </span>
            </td>
            <td class="actions">
              <UiRowActions>
                <router-link :to="{ name: 'manager-groups-edit', params: { id: group.id } }">{{ $t('common.edit') }}</router-link>
                <button v-if="group.is_active" type="button" class="danger" @click="deactivate(group)">{{ $t('common.deactivate') }}</button>
                <button v-else type="button" @click="reactivate(group)">{{ $t('common.reactivate') }}</button>
              </UiRowActions>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="empty-note" v-else>{{ $t('managerGroups.noResults') }}</p>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import UiRowActions from '@/components/UiRowActions.vue'
import { GroupsService } from '@/services/members/groups.service'

export default {
  name: 'ManagerGroupsPage',

  components: { UiRowActions },

  data () {
    return {
      groups: [],
      error: ''
    }
  },

  created () {
    this.fetchPage()
  },

  methods: {
    async fetchPage () {
      try {
        // Already just this manager's company — the server scopes it; see
        // AdminGroupsPage for the admin equivalent, which picks a company
        // via a dropdown.
        const response = await GroupsService.getManagerGroupsPage()
        this.groups = response.data.groups
      } catch (error) {
        if (!error.redirected) this.error = error.message
      }
    },
    // "Delete" is a soft delete server-side (sets is_active=false — see
    // group_service.delete_group) rather than removing the row, so the
    // confirm/action pair is named to match: deactivate, with reactivate
    // as its undo, not a destructive "gone for good" delete.
    async deactivate (group) {
      if (!window.confirm(this.$t('common.confirmDeactivate', { name: group.name }))) return
      try {
        await GroupsService.remove(group.id)
        await this.fetchPage()
      } catch (error) {
        this.error = error.message
      }
    },
    async reactivate (group) {
      try {
        await GroupsService.activate(group.id)
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
  gap: 12px;
  flex-wrap: wrap;
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

    // Dims the row's data but not its actions cell — otherwise the phone
    // dropdown menu opened from an inactive row renders see-through too.
    &.is-inactive td:not(.actions) {
      opacity: .55;
    }
  }

  // A 5-column table (one of them free-text description) has no honest
  // way to fit an iPhone's width — rather than a horizontally-scrolling
  // strip, each row becomes its own card: the name across the top, debut
  // date and status side by side beneath it (grid-auto-flow: dense pulls
  // status up next to debut date, ahead of the full-width description
  // that sits between them in the markup), then the description, then the
  // row actions collapsed into a dropdown at the bottom right. Labels are
  // re-shown via data-label, kept in sync with the real <th> text/i18n
  // above. Same card as ManagerIdolsPage, minus the photo half.
  @include media_mobile {
    display: block;

    thead {
      display: none;
    }

    tbody {
      display: block;

      tr {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-auto-flow: row dense;
        column-gap: 14px;
        row-gap: 10px;
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

      // Name — the card's heading, so full width and a touch heavier.
      &:first-child {
        grid-column: 1 / -1;
        font-weight: 700;
        font-size: 15px;
      }
    }
  }
}

// td.description-cell (not just .description-cell) so the mobile override
// below matches ".table td"'s own specificity and actually wins instead of
// losing the cascade tie to it.
td.description-cell {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  // Truncating to one line only makes sense in the table's own column
  // width — in the stacked mobile card there's a full-width line to work
  // with, so let it wrap instead of clipping silently.
  @include media_mobile {
    grid-column: 1 / -1;
    max-width: none;
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
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

  &--inactive {
    background: $color-gray-100;
    color: $color-gray-500;
  }
}

.actions {
  display: flex;
  gap: 8px;
  white-space: nowrap;

  @include media_mobile {
    grid-column: 2;
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
