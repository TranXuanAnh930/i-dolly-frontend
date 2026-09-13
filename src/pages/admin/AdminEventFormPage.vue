<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'admin-events' }" class="back-link">&larr; {{ $t('managerEventForm.backToEvents') }}</router-link>

    <label class="company-picker" v-if="!isEditing">
      <span>{{ $t('common.company') }}</span>
      <select v-model="selectedCompanyId">
        <option value="">{{ $t('common.selectCompanyPlaceholder') }}</option>
        <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">{{ company.name }}</option>
      </select>
    </label>

    <p class="empty-note" v-if="!isEditing && !companyId">{{ $t('managerEventForm.selectCompanyPrompt') }}</p>

    <div class="form-wrap" v-else>
      <h3 class="form-card__title">{{ isEditing ? $t('managerEventForm.editTitle') : $t('managerEventForm.addTitle') }}</h3>

      <form class="form-card" @submit.prevent="save">
        <div class="field-grid">
          <label class="field">
            <span class="field__label">{{ $t('managerEvents.titleLabel') }}</span>
            <input v-model="form.title" required>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerEvents.venue') }}</span>
            <select v-model="form.venue_id" required>
              <option value="" disabled>{{ $t('managerEventForm.selectVenuePlaceholder') }}</option>
              <option v-for="venue in venues" :key="venue.id" :value="venue.id">{{ venue.name }} · {{ venue.city }}</option>
            </select>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerEventForm.capacity') }}</span>
            <input type="number" min="1" v-model.number="form.capacity" required>
          </label>
          <label class="field" v-if="isEditing">
            <span class="field__label">{{ $t('managerEvents.status') }}</span>
            <select v-model="form.status">
              <option v-for="status in statusOptions" :key="status" :value="status">{{ statusLabel(status) }}</option>
            </select>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerEventForm.eventDateTime') }}</span>
            <input type="datetime-local" v-model="form.event_datetime" required>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerEventForm.doorsOpen') }}</span>
            <input type="datetime-local" v-model="form.doors_open_at">
          </label>
        </div>

        <label class="field">
          <span class="field__label">{{ $t('common.description') }}</span>
          <textarea v-model="form.description" rows="4"></textarea>
        </label>

        <p class="form-error" v-if="error">{{ error }}</p>

        <div class="form-actions">
          <router-link :to="{ name: 'admin-events' }" class="cancel-btn">{{ $t('common.cancel') }}</router-link>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? $t('common.saving') : $t('common.save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ConcertsService } from '@/services/concerts.service'
import { useCompaniesStore } from '@/store/companies'
import { useToastStore } from '@/store/toast'

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
  name: 'AdminEventFormPage',

  props: {
    id: { type: String, default: null }
  },

  data () {
    return {
      concerts: [],
      venues: [],
      selectedCompanyId: this.$route.query.company_id || '',
      form: emptyForm(),
      error: '',
      saving: false,
      statusOptions: STATUS_OPTIONS
    }
  },

  computed: {
    companiesStore () {
      return useCompaniesStore()
    },
    isEditing () {
      return !!this.id
    },
    concert () {
      return this.isEditing ? this.concerts.find(c => c.id === this.id) : null
    },
    // On edit the concert's own (immutable) company applies; on create an
    // admin picks one — see ManagerEventFormPage for the manager
    // equivalent, always scoped to their own company.
    companyId () {
      if (this.isEditing) return this.concert ? this.concert.company_id : ''
      return this.selectedCompanyId
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
    this.fetchPage()
    this.companiesStore.fetchAll()
  },

  methods: {
    async fetchPage () {
      try {
        const response = await ConcertsService.getManagerEventsPagePublic()
        this.concerts = response.data.concerts
        this.venues = response.data.venues
      } catch (error) {
        this.error = error.message
      }
    },
    statusLabel (status) {
      const key = 'status' + status.split('_').map(part => part[0].toUpperCase() + part.slice(1)).join('')
      return this.$t(`events.${key}`)
    },
    async save () {
      if (!this.form.title.trim() || !this.form.venue_id || !this.form.event_datetime) {
        this.error = this.$t('managerEventForm.errorRequired')
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
          await ConcertsService.update(this.id, { ...fields, status: this.form.status })
          useToastStore().add({ type: 'success', message: this.$t('managerEventForm.updateSuccess') })
        } else {
          await ConcertsService.create({ ...fields, company_id: this.companyId })
        }
        this.$router.push({ name: 'admin-events' })
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
  // Grid items default to min-width: auto, so a long <option> (e.g. a
  // venue's name + city) forces its whole column wider than the sibling
  // column's 1fr share instead of the two columns splitting evenly.
  min-width: 0;
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
