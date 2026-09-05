<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">Companies</h2>
      <router-link :to="{ name: 'admin-companies-new' }" class="add-btn">+ Add company</router-link>
    </div>

    <div class="table-card" v-if="companiesStore.companies.length">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in companiesStore.companies" :key="company.id">
            <td>{{ company.name }}</td>
            <td>{{ company.contact_email || '—' }}</td>
            <td class="actions">
              <router-link :to="{ name: 'admin-companies-edit', params: { id: company.id } }">Edit</router-link>
              <button type="button" class="danger" @click="remove(company)">Delete</button>
              <router-link :to="{ name: 'admin-manager-account-new', params: { id: company.id } }">+ Manager account</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="empty-note" v-else>No companies yet.</p>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { useCompaniesStore } from '@/store/companies'

export default {
  name: 'AdminCompaniesPage',

  data () {
    return {
      error: ''
    }
  },

  computed: {
    companiesStore () {
      return useCompaniesStore()
    }
  },

  created () {
    this.companiesStore.fetchAll()
  },

  methods: {
    async remove (company) {
      if (!window.confirm(`Delete ${company.name}? This can't be undone.`)) return
      try {
        await this.companiesStore.removeCompany(company.id)
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
