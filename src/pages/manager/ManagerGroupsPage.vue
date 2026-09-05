<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">Groups</h2>
      <router-link v-if="companyId" :to="{ name: 'manager-groups-new', query: adminQuery }" class="add-btn">+ Add group</router-link>
    </div>

    <label class="company-picker" v-if="isAdmin">
      <span>Company</span>
      <select v-model="selectedCompanyId">
        <option value="">Select a company…</option>
        <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">{{ company.name }}</option>
      </select>
    </label>

    <p class="empty-note" v-if="!companyId">Select a company above to manage its groups.</p>

    <template v-else>
      <div class="table-card" v-if="myGroups.length">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Debut date</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="group in myGroups" :key="group.id">
              <td>{{ group.name }}</td>
              <td>{{ group.debut_date || '—' }}</td>
              <td class="description-cell">{{ group.description || '—' }}</td>
              <td class="actions">
                <router-link :to="{ name: 'manager-groups-edit', params: { id: group.id } }">Edit</router-link>
                <button type="button" class="danger" @click="remove(group)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="empty-note" v-else>No groups yet for this company.</p>
    </template>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { GroupsService } from '@/services/groups.service'
import { useCompaniesStore } from '@/store/companies'

export default {
  name: 'ManagerGroupsPage',

  data () {
    return {
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
    companyId () {
      return this.isAdmin ? this.selectedCompanyId : this.$currentUser.company_id
    },
    adminQuery () {
      return this.isAdmin ? { company_id: this.companyId } : {}
    },
    myGroups () {
      return this.groups.filter(group => group.company_id === this.companyId)
    }
  },

  created () {
    this.fetchPage()
    if (this.isAdmin) this.companiesStore.fetchAll()
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
    async remove (group) {
      if (!window.confirm(`Delete ${group.name}? This can't be undone.`)) return
      try {
        await GroupsService.remove(group.id)
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
  }
}

.description-cell {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
