<template>
  <div v-if="eligible" class="ticket-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <router-link :to="`/events/${concert.id}`" class="back-link">&larr; {{ concert.title }}</router-link>
        <p class="hero__eyebrow">{{ isLotteryTier ? $t('ticketPurchase.lotteryEntry') : $t('ticketPurchase.directSaleCheckout') }}</p>
        <h1 class="hero__title" :style="{ color: color.hex }">{{ $t('ticketPurchase.getTickets') }}</h1>

        <ol class="steps">
          <li class="step" :class="stepClass(1)">
            <span class="step__dot">{{ step > 1 ? '&check;' : '1' }}</span>
            <span class="step__label">{{ $t('ticketPurchase.stepTickets') }}</span>
          </li>
          <li class="step-line" :class="{ 'is-done': step > 1 }"></li>
          <li class="step" :class="stepClass(2)">
            <span class="step__dot">{{ step > 2 ? '&check;' : '2' }}</span>
            <span class="step__label">{{ step2Label }}</span>
          </li>
          <li class="step-line" :class="{ 'is-done': step > 2 }"></li>
          <li class="step" :class="stepClass(3)">
            <span class="step__dot">3</span>
            <span class="step__label">{{ $t('ticketPurchase.stepDone') }}</span>
          </li>
        </ol>
      </div>
    </section>

    <div class="wrapper content">
      <!-- Step 1: choose ticket tier -->
      <div v-if="step === 1" class="layout">
        <div class="panel">
          <h2 class="panel-title">{{ $t('ticketPurchase.chooseTier') }}</h2>

          <div class="field-block">
            <span class="field-block__label">{{ $t('ticketPurchase.tier') }}</span>
            <div class="option-list">
              <label
                v-for="tier in allTicketTypes"
                :key="tier.id"
                class="option-row"
                :class="{ 'is-selected': selectedTierId === tier.id }">
                <input type="radio" name="tier" :value="tier.id" v-model="selectedTierId">
                <span class="option-row__text">
                  <span class="option-row__title">{{ tierLabel(tier) }}</span>
                  <span class="option-row__note">{{ $t('eventDetail.leftSuffix', { count: remaining(tier) }) }} &middot; {{ tier.sale_method === 'lottery' ? $t('eventDetail.lotteryLabel') : $t('eventDetail.directSaleLabel') }}</span>
                </span>
                <span class="option-row__price">&yen;{{ formatNumber(withTax(tier.price)) }}</span>
              </label>
            </div>
          </div>

          <div class="field-block">
            <span class="field-block__label">{{ $t('ticketPurchase.quantity') }}</span>
            <div class="qty-control">
              <button type="button" class="qty-btn" @click="qty = Math.max(1, qty - 1)" :aria-label="$t('common.decreaseQuantity')">&minus;</button>
              <span class="qty-value">{{ qty }}</span>
              <button type="button" class="qty-btn" @click="qty = Math.min(6, qty + 1)" :aria-label="$t('common.increaseQuantity')">+</button>
            </div>
          </div>

          <h3 class="subhead">{{ $t('ticketPurchase.seatMap') }}</h3>
          <VenueSeatMap class="seat-map"/>
        </div>

        <div class="summary">
          <h2 class="summary__title">{{ $t('ticketPurchase.orderSummary') }}</h2>
          <p class="summary__event">{{ concert.title }}</p>
          <p class="summary__meta">{{ dateLabel }}<template v-if="doorsLabel"> &middot; {{ $t('events.doorsAt', { time: doorsLabel }) }}</template></p>
          <div class="summary__row">
            <span>{{ tierLabel(selectedTier) }} &times;{{ qty }}</span>
            <span>&yen;{{ formatNumber(total) }}</span>
          </div>
          <div class="summary__row summary__row--total">
            <span>{{ $t('ticketPurchase.total') }}</span>
            <span>&yen;{{ formatNumber(total) }}</span>
          </div>
          <button type="button" class="continue-btn" @click="proceed">{{ isLotteryTier ? $t('ticketPurchase.applyLottery') : $t('ticketPurchase.continueCheckout') }}</button>
        </div>
      </div>

      <!-- Step 2: payment -->
      <div v-else-if="step === 2" class="layout">
        <form class="panel" @submit.prevent="placeOrder">
          <h2 class="panel-title">{{ $t('ticketPurchase.contactPayment') }}</h2>

          <div class="field-grid">
            <label class="field">
              <span class="field__label">{{ $t('ticketPurchase.fullName') }}</span>
              <input type="text" v-model="form.name" :placeholder="$t('common.yourName')" autocomplete="name">
            </label>
            <label class="field">
              <span class="field__label">{{ $t('common.email') }}</span>
              <input type="text" v-model="form.email" placeholder="you@example.com" autocomplete="email">
            </label>
          </div>

          <h2 class="panel-title panel-title--spaced">{{ $t('ticketPurchase.paymentMock') }}</h2>

          <label class="field">
            <span class="field__label">{{ $t('ticketPurchase.cardNumber') }}</span>
            <input type="text" v-model="form.cardNumber" placeholder="4242 4242 4242 4242" autocomplete="cc-number" inputmode="numeric">
          </label>

          <div class="field-grid">
            <label class="field">
              <span class="field__label">{{ $t('ticketPurchase.expiry') }}</span>
              <input type="text" v-model="form.cardExpiry" placeholder="MM / YY" autocomplete="cc-exp">
            </label>
            <label class="field">
              <span class="field__label">{{ $t('ticketPurchase.cvc') }}</span>
              <input type="text" v-model="form.cardCvc" placeholder="123" autocomplete="cc-csc" inputmode="numeric">
            </label>
          </div>

          <p class="form-error" v-if="error" :key="error">{{ error }}</p>

          <div class="form-actions">
            <button type="button" class="back-btn" @click="step = 1">&larr; {{ $t('ticketPurchase.back') }}</button>
            <button type="submit" class="place-order-btn">{{ $t('ticketPurchase.placeOrder') }} &rarr;</button>
          </div>
        </form>

        <div class="summary">
          <h2 class="summary__title">{{ $t('ticketPurchase.orderSummary') }}</h2>
          <p class="summary__event">{{ concert.title }}</p>
          <p class="summary__meta">{{ dateLabel }}<template v-if="doorsLabel"> &middot; {{ $t('events.doorsAt', { time: doorsLabel }) }}</template></p>
          <div class="summary__row">
            <span>{{ tierLabel(selectedTier) }} &times;{{ qty }}</span>
            <span>&yen;{{ formatNumber(total) }}</span>
          </div>
          <div class="summary__row summary__row--total">
            <span>{{ $t('ticketPurchase.total') }}</span>
            <span>&yen;{{ formatNumber(total) }}</span>
          </div>
        </div>
      </div>

      <!-- Step 3: finish -->
      <div v-else class="confirmation">
        <div class="confirmation__badge">&check;</div>
        <template v-if="outcome === 'lottery'">
          <h2 class="confirmation__title">{{ $t('ticketPurchase.appliedTitle') }}</h2>
          <p class="confirmation__note">{{ $t('ticketPurchase.appliedNote', { orderNumber, tier: tierLabel(selectedTier), title: concert.title }) }}</p>
        </template>
        <template v-else>
          <h2 class="confirmation__title">{{ $t('ticketPurchase.wentTitle') }}</h2>
          <p class="confirmation__note">{{ $t('ticketPurchase.wentNote', { orderNumber, title: concert.title, date: dateLabel }) }}</p>
        </template>
        <div class="confirmation__actions">
          <router-link to="/history" class="confirmation__btn">{{ $t('ticketPurchase.viewHistory') }}</router-link>
          <router-link to="/events" class="confirmation__link">{{ $t('ticketPurchase.backToEvents') }}</router-link>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <p class="not-found__title">{{ ineligibleMessage }}</p>
    <router-link :to="concert ? `/events/${concert.id}` : '/events'" class="not-found__link">&larr; {{ $t('ticketPurchase.backToEvent') }}</router-link>
  </div>
</template>

<script>
import { parseISO } from 'date-fns'

import { useConcertsStore } from '@/store/concerts'
import { useNotificationStore } from '@/store/notifications'
import { formatDate, formatNumber } from '@/utils/format'
import { withTax } from '@/utils/tax'
import VenueSeatMap from '@/components/VenueSeatMap.vue'

export default {
  name: 'TicketPurchasePage',

  components: { VenueSeatMap },

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      step: 1,
      selectedTierId: null,
      qty: 1,
      form: {
        name: '',
        email: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: ''
      },
      error: '',
      orderNumber: '',
      outcome: null
    }
  },

  computed: {
    concertsStore () {
      return useConcertsStore()
    },
    concert () {
      return this.concertsStore.concertById(this.id)
    },
    color () {
      return this.concertsStore.colorForConcert(this.concert)
    },
    // Every tier for this concert — buyers can either apply for a lottery
    // tier or go straight to checkout for a direct-sale one.
    allTicketTypes () {
      return this.concert ? this.concertsStore.ticketTypesForConcert(this.concert.id) : []
    },
    eligible () {
      return !!this.concert && this.concert.status === 'on_sale' && this.allTicketTypes.length > 0
    },
    ineligibleMessage () {
      if (!this.concert) return this.$t('ticketPurchase.ineligibleNotFound')
      if (this.concert.status === 'sold_out') return this.$t('ticketPurchase.ineligibleSoldOut')
      if (this.concert.status === 'completed') return this.$t('ticketPurchase.ineligibleCompleted')
      if (this.concert.status === 'cancelled') return this.$t('ticketPurchase.ineligibleCancelled')
      return this.$t('ticketPurchase.ineligibleDefault')
    },
    selectedTier () {
      return this.allTicketTypes.find(tier => tier.id === this.selectedTierId) || this.allTicketTypes[0] || null
    },
    isLotteryTier () {
      return !!this.selectedTier && this.selectedTier.sale_method === 'lottery'
    },
    step2Label () {
      return this.isLotteryTier ? this.$t('ticketPurchase.stepEntry') : this.$t('ticketPurchase.stepPayment')
    },
    // Tax applied once to the pre-tax line total (price × qty), matching
    // how cartStore.lineTotal computes a product line's total.
    total () {
      return this.selectedTier ? withTax(this.selectedTier.price * this.qty) : 0
    },
    dateLabel () {
      return this.concert ? formatDate(parseISO(this.concert.event_datetime), 'EEE, MMM d, yyyy · h:mm a') : ''
    },
    doorsLabel () {
      return this.concert && this.concert.doors_open_at ? formatDate(parseISO(this.concert.doors_open_at), 'h:mm a') : null
    }
  },

  watch: {
    concert: {
      immediate: true,
      handler (concert) {
        if (concert) document.title = `Tickets · ${concert.title} | I-Dolly`
      }
    },
    id: {
      immediate: true,
      handler () {
        this.concertsStore.fetchAll().then(() => {
          if (this.concert) this.concertsStore.fetchTicketTypesForConcert(this.concert.id)
        })
      }
    },
    // Default to the first tier once ticket types load, and fall back if
    // the selected one ever stops being valid (e.g. switching events).
    allTicketTypes: {
      immediate: true,
      handler (tiers) {
        if (!tiers.some(tier => tier.id === this.selectedTierId)) {
          this.selectedTierId = tiers.length ? tiers[0].id : null
        }
      }
    }
  },

  created () {
    if (this.$currentUser.name) this.form.name = this.$currentUser.name
    if (this.$currentUser.email) this.form.email = this.$currentUser.email
  },

  methods: {
    formatNumber,
    withTax,
    stepClass (n) {
      return { 'is-active': this.step === n, 'is-done': this.step > n }
    },
    tierLabel (tier) {
      return tier ? tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1) : ''
    },
    remaining (tier) {
      return Math.max(0, tier.total_quantity - tier.sold_quantity)
    },
    // Lottery tiers skip checkout entirely — applying is a single click,
    // no payment involved, straight to the "you applied" confirmation.
    proceed () {
      if (this.isLotteryTier) {
        this.applyForLottery()
      } else {
        this.step = 2
      }
    },
    applyForLottery () {
      this.orderNumber = `LOT-${Math.floor(100000 + Math.random() * 900000)}`
      this.outcome = 'lottery'
      this.step = 3

      useNotificationStore().add({
        type: 'lottery-entry',
        titleKey: 'ticketPurchase.notifLotteryTitle',
        messageKey: 'ticketPurchase.notifLotteryMessage',
        messageParams: { orderNumber: this.orderNumber, tier: this.tierLabel(this.selectedTier), title: this.concert.title },
        detail: {
          orderNumber: this.orderNumber,
          concertId: this.concert.id,
          concertTitle: this.concert.title,
          tier: this.tierLabel(this.selectedTier),
          qty: this.qty,
          total: this.total
        },
        to: `/history/lottery/${this.orderNumber}`
      })
    },
    placeOrder () {
      if (!this.form.name.trim() || !this.form.email.trim()) {
        this.error = this.$t('ticketPurchase.errorContactEmail')
        return
      }
      if (!this.form.cardNumber.trim() || !this.form.cardExpiry.trim() || !this.form.cardCvc.trim()) {
        this.error = this.$t('ticketPurchase.errorPayment')
        return
      }

      this.error = ''
      this.orderNumber = `ID-${Math.floor(100000 + Math.random() * 900000)}`
      this.outcome = 'purchase'
      this.step = 3

      useNotificationStore().add({
        type: 'ticket',
        titleKey: 'ticketPurchase.notifPurchaseTitle',
        messageKey: 'ticketPurchase.notifPurchaseMessage',
        messageParams: { orderNumber: this.orderNumber, title: this.concert.title, amount: `¥${formatNumber(this.total)}` },
        detail: {
          orderNumber: this.orderNumber,
          concertId: this.concert.id,
          concertTitle: this.concert.title,
          tier: this.tierLabel(this.selectedTier),
          qty: this.qty,
          total: this.total
        },
        to: `/history/tickets/${this.orderNumber}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 24px 0 36px;
}

.hero__inner {
  position: relative;
}

.back-link {
  display: inline-block;
  color: $color-gray-500;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;

  &:hover {
    color: $color-brand;
  }
}

.hero__eyebrow {
  margin-top: 16px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: $color-gray-400;
}

.hero__title {
  margin-top: 4px;
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(28px, 5vw, 40px);
  color: $color-brand;
}

.steps {
  margin-top: 22px;
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step__dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: $color-white;
  border: 2px solid $color-line;
  color: $color-gray-400;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-content;
  font-weight: 900;
  font-size: 12px;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}

.step__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-400;
}

.step.is-active {
  .step__dot {
    background: $color-brand;
    border-color: $color-brand;
    color: $color-white;
  }
  .step__label {
    color: $color-brand;
  }
}

.step.is-done {
  .step__dot {
    background: #1fa876;
    border-color: #1fa876;
    color: $color-white;
  }
  .step__label {
    color: $color-ink;
  }
}

.step-line {
  width: 28px;
  height: 2px;
  background: $color-line;
  transition: background .15s ease;

  &.is-done {
    background: #1fa876;
  }
}

.content {
  padding-bottom: 90px;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  align-items: start;

  @include media_tablet {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: $color-white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.panel-title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 20px;
  color: $color-ink;
}

.panel-title--spaced {
  margin-top: 12px;
}

.field-block {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-block__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: $color-gray-500;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid $color-line;
  border-radius: 14px;
  padding: 12px 16px;
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease;

  input {
    accent-color: $color-brand;
    flex: none;
  }

  &:hover {
    border-color: $color-brand-tint;
  }

  &.is-selected {
    border-color: $color-brand;
    background: $color-brand-tint-2;
  }

  &.is-disabled {
    cursor: default;
    opacity: .55;

    &:hover {
      border-color: $color-line;
    }
  }
}

.option-row__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-row__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
}

.option-row__note {
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-400;
}

.option-row__price {
  flex: none;
  font-family: $font-content;
  font-weight: 900;
  font-size: 15px;
  color: $color-ink;
  font-variant-numeric: tabular-nums;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 14px;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1.5px solid $color-line;
  background: $color-white;
  color: $color-ink;
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: $color-brand;
    color: $color-brand;
  }
}

.qty-value {
  font-family: $font-content;
  font-weight: 700;
  font-size: 15px;
  min-width: 16px;
  text-align: center;
}

.subhead {
  margin-top: 22px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: $color-gray-500;
}

.seat-map {
  margin-top: 10px;
  max-width: 380px;
}

.field-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  border-radius: 12px;
  padding: 11px 14px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;

  &::placeholder {
    color: $color-gray-300;
  }

  &:focus {
    border-color: $color-brand;
    box-shadow: 0 0 0 4px $color-brand-tint;
  }
}

.form-error {
  margin-top: 14px;
  background: #fdeaf1;
  color: $color-error;
  border-radius: 12px;
  padding: 10px 14px;
  font-family: $font-content;
  font-size: 13px;
  font-weight: 700;
}

.form-actions {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-btn {
  border: none;
  background: none;
  padding: 8px 4px;
  cursor: pointer;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;

  &:hover {
    color: $color-brand;
  }
}

.place-order-btn {
  margin-left: auto;
  border: none;
  border-radius: 999px;
  padding: 14px 26px;
  background: $color-brand;
  color: $color-white;
  font-family: $font-content;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

  &:hover {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }
}

.summary {
  background: $color-white;
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: sticky;
  top: 20px;
}

.summary__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 20px;
  color: $color-ink;
  margin-bottom: 2px;
}

.summary__event {
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
}

.summary__meta {
  font-family: $font-content;
  font-size: 12.5px;
  color: $color-gray-500;
  margin-bottom: 6px;
}

.summary__row {
  display: flex;
  justify-content: space-between;
  font-family: $font-content;
  font-size: 13.5px;
  color: $color-font-main;

  &--total {
    padding-top: 10px;
    margin-top: 4px;
    border-top: 1px solid $color-line;
    font-weight: 900;
    font-size: 16px;
    color: $color-ink;
  }
}

.continue-btn {
  margin-top: 8px;
  border: none;
  border-radius: 999px;
  padding: 14px;
  background: $color-brand;
  color: $color-white;
  font-family: $font-content;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

  &:hover {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }
}

.confirmation {
  text-align: center;
  padding: 70px 20px;
  background: $color-white;
  border-radius: 20px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.confirmation__badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #1fa876;
  color: $color-white;
  font-size: 28px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation__title {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: 28px;
  color: $color-brand;
}

.confirmation__note {
  font-family: $font-content;
  font-size: 14px;
  color: $color-font-main;
  max-width: 46ch;
}

.confirmation__actions {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.confirmation__btn {
  border: none;
  border-radius: 999px;
  padding: 12px 26px;
  background: $color-brand;
  color: $color-white;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14px;

  &:hover {
    background: $color-brand-deep;
  }
}

.confirmation__link {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;
  text-decoration: none;

  &:hover {
    color: $color-brand;
  }
}

.not-found {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 20px;
  text-align: center;
}

.not-found__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  color: $color-ink;
}

.not-found__link {
  color: $color-brand;
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
