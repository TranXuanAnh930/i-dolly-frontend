<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'manager-events' }" class="back-link">&larr; {{ $t('managerEventForm.backToEvents') }}</router-link>

    <div class="form-wrap">
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
            <input type="number" min="1" v-model.number="form.capacity" required :disabled="isEventLocked">
          </label>
          <label class="field" v-if="isEditing">
            <span class="field__label">{{ $t('managerEvents.status') }}</span>
            <select v-model="form.status">
              <option v-for="status in statusOptions" :key="status" :value="status">{{ statusLabel(status) }}</option>
            </select>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerEventForm.eventDateTime') }}</span>
            <input type="datetime-local" v-model="form.event_datetime" required :disabled="isEventLocked">
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerEventForm.doorsOpen') }}</span>
            <input type="datetime-local" v-model="form.doors_open_at" :disabled="isEventLocked">
          </label>
        </div>

        <p class="field__hint" v-if="isEventLocked">{{ $t('managerEventForm.dateLockedHint') }}</p>

        <label class="field">
          <span class="field__label">{{ $t('common.description') }}</span>
          <textarea v-model="form.description" rows="4"></textarea>
        </label>

        <p class="form-error" v-if="error">{{ error }}</p>

        <div class="form-actions">
          <router-link :to="{ name: 'manager-events' }" class="cancel-btn">{{ $t('common.cancel') }}</router-link>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? $t('common.saving') : $t('common.save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ConcertsService } from '@/services/concerts.service'
import { useToastStore } from '@/store/toast'

const STATUS_OPTIONS = ['scheduled', 'on_sale', 'sold_out', 'completed', 'cancelled']

// Mirrors concert_service.py's _EVENT_OPEN_STATUSES — once a concert has
// gone on sale (or further), fans may already hold tickets/lottery entries
// against its date/capacity, so the backend 403s a manager's date/doors-
// open/capacity change. "cancelled" is excluded on purpose: cancelling
// unlocks the concert again.
const EVENT_OPEN_STATUSES = ['on_sale', 'sold_out', 'completed']

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
      concerts: [],
      venues: [],
      form: emptyForm(),
      error: '',
      saving: false,
      statusOptions: STATUS_OPTIONS
    }
  },

  computed: {
    isEditing () {
      return !!this.id
    },
    concert () {
      return this.isEditing ? this.concerts.find(c => c.id === this.id) : null
    },
    // A manager is always scoped to their own company; on edit the
    // concert's own (immutable) company applies — see AdminEventFormPage
    // for the admin equivalent, which picks a company via a dropdown on
    // create.
    companyId () {
      if (this.isEditing) return this.concert ? this.concert.company_id : ''
      return this.$currentUser.company_id
    },
    // Based on the concert's status as originally loaded, not the
    // in-progress `form.status` selection — picking "Cancelled" in the
    // dropdown below doesn't unlock these fields in the same submit, since
    // the backend checks the status the row still has *before* this save
    // (matching update_concert). Cancel and save first, then re-open Edit
    // to change the date/doors-open time/capacity.
    isEventLocked () {
      return this.isEditing && !!this.concert && EVENT_OPEN_STATUSES.includes(this.concert.status)
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
      // When locked, echo back the concert's own event_datetime/
      // doors_open_at untouched rather than round-tripping through the
      // <input type="datetime-local"> fields — that input truncates to
      // minute precision, but the stored value carries seconds/
      // microseconds (e.g. "...T10:34:47.849240Z"), so even an unedited
      // save would re-derive a *different* value and trip the backend's
      // "did the date actually change" check on every single save of an
      // on-sale event, not just ones that touch the date. capacity has no
      // such precision issue (a plain disabled number input keeps its
      // loaded value as-is), so it's sent straight from form.capacity.
      const fields = {
        title: this.form.title,
        venue_id: this.form.venue_id,
        description: this.form.description || null,
        capacity: this.form.capacity,
        event_datetime: this.isEventLocked ? this.concert.event_datetime : fromDatetimeLocal(this.form.event_datetime),
        doors_open_at: this.isEventLocked ? this.concert.doors_open_at : fromDatetimeLocal(this.form.doors_open_at)
      }
      try {
        if (this.isEditing) {
          await ConcertsService.update(this.id, { ...fields, status: this.form.status })
          useToastStore().add({ type: 'success', message: this.$t('managerEventForm.updateSuccess') })
        } else {
          await ConcertsService.create({ ...fields, company_id: this.companyId })
        }
        this.$router.push({ name: 'manager-events' })
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

  &:disabled {
    background: $color-gray-100;
    color: $color-gray-500;
    cursor: not-allowed;
  }
}

.field textarea {
  resize: vertical;
}

.field__hint {
  margin-top: -6px;
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-500;
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
