<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerGroups.title') }}</h2>
      <router-link :to="{ name: 'manager-groups-new' }" class="add-btn">{{ $t('managerGroups.addGroup') }}</router-link>
    </div>

    <div class="table-card" v-if="myGroups.length">
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
          <tr v-for="group in myGroups" :key="group.id" :class="{ 'is-inactive': !group.is_active }">
            <td>{{ group.name }}</td>
            <td>{{ group.debut_date || '—' }}</td>
            <td class="description-cell">{{ group.description || '—' }}</td>
            <td>
              <span class="status-badge" :class="{ 'status-badge--inactive': !group.is_active }">
                {{ group.is_active ? $t('common.statusActive') : $t('common.statusInactive') }}
              </span>
            </td>
            <td class="actions">
              <router-link :to="{ name: 'manager-groups-edit', params: { id: group.id } }">{{ $t('common.edit') }}</router-link>
              <button v-if="group.is_active" type="button" class="danger" @click="deactivate(group)">{{ $t('common.deactivate') }}</button>
              <button v-else type="button" @click="reactivate(group)">{{ $t('common.reactivate') }}</button>
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
import { GroupsService } from '@/services/members/groups.service'

export default {
  name: 'ManagerGroupsPage',

  data () {
    return {
      groups: [],
      error: ''
    }
  },

  computed: {
    // A manager only ever manages their own company — see AdminGroupsPage
    // for the admin equivalent, which picks a company via a dropdown.
    companyId () {
      return this.$currentUser.company_id
    },
    myGroups () {
      return this.groups.filter(group => group.company_id === this.companyId)
    }
  },

  created () {
    this.fetchPage()
  },

  methods: {
    async fetchPage () {
      try {
        const response = await GroupsService.getManagerGroupsPagePublic()
        this.groups = response.data.groups
      } catch (error) {
        this.error = error.message
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

    &.is-inactive {
      opacity: .55;
    }
  }
}

.description-cell {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
