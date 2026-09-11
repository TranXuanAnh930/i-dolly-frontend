<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerIdols.title') }}</h2>
      <router-link v-if="companyId" :to="{ name: 'admin-idols-new', query: { company_id: companyId } }" class="add-btn">{{ $t('managerIdols.addIdol') }}</router-link>
    </div>

    <label class="company-picker">
      <span>{{ $t('common.company') }}</span>
      <select v-model="selectedCompanyId">
        <option value="">{{ $t('common.selectCompanyPlaceholder') }}</option>
        <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">{{ company.name }}</option>
      </select>
    </label>

    <p class="empty-note" v-if="!companyId">{{ $t('managerIdols.selectCompanyPrompt') }}</p>

    <template v-else>
      <div class="table-card" v-if="myIdols.length">
        <table class="table">
          <thead>
            <tr>
              <th></th>
              <th>{{ $t('common.name') }}</th>
              <th>{{ $t('managerIdols.group') }}</th>
              <th>{{ $t('idolDetail.hometown') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="idol in myIdols" :key="idol.id" :class="{ 'is-inactive': !idol.is_active }">
              <td class="thumb-cell">
                <img v-if="resolveMediaUrl(idol.profile_image_url)" :src="resolveMediaUrl(idol.profile_image_url)" :alt="idol.name" class="thumb">
              </td>
              <td>{{ idol.name }}</td>
              <td>{{ groupName(idol.group_id) }}</td>
              <td>{{ idol.hometown || '—' }}</td>
              <td>
                <span class="status-badge" :class="{ 'status-badge--inactive': !idol.is_active }">
                  {{ idol.is_active ? $t('common.statusActive') : $t('common.statusInactive') }}
                </span>
              </td>
              <td class="actions">
                <router-link :to="{ name: 'admin-idols-edit', params: { id: idol.id } }">{{ $t('common.edit') }}</router-link>
                <button v-if="idol.is_active" type="button" class="danger" @click="deactivate(idol)">{{ $t('common.deactivate') }}</button>
                <button v-else type="button" @click="reactivate(idol)">{{ $t('common.reactivate') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="empty-note" v-else>{{ $t('managerIdols.noResults') }}</p>
    </template>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { IdolsService } from '@/services/idols.service'
import { useCompaniesStore } from '@/store/companies'
import { resolveMediaUrl } from '@/utils/media'

export default {
  name: 'AdminIdolsPage',

  data () {
    return {
      idols: [],
      groups: [],
      selectedCompanyId: '',
      error: ''
    }
  },

  computed: {
    companiesStore () {
      return useCompaniesStore()
    },
    // Unlike a manager (always scoped to their own company — see
    // ManagerIdolsPage), an admin isn't tied to any single company and
    // picks one to manage here.
    companyId () {
      return this.selectedCompanyId
    },
    myIdols () {
      return this.idols.filter(idol => idol.company_id === this.companyId)
    }
  },

  created () {
    this.fetchPage()
    this.companiesStore.fetchAll()
  },

  methods: {
    resolveMediaUrl,
    async fetchPage () {
      try {
        const response = await IdolsService.getManagerIdolsPagePublic()
        this.idols = response.data.idols
        this.groups = response.data.groups
      } catch (error) {
        this.error = error.message
      }
    },
    groupName (groupId) {
      const group = this.groups.find(g => g.id === groupId)
      return group ? group.name : '—'
    },
    // "Delete" is a soft delete server-side (sets is_active=false — see
    // idol_service.delete_idol) rather than removing the row, so the
    // confirm/action pair is named to match: deactivate, with reactivate
    // as its undo, not a destructive "gone for good" delete.
    async deactivate (idol) {
      if (!window.confirm(this.$t('common.confirmDeactivate', { name: idol.name }))) return
      try {
        await IdolsService.remove(idol.id)
        await this.fetchPage()
      } catch (error) {
        this.error = error.message
      }
    },
    async reactivate (idol) {
      try {
        await IdolsService.activate(idol.id)
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

.thumb-cell {
  width: 40px;
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

.thumb {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
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
