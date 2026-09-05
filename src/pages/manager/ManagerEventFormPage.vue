<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'manager-events' }" class="back-link">&larr; Back to events</router-link>

    <label class="company-picker" v-if="isAdmin && !isEditing">
      <span>Company</span>
      <select v-model="selectedCompanyId">
        <option value="">Select a company…</option>
        <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">{{ company.name }}</option>
      </select>
    </label>

    <p class="empty-note" v-if="!isEditing && !companyId">Select a company above to add an event.</p>

    <form class="form-card" v-else @submit.prevent="save">
      <h3 class="form-card__title">{{ isEditing ? 'Edit event' : 'Add event' }}</h3>

      <div class="field-grid">
        <label class="field">
          <span class="field__label">Title</span>
          <input v-model="form.title" required>
        </label>
        <label class="field">
          <span class="field__label">Venue</span>
          <select v-model="form.venue_id" required>
            <option value="" disabled>Select a venue…</option>
            <option v-for="venue in concertsStore.venues" :key="venue.id" :value="venue.id">{{ venue.name }} · {{ venue.city }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Capacity</span>
          <input type="number" min="1" v-model.number="form.capacity" required>
        </label>
        <label class="field" v-if="isEditing">
          <span class="field__label">Status</span>
          <select v-model="form.status">
            <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Event date &amp; time</span>
          <input type="datetime-local" v-model="form.event_datetime" required>
        </label>
        <label class="field">
          <span class="field__label">Doors open</span>
          <input type="datetime-local" v-model="form.doors_open_at">
        </label>
      </div>

      <label class="field">
        <span class="field__label">Description</span>
        <textarea v-model="form.description" rows="4"></textarea>
      </label>

      <p class="form-error" v-if="error">{{ error }}</p>

      <div class="form-actions">
        <router-link :to="{ name: 'manager-events' }" class="cancel-btn">Cancel</router-link>
        <button type="submit" class="save-btn" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
      </div>
    </form>
  </div>
</template>

<script>
import { useConcertsStore } from '@/store/concerts'
import { useCompaniesStore } from '@/store/companies'

const STATUS_OPTIONS = ['scheduled', 'on_sale', 'sold_out', 'completed', 'cancelled']

function toDatetimeLocal (iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromDatetimeLocal (value) {
  return value ? new Date(value).toISOString() : null
}

function emptyForm () {
  return { title: '', venue_id: '', capacity: '', event_datetime: '', doors_open_at: '', description: '', status: STATUS_OPTIONS[0] }
}

export default {
  name: 'ManagerEventFormPage',

  props: {
    id: { type: String, default: null }
  },

  data () {
    return {
      selectedCompanyId: this.$route.query.company_id || '',
      form: emptyForm(),
      error: '',
      saving: false,
      statusOptions: STATUS_OPTIONS
    }
  },

  computed: {
    concertsStore () {
      return useConcertsStore()
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
    concert () {
      return this.isEditing ? this.concertsStore.concertById(this.id) : null
    },
    companyId () {
      if (this.isEditing) return this.concert ? this.concert.company_id : ''
      return this.isAdmin ? this.selectedCompanyId : this.$currentUser.company_id
    }
  },

  watch: {
    concert: {
      immediate: true,
      handler (concert) {
        if (!concert) return
        this.form = {
          title: concert.title,
          venue_id: concert.venue_id,
          capacity: concert.capacity,
          event_datetime: toDatetimeLocal(concert.event_datetime),
          doors_open_at: toDatetimeLocal(concert.doors_open_at),
          description: concert.description || '',
          status: concert.status
        }
      }
    }
  },

  created () {
    this.concertsStore.fetchAll()
    if (this.isAdmin) this.companiesStore.fetchAll()
  },

  methods: {
    async save () {
      if (!this.form.title.trim() || !this.form.venue_id || !this.form.event_datetime) {
        this.error = 'Title, venue and event date are required.'
        return
      }
      this.saving = true
      this.error = ''
      const fields = {
        title: this.form.title,
        venue_id: this.form.venue_id,
        description: this.form.description || null,
        capacity: this.form.capacity,
        event_datetime: fromDatetimeLocal(this.form.event_datetime),
        doors_open_at: fromDatetimeLocal(this.form.doors_open_at)
      }
      try {
        if (this.isEditing) {
          await this.concertsStore.updateConcert(this.id, { ...fields, status: this.form.status })
        } else {
          await this.concertsStore.createConcert({ ...fields, company_id: this.companyId })
        }
        this.$router.push({ name: 'manager-events' })
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
