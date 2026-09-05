<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'manager-groups' }" class="back-link">&larr; Back to groups</router-link>

    <label class="company-picker" v-if="isAdmin && !isEditing">
      <span>Company</span>
      <select v-model="selectedCompanyId">
        <option value="">Select a company…</option>
        <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">{{ company.name }}</option>
      </select>
    </label>

    <p class="empty-note" v-if="!isEditing && !companyId">Select a company above to add a group.</p>

    <form class="form-card" v-else @submit.prevent="save">
      <h3 class="form-card__title">{{ isEditing ? 'Edit group' : 'Add group' }}</h3>

      <div class="field-grid">
        <label class="field">
          <span class="field__label">Name</span>
          <input v-model="form.name" required>
        </label>
        <label class="field">
          <span class="field__label">Debut date</span>
          <input type="date" v-model="form.debut_date">
        </label>
      </div>

      <label class="field">
        <span class="field__label">Description</span>
        <textarea v-model="form.description" rows="4"></textarea>
      </label>

      <p class="form-error" v-if="error">{{ error }}</p>

      <div class="form-actions">
        <router-link :to="{ name: 'manager-groups' }" class="cancel-btn">Cancel</router-link>
        <button type="submit" class="save-btn" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
      </div>
    </form>
  </div>
</template>

<script>
import { useIdolsStore } from '@/store/idols'
import { useCompaniesStore } from '@/store/companies'

function emptyForm () {
  return { name: '', debut_date: '', description: '' }
}

export default {
  name: 'ManagerGroupFormPage',

  props: {
    id: { type: String, default: null }
  },

  data () {
    return {
      selectedCompanyId: this.$route.query.company_id || '',
      form: emptyForm(),
      error: '',
      saving: false
    }
  },

  computed: {
    idolsStore () {
      return useIdolsStore()
    },
    companiesStore () {
      return useCompaniesStore()
    },
    isAdmin () {
      return this.$currentUser.role === 'admin'
    },
    isEditing () {
      return !!this.id
    },
    group () {
      return this.isEditing ? this.idolsStore.groupById(this.id) : null
    },
    companyId () {
      if (this.isEditing) return this.group ? this.group.company_id : ''
      return this.isAdmin ? this.selectedCompanyId : this.$currentUser.company_id
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
    this.idolsStore.fetchAll()
    if (this.isAdmin) this.companiesStore.fetchAll()
  },

  methods: {
    async save () {
      if (!this.form.name.trim()) {
        this.error = 'Name is required.'
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
          await this.idolsStore.updateGroup(this.id, fields)
        } else {
          await this.idolsStore.createGroup({ ...fields, company_id: this.companyId })
        }
        this.$router.push({ name: 'manager-groups' })
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

.form-card {
  background: $color-white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 640px;
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
