<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">{{ $t('adminCompanies.title') }}</h2>
      <router-link :to="{ name: 'admin-companies-new' }" class="add-btn">{{ $t('adminCompanies.addCompany') }}</router-link>
    </div>

    <div class="table-card" v-if="companiesStore.companies.length">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('common.name') }}</th>
            <th>{{ $t('adminCompanies.contactEmail') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in companiesStore.companies" :key="company.id">
            <td :data-label="$t('common.name')">{{ company.name }}</td>
            <td :data-label="$t('adminCompanies.contactEmail')">{{ company.contact_email || '—' }}</td>
            <td class="actions">
              <UiRowActions>
                <router-link :to="{ name: 'admin-companies-edit', params: { id: company.id } }">{{ $t('common.edit') }}</router-link>
                <button type="button" class="danger" @click="remove(company)">{{ $t('common.delete') }}</button>
                <router-link :to="{ name: 'admin-manager-account-new', params: { id: company.id } }">{{ $t('adminCompanies.addManagerAccount') }}</router-link>
              </UiRowActions>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="empty-note" v-else>{{ $t('adminCompanies.noResults') }}</p>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import UiRowActions from '@/components/UiRowActions.vue'
import { useCompaniesStore } from '@/store/members/companies'

export default {
  name: 'AdminCompaniesPage',

  components: { UiRowActions },

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
      if (!window.confirm(this.$t('common.confirmDelete', { name: company.name }))) return
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

  // .wrapper's own side padding is overridden by the shorthand above; fine
  // on desktop where the wrapper is centered with room either side, but
  // on a phone it leaves the cards flush against the screen edges.
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

  // Same phone card as the other admin/manager lists: name across the top,
  // contact email label-over-value beneath it (label re-shown via
  // data-label, kept in sync with the real <th> text/i18n above), and the
  // row actions collapsed into a dropdown at the bottom right.
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

.actions {
  display: flex;
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
