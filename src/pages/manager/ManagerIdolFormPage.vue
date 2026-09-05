<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'manager-idols' }" class="back-link">&larr; Back to idols</router-link>

    <label class="company-picker" v-if="isAdmin && !isEditing">
      <span>Company</span>
      <select v-model="selectedCompanyId">
        <option value="">Select a company…</option>
        <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">{{ company.name }}</option>
      </select>
    </label>

    <p class="empty-note" v-if="!isEditing && !companyId">Select a company above to add an idol.</p>

    <form class="form-card" v-else @submit.prevent="save">
      <h3 class="form-card__title">{{ isEditing ? 'Edit idol' : 'Add idol' }}</h3>

      <div class="field-grid">
        <label class="field">
          <span class="field__label">Name</span>
          <input v-model="form.name" required>
        </label>
        <label class="field">
          <span class="field__label">Group</span>
          <select v-model="form.group_id">
            <option value="">None</option>
            <option v-for="group in myGroups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Date of birth</span>
          <input type="date" v-model="form.date_of_birth">
        </label>
        <label class="field">
          <span class="field__label">Hometown</span>
          <input v-model="form.hometown">
        </label>
        <label class="field">
          <span class="field__label">Color</span>
          <select v-model="form.color_id">
            <option value="">None</option>
            <option v-for="color in colors" :key="color.id" :value="color.id">{{ color.name }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Photo</span>
          <input type="file" accept="image/*" @change="onImageChange">
        </label>
      </div>

      <label class="field">
        <span class="field__label">Short intro</span>
        <input v-model="form.short_intro" maxlength="500">
      </label>
      <label class="field">
        <span class="field__label">Long description</span>
        <textarea v-model="form.long_description" rows="4"></textarea>
      </label>

      <p class="form-error" v-if="error">{{ error }}</p>

      <div class="form-actions">
        <router-link :to="{ name: 'manager-idols' }" class="cancel-btn">Cancel</router-link>
        <button type="submit" class="save-btn" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
      </div>
    </form>
  </div>
</template>

<script>
import { useCompaniesStore } from '@/store/companies'
import { IdolsService } from '@/services/idols.service'

function emptyForm () {
  return {
    name: '',
    group_id: '',
    date_of_birth: '',
    hometown: '',
    color_id: '',
    short_intro: '',
    long_description: ''
  }
}

export default {
  name: 'ManagerIdolFormPage',

  props: {
    id: { type: String, default: null }
  },

  data () {
    return {
      idols: [],
      groups: [],
      colors: [],
      selectedCompanyId: this.$route.query.company_id || '',
      form: emptyForm(),
      imageFile: null,
      error: '',
      saving: false
    }
  },

  computed: {
    companiesStore () {
      return useCompaniesStore()
    },
    isAdmin () {
      return this.$currentUser.role === 'admin'
    },
    isEditing () {
      return !!this.id
    },
    idol () {
      return this.isEditing ? this.idols.find(i => i.id === this.id) : null
    },
    // A manager is always scoped to their own company; on edit the
    // idol's own (immutable) company applies; on create an admin picks one.
    companyId () {
      if (this.isEditing) return this.idol ? this.idol.company_id : ''
      return this.isAdmin ? this.selectedCompanyId : this.$currentUser.company_id
    },
    myGroups () {
      return this.groups.filter(group => group.company_id === this.companyId)
    }
  },

  watch: {
    idol: {
      immediate: true,
      handler (idol) {
        if (!idol) return
        this.form = {
          name: idol.name,
          group_id: idol.group_id || '',
          date_of_birth: idol.date_of_birth || '',
          hometown: idol.hometown || '',
          color_id: idol.color_id || '',
          short_intro: idol.short_intro || '',
          long_description: idol.long_description || ''
        }
      }
    }
  },

  created () {
    this.fetchPage()
    if (this.isAdmin) this.companiesStore.fetchAll()
  },

  methods: {
    async fetchPage () {
      try {
        const response = await IdolsService.getManagerIdolFormPagePublic()
        this.idols = response.data.idols
        this.groups = response.data.groups
        this.colors = response.data.colors
      } catch (error) {
        this.error = error.message
      }
    },
    onImageChange (event) {
      this.imageFile = event.target.files[0] || null
    },
    async save () {
      if (!this.form.name.trim()) {
        this.error = 'Name is required.'
        return
      }
      this.saving = true
      this.error = ''
      const fields = {
        name: this.form.name,
        group_id: this.form.group_id || null,
        date_of_birth: this.form.date_of_birth || null,
        hometown: this.form.hometown || null,
        color_id: this.form.color_id || null,
        short_intro: this.form.short_intro || null,
        long_description: this.form.long_description || null
      }
      try {
        if (this.isEditing) {
          await IdolsService.update(this.id, fields)
          if (this.imageFile) await IdolsService.uploadImage(this.id, this.imageFile)
        } else {
          await IdolsService.create({ ...fields, company_id: this.companyId, image: this.imageFile })
        }
        this.$router.push({ name: 'manager-idols' })
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
.field select,
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
