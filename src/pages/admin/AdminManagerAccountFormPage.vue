<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'admin-companies' }" class="back-link">&larr; {{ $t('adminCompanyForm.backToCompanies') }}</router-link>

    <div class="form-wrap">
      <h3 class="form-card__title">{{ formTitle }}</h3>

      <form class="form-card" @submit.prevent="save">
        <div class="field-grid">
          <label class="field">
            <span class="field__label">{{ $t('common.name') }}</span>
            <input v-model="form.name" required>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('common.email') }}</span>
            <input type="email" v-model="form.email" required>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('common.password') }}</span>
            <input type="password" v-model="form.password" minlength="6" required>
          </label>
        </div>

        <p class="form-error" v-if="error">{{ error }}</p>

        <div class="form-actions">
          <router-link :to="{ name: 'admin-companies' }" class="cancel-btn">{{ $t('common.cancel') }}</router-link>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? $t('adminManagerAccountForm.creating') : $t('adminManagerAccountForm.createAccount') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useCompaniesStore } from '@/store/companies'
import { useToastStore } from '@/store/toast'

export default {
  name: 'AdminManagerAccountFormPage',

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      form: { name: '', email: '', password: '' },
      error: '',
      saving: false
    }
  },

  computed: {
    companiesStore () {
      return useCompaniesStore()
    },
    company () {
      return this.companiesStore.companies.find(c => c.id === this.id)
    },
    formTitle () {
      return this.company
        ? this.$t('adminManagerAccountForm.titleForCompany', { company: this.company.name })
        : this.$t('adminManagerAccountForm.title')
    }
  },

  created () {
    this.companiesStore.fetchAll()
  },

  methods: {
    async save () {
      if (!this.form.name.trim() || !this.form.email.trim() || this.form.password.length < 6) {
        this.error = this.$t('adminManagerAccountForm.errorRequired')
        return
      }
      this.saving = true
      this.error = ''
      try {
        await this.companiesStore.createManagerAccount({
          name: this.form.name,
          email: this.form.email,
          password: this.form.password,
          company_id: this.id
        })
        useToastStore().add({ type: 'success', message: this.$t('adminManagerAccountForm.successMessage', { email: this.form.email }) })
        this.$router.push({ name: 'admin-companies' })
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

.field input {
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
