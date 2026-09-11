<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'admin-groups' }" class="back-link">&larr; {{ $t('managerGroupForm.backToGroups') }}</router-link>

    <label class="company-picker" v-if="!isEditing">
      <span>{{ $t('common.company') }}</span>
      <select v-model="selectedCompanyId">
        <option value="">{{ $t('common.selectCompanyPlaceholder') }}</option>
        <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">{{ company.name }}</option>
      </select>
    </label>

    <p class="empty-note" v-if="!isEditing && !companyId">{{ $t('managerGroupForm.selectCompanyPrompt') }}</p>

    <div class="form-wrap" v-else>
      <h3 class="form-card__title">{{ isEditing ? $t('managerGroupForm.editTitle') : $t('managerGroupForm.addTitle') }}</h3>

      <form class="form-card" @submit.prevent="save">
        <div class="field-grid">
          <label class="field">
            <span class="field__label">{{ $t('common.name') }}</span>
            <input v-model="form.name" required>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerGroups.debutDate') }}</span>
            <input type="date" v-model="form.debut_date">
          </label>
        </div>

        <label class="field">
          <span class="field__label">{{ $t('common.description') }}</span>
          <textarea v-model="form.description" rows="4"></textarea>
        </label>

        <p class="form-error" v-if="error">{{ error }}</p>

        <div class="form-actions">
          <router-link :to="{ name: 'admin-groups' }" class="cancel-btn">{{ $t('common.cancel') }}</router-link>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? $t('common.saving') : $t('common.save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { GroupsService } from '@/services/groups.service'
import { useCompaniesStore } from '@/store/companies'

function emptyForm () {
  return { name: '', debut_date: '', description: '' }
}

export default {
  name: 'AdminGroupFormPage',

  props: {
    id: { type: String, default: null }
  },

  data () {
    return {
      groups: [],
      selectedCompanyId: this.$route.query.company_id || '',
      form: emptyForm(),
      error: '',
      saving: false
    }
  },

  computed: {
    companiesStore () {
      return useCompaniesStore()
    },
    isEditing () {
      return !!this.id
    },
    group () {
      return this.isEditing ? this.groups.find(g => g.id === this.id) : null
    },
    // On edit the group's own (immutable) company applies; on create an
    // admin picks one — see ManagerGroupFormPage for the manager
    // equivalent, always scoped to their own company.
    companyId () {
      if (this.isEditing) return this.group ? this.group.company_id : ''
      return this.selectedCompanyId
    }
  },

  watch: {
    group: {
      immediate: true,
      handler (group) {
        if (!group) return
        this.form = {
          name: group.name,
          debut_date: group.debut_date || '',
          description: group.description || ''
        }
      }
    }
  },

  created () {
    this.fetchPage()
    this.companiesStore.fetchAll()
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
    async save () {
      if (!this.form.name.trim()) {
        this.error = this.$t('common.errorNameRequired')
        return
      }
      this.saving = true
      this.error = ''
      const fields = {
        name: this.form.name,
        debut_date: this.form.debut_date || null,
        description: this.form.description || null
      }
      try {
        if (this.isEditing) {
          await GroupsService.update(this.id, fields)
        } else {
          await GroupsService.create({ ...fields, company_id: this.companyId })
        }
        this.$router.push({ name: 'admin-groups' })
      } catch (error) {
        this.error = error.message
      } finally {
        this.saving = false
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

.back-link {
  align-self: flex-start;
  color: $color-gray-500;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;

  &:hover {
    color: $color-brand;
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

.form-wrap {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-card {
  background: $color-white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-card__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 18px;
  color: $color-ink;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;

  @include media_mobile {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  color: $color-gray-500;
}

.field input,
.field textarea {
  border: 1.5px solid $color-line;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
  outline: none;
  background: $color-white;

  &:focus {
    border-color: $color-brand;
    box-shadow: 0 0 0 4px $color-brand-tint;
  }
}

.field textarea {
  resize: vertical;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  border: none;
  background: none;
  padding: 10px 4px;
  cursor: pointer;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;
  text-decoration: none;

  &:hover {
    color: $color-brand;
  }
}

.save-btn {
  border: none;
  border-radius: 999px;
  padding: 11px 26px;
  background: $color-brand;
  color: $color-white;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: $color-brand-deep;
  }

  &:disabled {
    opacity: .6;
    cursor: default;
  }
}
</style>
