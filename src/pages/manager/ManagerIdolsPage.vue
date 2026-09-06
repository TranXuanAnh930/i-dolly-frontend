<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerIdols.title') }}</h2>
      <router-link v-if="companyId" :to="{ name: 'manager-idols-new', query: adminQuery }" class="add-btn">{{ $t('managerIdols.addIdol') }}</router-link>
    </div>

    <label class="company-picker" v-if="isAdmin">
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="idol in myIdols" :key="idol.id">
              <td class="thumb-cell">
                <img v-if="resolveMediaUrl(idol.profile_image_url)" :src="resolveMediaUrl(idol.profile_image_url)" :alt="idol.name" class="thumb">
              </td>
              <td>{{ idol.name }}</td>
              <td>{{ groupName(idol.group_id) }}</td>
              <td>{{ idol.hometown || '—' }}</td>
              <td class="actions">
                <router-link :to="{ name: 'manager-idols-edit', params: { id: idol.id } }">{{ $t('common.edit') }}</router-link>
                <button type="button" class="danger" @click="remove(idol)">{{ $t('common.delete') }}</button>
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
  name: 'ManagerIdolsPage',

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
    isAdmin () {
      return this.$currentUser.role === 'admin'
    },
    // A manager is scoped to their own company; an admin picks one, since
    // they aren't tied to any single company.
    companyId () {
      return this.isAdmin ? this.selectedCompanyId : this.$currentUser.company_id
    },
    // Carries the admin's current company selection over to the create
    // form, which otherwise has no way to know which company it's for.
    adminQuery () {
      return this.isAdmin ? { company_id: this.companyId } : {}
    },
    myIdols () {
      return this.idols.filter(idol => idol.company_id === this.companyId)
    }
  },

  created () {
    this.fetchPage()
    if (this.isAdmin) this.companiesStore.fetchAll()
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
    async remove (idol) {
      if (!window.confirm(this.$t('common.confirmDelete', { name: idol.name }))) return
      try {
        await IdolsService.remove(idol.id)
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

.thumb-cell {
  width: 40px;
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
