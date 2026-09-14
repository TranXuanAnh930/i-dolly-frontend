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

    <!-- Ticket types + campaigns only make sense once the concert itself
         exists — a brand new one lands here right after its first save. -->
    <div class="form-wrap" v-if="isEditing">
      <h3 class="form-card__title">{{ $t('managerEventForm.ticketTypesTitle') }}</h3>
      <div class="form-card">
        <div class="tier-list" v-if="ticketTypes.length">
          <div class="tier-row" v-for="tier in ticketTypes" :key="tier.id">
            <div class="tier-row__head">
              <span class="tier-row__name">{{ tierLabel(tier.tier) }}</span>
              <span class="tier-row__method">{{ tier.sale_method === 'lottery' ? $t('eventDetail.lotteryLabel') : $t('eventDetail.directSaleLabel') }}</span>
              <span class="tier-row__price">&yen;{{ formatNumber(tier.price) }}</span>
              <span class="tier-row__qty">{{ tier.sale_method === 'lottery' ? $t('managerEventForm.entriesOfCapacity', { entries: entriesFor(tier.id), capacity: tier.total_quantity }) : $t('managerEventForm.soldOfTotal', { sold: tier.sold_quantity, total: tier.total_quantity }) }}</span>
            </div>

            <div class="campaign-list" v-if="campaignsFor(tier.id).length">
              <div class="campaign-row" v-for="campaign in campaignsFor(tier.id)" :key="campaign.id">
                <span class="campaign-row__status" :class="`campaign-row__status--${campaign.status}`">{{ campaign.status }}</span>
                <span class="campaign-row__window">{{ formatDate(campaign.kind === 'lottery' ? campaign.entry_start_at : campaign.sale_start_at) }} &rarr; {{ formatDate(campaign.kind === 'lottery' ? campaign.entry_end_at : campaign.sale_end_at) }}</span>
              </div>
            </div>
            <p class="empty-note" v-else>{{ $t('managerEventForm.noCampaigns') }}</p>

            <template v-if="campaignFormTierId !== tier.id">
              <button type="button" class="add-link" :disabled="hasOpenCampaign(tier.id)" @click="openAddCampaign(tier)">{{ $t('managerEventForm.addCampaign') }}</button>
              <p class="field__hint" v-if="hasOpenCampaign(tier.id)">{{ $t('managerEventForm.campaignAlreadyOpenHint') }}</p>
            </template>

            <form v-else class="field-grid campaign-form" @submit.prevent="addCampaign(tier)">
              <template v-if="tier.sale_method === 'lottery'">
                <label class="field">
                  <span class="field__label">{{ $t('managerEventForm.entryStart') }}</span>
                  <input type="datetime-local" v-model="newCampaign.entry_start_at" required>
                </label>
                <label class="field">
                  <span class="field__label">{{ $t('managerEventForm.entryEnd') }}</span>
                  <input type="datetime-local" v-model="newCampaign.entry_end_at" required>
                </label>
                <label class="field">
                  <span class="field__label">{{ $t('managerEventForm.maxEntriesPerUser') }}</span>
                  <input type="number" min="1" v-model.number="newCampaign.max_entries_per_user">
                </label>
                <label class="field">
                  <span class="field__label">{{ $t('managerEventForm.paymentDeadlineHours') }}</span>
                  <input type="number" min="1" v-model.number="newCampaign.payment_deadline_hours">
                </label>
              </template>
              <template v-else>
                <label class="field">
                  <span class="field__label">{{ $t('managerEventForm.saleStart') }}</span>
                  <input type="datetime-local" v-model="newCampaign.sale_start_at" required>
                </label>
                <label class="field">
                  <span class="field__label">{{ $t('managerEventForm.saleEnd') }}</span>
                  <input type="datetime-local" v-model="newCampaign.sale_end_at" required>
                </label>
              </template>
              <div class="form-actions campaign-form__actions">
                <button type="button" class="cancel-btn" @click="campaignFormTierId = null">{{ $t('common.cancel') }}</button>
                <button type="submit" class="save-btn" :disabled="savingCampaign">{{ savingCampaign ? $t('common.saving') : $t('common.save') }}</button>
              </div>
            </form>
          </div>
        </div>
        <p class="empty-note" v-else>{{ $t('managerEventForm.noTicketTypes') }}</p>

        <p class="form-error" v-if="campaignError">{{ campaignError }}</p>

        <button v-if="!showAddTicketType" type="button" class="add-link" @click="openAddTicketType">{{ $t('managerEventForm.addTicketType') }}</button>

        <form v-else class="ticket-type-form" @submit.prevent="addTicketType">
          <div class="field-grid">
            <label class="field">
              <span class="field__label">{{ $t('managerEventForm.tier') }}</span>
              <select v-model="newTicketType.tier">
                <option value="vip">{{ $t('managerEventForm.tierVip') }}</option>
                <option value="premium">{{ $t('managerEventForm.tierPremium') }}</option>
                <option value="regular">{{ $t('managerEventForm.tierRegular') }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field__label">{{ $t('managerEventForm.saleMethod') }}</span>
              <select v-model="newTicketType.sale_method">
                <option value="direct">{{ $t('eventDetail.directSaleLabel') }}</option>
                <option value="lottery">{{ $t('eventDetail.lotteryLabel') }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field__label">{{ $t('managerEventForm.price') }}</span>
              <input type="number" min="0" step="1" v-model.number="newTicketType.price" required>
            </label>
            <label class="field">
              <span class="field__label">{{ $t('managerEventForm.totalQuantity') }}</span>
              <input type="number" min="1" v-model.number="newTicketType.total_quantity" required>
            </label>
          </div>
          <p class="form-error" v-if="ticketTypeError">{{ ticketTypeError }}</p>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="showAddTicketType = false">{{ $t('common.cancel') }}</button>
            <button type="submit" class="save-btn" :disabled="savingTicketType">{{ savingTicketType ? $t('common.saving') : $t('common.save') }}</button>
          </div>
        </form>
      </div>

      <h3 class="form-card__title">{{ $t('managerEventForm.lotteryDrawTitle') }}</h3>
      <div class="form-card">
        <p class="field__hint">{{ canDrawLottery ? $t('managerEventForm.lotteryDrawReady') : $t('managerEventForm.lotteryDrawNotReady') }}</p>
        <div class="form-actions">
          <button type="button" class="save-btn" :disabled="!canDrawLottery || drawing" @click="runLotteryDraw">{{ drawing ? $t('common.saving') : $t('managerEvents.runLotteryDraw') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns'

import { ConcertsService } from '@/services/concerts.service'
import { TicketTypesService } from '@/services/ticketTypes.service'
import { LotteryService } from '@/services/lottery.service'
import { DirectSaleCampaignService } from '@/services/directSaleCampaign.service'
import { useToastStore } from '@/store/toast'
import { formatNumber } from '@/utils/format'

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

function emptyTicketTypeForm () {
  return { tier: 'regular', sale_method: 'direct', price: '', total_quantity: '' }
}

// Shape depends on which tier's "add campaign" form is open — lottery
// needs an entry window + per-fan cap + payment deadline, direct-sale
// just needs a sale window (see LotteryCampaignCreate/DirectSaleCampaignCreate
// in the backend repo's app/schema/).
function emptyCampaignForm (saleMethod) {
  return saleMethod === 'lottery'
    ? { entry_start_at: '', entry_end_at: '', max_entries_per_user: 1, payment_deadline_hours: 48 }
    : { sale_start_at: '', sale_end_at: '' }
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
      statusOptions: STATUS_OPTIONS,
      ticketTypes: [],
      lotteryCampaigns: [],
      directSaleCampaigns: [],
      showAddTicketType: false,
      newTicketType: emptyTicketTypeForm(),
      ticketTypeError: '',
      savingTicketType: false,
      // Which ticket type's inline "add campaign" form is currently open —
      // only one at a time, rather than tracking form state per tier.
      campaignFormTierId: null,
      newCampaign: emptyCampaignForm('direct'),
      campaignError: '',
      savingCampaign: false,
      drawing: false
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
    },
    openLotteryCampaigns () {
      return this.lotteryCampaigns.filter(campaign => campaign.status === 'open')
    },
    // Mirrors lottery_draw_service.draw_lottery's own gate exactly: it
    // rejects the whole draw if ANY open campaign's entry window hasn't
    // ended yet. That check only runs inside the async Celery task, though
    // — the endpoint that enqueues it just says "queued" regardless — so
    // without this the manager gets no feedback at all that the draw they
    // just "successfully" queued silently did nothing.
    canDrawLottery () {
      if (!this.openLotteryCampaigns.length) return false
      const now = new Date()
      return this.openLotteryCampaigns.every(campaign => new Date(campaign.entry_end_at) < now)
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
    this.fetchTicketData()
  },

  methods: {
    formatNumber,
    async fetchPage () {
      try {
        const response = await ConcertsService.getManagerEventsPagePublic()
        this.concerts = response.data.concerts
        this.venues = response.data.venues
      } catch (error) {
        this.error = error.message
      }
    },
    // The concert-detail bundle already carries ticket_types and every
    // lottery/direct-sale campaign for this concert (see
    // ConcertsService.getDetailPublic) — reused here instead of a bespoke
    // manager-only read endpoint. A brand new concert has no id yet, so
    // there's nothing to fetch until isEditing.
    async fetchTicketData () {
      if (!this.isEditing) return
      try {
        const response = await ConcertsService.getDetailPublic(this.id)
        this.ticketTypes = response.data.ticket_types
        this.lotteryCampaigns = response.data.lottery_campaigns
        this.directSaleCampaigns = response.data.direct_sale_campaigns
      } catch (error) {
        this.ticketTypeError = error.message
      }
    },
    tierLabel (tier) {
      return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : ''
    },
    formatDate (iso) {
      return iso ? format(parseISO(iso), 'MMM d, yyyy · h:mm a') : '—'
    },
    campaignsFor (tierId) {
      return [
        ...this.lotteryCampaigns.filter(campaign => campaign.ticket_type_id === tierId).map(campaign => ({ ...campaign, kind: 'lottery' })),
        ...this.directSaleCampaigns.filter(campaign => campaign.ticket_type_id === tierId).map(campaign => ({ ...campaign, kind: 'direct' }))
      ]
    },
    // Total fans who've applied across every lottery campaign this tier has
    // ever had (usually just one) — distinct from tier.sold_quantity, which
    // only counts seats actually allocated by the draw, not applications.
    entriesFor (tierId) {
      return this.lotteryCampaigns
        .filter(campaign => campaign.ticket_type_id === tierId)
        .reduce((sum, campaign) => sum + campaign.entry_count, 0)
    },
    // A tier can only ever have one live campaign at a time — the backend
    // has no concept of "queuing" a second one behind an open campaign, so
    // adding another before the current one closes/is cancelled would just
    // give this tier two live sale windows fans could act on simultaneously.
    hasOpenCampaign (tierId) {
      return this.campaignsFor(tierId).some(campaign => campaign.status === 'open')
    },
    openAddTicketType () {
      this.showAddTicketType = true
      this.newTicketType = emptyTicketTypeForm()
      this.ticketTypeError = ''
    },
    async addTicketType () {
      if (!this.newTicketType.price || !this.newTicketType.total_quantity) {
        this.ticketTypeError = this.$t('managerEventForm.errorTicketTypeRequired')
        return
      }
      this.savingTicketType = true
      this.ticketTypeError = ''
      try {
        await TicketTypesService.create({
          concert_id: this.id,
          tier: this.newTicketType.tier,
          sale_method: this.newTicketType.sale_method,
          price: this.newTicketType.price,
          total_quantity: this.newTicketType.total_quantity
        })
        this.showAddTicketType = false
        await this.fetchTicketData()
        useToastStore().add({ type: 'success', message: this.$t('managerEventForm.ticketTypeAdded') })
      } catch (error) {
        this.ticketTypeError = error.message
      } finally {
        this.savingTicketType = false
      }
    },
    openAddCampaign (tier) {
      this.campaignFormTierId = tier.id
      this.newCampaign = emptyCampaignForm(tier.sale_method)
      this.campaignError = ''
    },
    async addCampaign (tier) {
      this.savingCampaign = true
      this.campaignError = ''
      try {
        if (tier.sale_method === 'lottery') {
          await LotteryService.create({
            ticket_type_id: tier.id,
            entry_start_at: fromDatetimeLocal(this.newCampaign.entry_start_at),
            entry_end_at: fromDatetimeLocal(this.newCampaign.entry_end_at),
            max_entries_per_user: this.newCampaign.max_entries_per_user,
            payment_deadline_hours: this.newCampaign.payment_deadline_hours
          })
        } else {
          await DirectSaleCampaignService.create({
            ticket_type_id: tier.id,
            sale_start_at: fromDatetimeLocal(this.newCampaign.sale_start_at),
            sale_end_at: fromDatetimeLocal(this.newCampaign.sale_end_at)
          })
        }
        this.campaignFormTierId = null
        await this.fetchTicketData()
        useToastStore().add({ type: 'success', message: this.$t('managerEventForm.campaignAdded') })
      } catch (error) {
        this.campaignError = error.message
      } finally {
        this.savingCampaign = false
      }
    },
    // Enqueues the backend's async draw job (see concerts.service.js) —
    // this call only confirms the job was scheduled, not its outcome, so
    // there's nothing here to refetch immediately after. canDrawLottery
    // already keeps this disabled until every open campaign's entry window
    // has ended, mirroring the job's own gate (see that computed).
    async runLotteryDraw () {
      if (!window.confirm(this.$t('managerEvents.confirmLotteryDraw', { title: this.concert.title }))) return
      this.drawing = true
      try {
        await ConcertsService.drawLottery(this.id)
        useToastStore().add({ type: 'success', message: this.$t('managerEvents.lotteryDrawQueued') })
      } catch (error) {
        useToastStore().add({ type: 'error', message: error.message })
      } finally {
        this.drawing = false
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
          // Straight into Edit for the concert just created, not back to
          // the list — ticket types/campaigns can only be added once the
          // concert itself exists, so this is where a manager needs to
          // land next anyway.
          const response = await ConcertsService.create({ ...fields, company_id: this.companyId })
          this.$router.push({ name: 'manager-events-edit', params: { id: response.data.id } })
          return
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

.empty-note {
  font-family: $font-content;
  font-size: 13px;
  color: $color-gray-500;
}

.tier-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tier-row {
  border: 1.5px solid $color-line;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tier-row__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.tier-row__name {
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
}

.tier-row__method {
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-500;
  background: $color-gray-100;
  border-radius: 999px;
  padding: 3px 10px;
}

.tier-row__price {
  font-family: $font-content;
  font-weight: 900;
  font-size: 14px;
  color: $color-ink;
  margin-left: auto;
}

.tier-row__qty {
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-500;
}

.campaign-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campaign-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: $font-content;
  font-size: 12.5px;
  color: $color-font-main;
}

.campaign-row__status {
  flex: none;
  border-radius: 999px;
  padding: 2px 10px;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .02em;
  background: $color-gray-100;
  color: $color-gray-500;

  &--open {
    background: #e6f7ef;
    color: #147a52;
  }

  &--drawn,
  &--completed {
    background: $color-brand-tint;
    color: $color-brand;
  }

  &--cancelled {
    background: #fdeaf1;
    color: $color-error;
  }
}

.add-link {
  align-self: flex-start;
  border: none;
  background: none;
  padding: 4px 0;
  cursor: pointer;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-brand;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    color: $color-gray-400;
    cursor: not-allowed;

    &:hover {
      text-decoration: none;
    }
  }
}

.campaign-form {
  border-top: 1px dashed $color-line;
  padding-top: 12px;
}

.campaign-form__actions {
  grid-column: 1 / -1;
}
</style>
