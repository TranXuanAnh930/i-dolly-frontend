<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'admin-companies' }" class="back-link">&larr; {{ $t('adminCompanyForm.backToCompanies') }}</router-link>

    <div class="form-wrap">
      <h3 class="form-card__title">{{ isEditing ? $t('adminCompanyForm.editTitle') : $t('adminCompanyForm.addTitle') }}</h3>

      <form class="form-card" @submit.prevent="save">
        <div class="field-grid">
          <label class="field">
            <span class="field__label">{{ $t('common.name') }}</span>
            <input v-model="form.name" required>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('adminCompanies.contactEmail') }}</span>
            <input type="email" v-model="form.contact_email">
          </label>
        </div>

        <label class="field">
          <span class="field__label">{{ $t('common.description') }}</span>
          <textarea v-model="form.description" rows="4"></textarea>
        </label>

        <p class="form-error" v-if="error">{{ error }}</p>

        <div class="form-actions">
          <router-link :to="{ name: 'admin-companies' }" class="cancel-btn">{{ $t('common.cancel') }}</router-link>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? $t('common.saving') : $t('common.save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useCompaniesStore } from '@/store/members/companies'
import { useToastStore } from '@/store/toast'

function emptyForm () {
  return { name: '', description: '', contact_email: '' }
}

export default {
  name: 'AdminCompanyFormPage',

  props: {
    id: { type: String, default: null }
  },

  data () {
    return {
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
    company () {
      return this.isEditing ? this.companiesStore.companies.find(c => c.id === this.id) : null
    }
  },

  watch: {
    company: {
      immediate: true,
      handler (company) {
        if (!company) return
        this.form = {
          name: company.name,
          description: company.description || '',
          contact_email: company.contact_email || ''
        }
      }
    }
  },

  created () {
    this.companiesStore.fetchAll()
  },

  methods: {
    async save () {
      if (!this.form.name.trim()) {
        this.error = this.$t('common.errorNameRequired')
        return
      }
      this.saving = true
      this.error = ''
      const fields = {
        name: this.form.name,
        description: this.form.description || null,
        contact_email: this.form.contact_email || null
      }
      try {
        if (this.isEditing) {
          await this.companiesStore.updateCompany(this.id, fields)
          useToastStore().add({ type: 'success', message: this.$t('adminCompanyForm.updateSuccess') })
        } else {
          await this.companiesStore.createCompany(fields)
        }
        this.$router.push({ name: 'admin-companies' })
      } catch (error) {
        this.error = error.message
        if (this.isEditing) useToastStore().add({ type: 'error', message: error.message })
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
