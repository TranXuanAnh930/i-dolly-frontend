<template>
  <UiPageLoader v-if="loading"/>

  <div v-else-if="eligible" class="ticket-page">
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
            <span class="step__label">{{ $t('ticketPurchase.stepPayment') }}</span>
          </li>
          <li class="step-line" :class="{ 'is-done': step > 2 }"></li>
          <li class="step" :class="stepClass(3)">
            <span class="step__dot">{{ step > 3 ? '&check;' : '3' }}</span>
            <span class="step__label">{{ $t('ticketPurchase.stepConfirm') }}</span>
          </li>
          <li class="step-line" :class="{ 'is-done': step > 3 }"></li>
          <li class="step" :class="stepClass(4)">
            <span class="step__dot">4</span>
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
                v-for="tier in availableTicketTypes"
                :key="tier.id"
                class="option-row"
                :class="{ 'is-selected': selectedTierId === tier.id }">
                <input type="radio" name="tier" :value="tier.id" v-model="selectedTierId">
                <span class="option-row__text">
                  <span class="option-row__title">{{ tierLabel(tier) }}</span>
                  <span class="option-row__note">{{ $t('eventDetail.leftSuffix', { count: tier.total_quantity }) }} &middot; {{ tier.sale_method === 'lottery' ? $t('eventDetail.lotteryLabel') : $t('eventDetail.directSaleLabel') }}</span>
                </span>
                <span class="option-row__price">&yen;{{ formatNumber(withTax(tier.price)) }}</span>
              </label>
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
            <span>{{ tierLabel(selectedTier) }}</span>
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
        <form class="panel" @submit.prevent="reviewOrder">
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

          <h2 class="panel-title panel-title--spaced">{{ $t('ticketPurchase.paymentMethod') }}</h2>

          <div class="gateway-choice">
            <label class="gateway-option" :class="{ 'is-selected': gateway === 'mock' }">
              <input type="radio" name="gateway" value="mock" v-model="gateway">
              <span>{{ $t('checkout.gatewayMock') }}</span>
            </label>
            <label class="gateway-option" :class="{ 'is-selected': gateway === 'paypal' }">
              <input type="radio" name="gateway" value="paypal" v-model="gateway">
              <span>{{ $t('checkout.gatewayPaypal') }}</span>
            </label>
          </div>

          <template v-if="gateway === 'mock'">
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

            <label class="mock-option">
              <input type="radio" name="simulate" :value="true" v-model="simulateSucc">
              <span>{{ $t('checkout.simulateSuccess') }}</span>
            </label>
            <label class="mock-option">
              <input type="radio" name="simulate" :value="false" v-model="simulateSucc">
              <span>{{ $t('checkout.simulateFailure') }}</span>
            </label>
          </template>

          <p class="panel-hint" v-else>{{ $t('checkout.paypalHint') }}</p>

          <p class="form-error" v-if="error" :key="error">{{ error }}</p>

          <div class="form-actions">
            <button type="button" class="back-btn" @click="step = 1">&larr; {{ $t('ticketPurchase.back') }}</button>
            <button type="submit" class="place-order-btn">{{ $t('ticketPurchase.reviewOrder') }} →</button>
          </div>
        </form>

        <div class="summary">
          <h2 class="summary__title">{{ $t('ticketPurchase.orderSummary') }}</h2>
          <p class="summary__event">{{ concert.title }}</p>
          <p class="summary__meta">{{ dateLabel }}<template v-if="doorsLabel"> &middot; {{ $t('events.doorsAt', { time: doorsLabel }) }}</template></p>
          <div class="summary__row">
            <span>{{ tierLabel(selectedTier) }}</span>
            <span>&yen;{{ formatNumber(total) }}</span>
          </div>
          <div class="summary__row summary__row--total">
            <span>{{ $t('ticketPurchase.total') }}</span>
            <span>&yen;{{ formatNumber(total) }}</span>
          </div>
        </div>
      </div>

      <!-- Step 3: confirm -->
      <div v-else-if="step === 3" class="layout">
        <div class="panel">
          <h2 class="panel-title">{{ $t('ticketPurchase.confirmTitle') }}</h2>
          <p class="panel-hint">{{ gateway === 'paypal' ? $t('checkout.confirmHintPaypal') : $t('ticketPurchase.confirmHint') }}</p>

          <div class="info-table">
            <div class="info-row">
              <span class="info-row__label">{{ $t('ticketPurchase.fullName') }}</span>
              <span class="info-row__value">{{ form.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">{{ $t('common.email') }}</span>
              <span class="info-row__value">{{ form.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">{{ $t('ticketPurchase.paymentMethod') }}</span>
              <span class="info-row__value">{{ gateway === 'paypal' ? $t('checkout.gatewayPaypal') : $t('checkout.gatewayMock') }}<template v-if="gateway === 'mock'"> — &bull;&bull;&bull;&bull; {{ form.cardNumber.slice(-4) }}</template></span>
            </div>
          </div>

          <p class="form-error" v-if="error" :key="error">{{ error }}</p>

          <div class="form-actions">
            <button type="button" class="back-btn" :disabled="placing" @click="step = 2">&larr; {{ $t('ticketPurchase.back') }}</button>
            <button type="button" class="place-order-btn" :disabled="placing" @click="placeOrder">{{ placing ? (gateway === 'paypal' ? $t('checkout.paypalRedirecting') : $t('checkout.placingOrder')) : `${$t('ticketPurchase.placeOrder')} →` }}</button>
          </div>
        </div>

        <div class="summary">
          <h2 class="summary__title">{{ $t('ticketPurchase.orderSummary') }}</h2>
          <p class="summary__event">{{ concert.title }}</p>
          <p class="summary__meta">{{ dateLabel }}<template v-if="doorsLabel"> &middot; {{ $t('events.doorsAt', { time: doorsLabel }) }}</template></p>
          <div class="summary__row">
            <span>{{ tierLabel(selectedTier) }}</span>
            <span>&yen;{{ formatNumber(total) }}</span>
          </div>
          <div class="summary__row summary__row--total">
            <span>{{ $t('ticketPurchase.total') }}</span>
            <span>&yen;{{ formatNumber(total) }}</span>
          </div>
        </div>
      </div>

      <!-- Step 4: finish -->
      <div v-else class="confirmation" :class="{ 'confirmation--declined': outcome === 'declined' }">
        <div class="confirmation__badge" :class="{ 'confirmation__badge--declined': outcome === 'declined', 'confirmation__badge--pending': outcome === 'redirecting' }">
          <template v-if="outcome === 'declined'">&times;</template>
          <template v-else-if="outcome === 'redirecting'">→</template>
          <template v-else>&check;</template>
        </div>
        <template v-if="outcome === 'declined'">
          <h2 class="confirmation__title confirmation__title--declined">{{ $t('ticketPurchase.declinedTitle') }}</h2>
          <p class="confirmation__note">{{ $t('ticketPurchase.declinedNote') }}</p>
        </template>
        <template v-else-if="outcome === 'redirecting'">
          <h2 class="confirmation__title">{{ $t('checkout.paypalRedirectTitle') }}</h2>
          <p class="confirmation__note">{{ $t('checkout.paypalRedirectNote') }}</p>
          <div class="confirmation__actions">
            <a v-if="paypalApprovalUrl" :href="paypalApprovalUrl" class="confirmation__btn">{{ $t('checkout.paypalContinue') }}</a>
          </div>
        </template>
        <template v-else>
          <h2 class="confirmation__title">{{ $t('ticketPurchase.wentTitle') }}</h2>
          <p class="confirmation__note">{{ $t('ticketPurchase.wentNote', { orderNumber, title: concert.title, date: dateLabel }) }}</p>
        </template>
        <div class="confirmation__actions" v-if="outcome !== 'redirecting'">
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

import { useTicketsStore } from '@/store/events/tickets'
import { useToastStore } from '@/store/toast'
import { ConcertsService } from '@/services/events/concerts.service'
import { TicketTypesService } from '@/services/events/ticketTypes.service'
import { TicketService } from '@/services/events/ticket.service'
import { PaymentService } from '@/services/payment/payment.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { formatDate, formatNumber } from '@/utils/format'
import { withTax } from '@/utils/tax'
import VenueSeatMap from '@/components/VenueSeatMap.vue'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'

export default {
  name: 'TicketPurchasePage',

  components: { VenueSeatMap, UiPageLoader },

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      loading: true,
      concert: null,
      ticketTypes: [],
      step: 1,
      selectedTierId: null,
      campaignsByTierId: {},
      form: {
        name: '',
        email: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: ''
      },
      gateway: 'mock',
      simulateSucc: true,
      placing: false,
      error: '',
      orderNumber: '',
      outcome: null,
      paypalApprovalUrl: null
    }
  },

  computed: {
    color () {
      const hex = this.concert ? paletteColorForId(this.concert.id) : '#cccccc'
      return { hex, text: contrastTextColor(hex) }
    },
    // Only tiers a fan could actually act on right now: a direct-sale tier
    // with stock left, or a lottery tier with a currently open campaign.
    // Sold-out/lottery-closed tiers are left off the list entirely rather
    // than shown disabled, so there's nothing to select in the first place.
    availableTicketTypes () {
      return this.ticketTypes.filter(tier => this.tierOnSale(tier))
    },
    eligible () {
      return !!this.concert && this.concert.status === 'on_sale' && this.availableTicketTypes.length > 0
    },
    ineligibleMessage () {
      if (!this.concert) return this.$t('ticketPurchase.ineligibleNotFound')
      if (this.concert.status === 'sold_out') return this.$t('ticketPurchase.ineligibleSoldOut')
      if (this.concert.status === 'completed') return this.$t('ticketPurchase.ineligibleCompleted')
      if (this.concert.status === 'cancelled') return this.$t('ticketPurchase.ineligibleCancelled')
      if (this.ticketTypes.length && !this.availableTicketTypes.length) return this.$t('ticketPurchase.ineligibleUnavailable')
      return this.$t('ticketPurchase.ineligibleDefault')
    },
    selectedTier () {
      return this.availableTicketTypes.find(tier => tier.id === this.selectedTierId) || this.availableTicketTypes[0] || null
    },
    isLotteryTier () {
      return !!this.selectedTier && this.selectedTier.sale_method === 'lottery'
    },
    total () {
      return this.selectedTier ? withTax(this.selectedTier.price) : 0
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
      async handler () {
        this.loading = true
        try {
          // One call — the concert-detail endpoint embeds this concert's
          // ticket types and every campaign (lottery and direct-sale)
          // across them, so there's nothing left to fetch separately.
          const response = await ConcertsService.getDetailPublic(this.id)
          this.concert = response.data.concert
          this.ticketTypes = response.data.ticket_types
          this.campaignsByTierId = this.campaignsByTierIdFrom(response.data)

          if (!this.availableTicketTypes.some(tier => tier.id === this.selectedTierId)) {
            this.selectedTierId = this.availableTicketTypes.length ? this.availableTicketTypes[0].id : null
          }
        } catch {
          this.concert = null
        } finally {
          this.loading = false
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
    // A tier needs an open, in-window campaign to be selectable at all —
    // for direct-sale that's on top of still having stock, matching
    // ticket_service.checkout_ticket's own two checks (open campaign, then
    // remaining stock) so nothing shown here would fail at checkout for a
    // reason this page could've caught first. Mirrors LotteryEntryPage.vue's
    // own isEntryOpen check so a lottery tier shown as selectable here is
    // guaranteed enterable there too.
    tierOnSale (tier) {
      if (!this.campaignsByTierId[tier.id]) return false
      return tier.sale_method === 'direct' ? this.remaining(tier) > 0 : true
    },
    isEntryOpen (campaign) {
      const now = new Date()
      return campaign.status === 'open' && now >= new Date(campaign.entry_start_at) && now <= new Date(campaign.entry_end_at)
    },
    isSaleOpen (campaign) {
      const now = new Date()
      return campaign.status === 'open' && now >= new Date(campaign.sale_start_at) && now <= new Date(campaign.sale_end_at)
    },
    campaignsByTierIdFrom (detail) {
      const byTierId = {}
      detail.lottery_campaigns.forEach(campaign => {
        if (!byTierId[campaign.ticket_type_id] && this.isEntryOpen(campaign)) byTierId[campaign.ticket_type_id] = campaign
      })
      detail.direct_sale_campaigns.forEach(campaign => {
        if (!byTierId[campaign.ticket_type_id] && this.isSaleOpen(campaign)) byTierId[campaign.ticket_type_id] = campaign
      })
      return byTierId
    },
    // Lottery entry is its own multi-step ranked-preference flow now (see
    // LotteryEntryPage.vue) — this page only ever handles direct-sale
    // checkout from here on. The chosen tier rides along as a query param
    // so that page can lock it in as the required 1st preference instead
    // of asking the fan to pick a tier a second time.
    proceed () {
      if (this.isLotteryTier) {
        this.$router.push({ name: 'event-lottery-entry', params: { id: this.concert.id }, query: { tier: this.selectedTierId } })
      } else {
        this.step = 2
      }
    },
    // Validates the contact/payment fields and moves to the confirm step —
    // the actual charge only fires from there (placeOrder), so a fan always
    // sees a review screen before anything is submitted.
    reviewOrder () {
      if (!this.form.name.trim() || !this.form.email.trim()) {
        this.error = this.$t('ticketPurchase.errorContactEmail')
        return
      }
      if (this.gateway === 'mock' && (!this.form.cardNumber.trim() || !this.form.cardExpiry.trim() || !this.form.cardCvc.trim())) {
        this.error = this.$t('ticketPurchase.errorPayment')
        return
      }
      this.error = ''
      this.step = 3
    },
    // Real direct-sale checkout — see ticket.service.js / POST
    // /tickets/checkout. Card fields aren't sent anywhere (same mock as
    // CheckoutPage.vue) — only simulateSucc reaches the backend.
    async placeOrder () {
      this.error = ''
      this.placing = true

      try {
        const response = await TicketService.checkout({
          ticket_type_id: this.selectedTier.id,
          amount: this.total,
          gateway: this.gateway,
          simulate_succ: this.gateway === 'mock' ? this.simulateSucc : undefined,
          idempotency_key: crypto.randomUUID(),
        })
        const ticket = response.data
        useTicketsStore().add(ticket)

        if (this.gateway === 'paypal') {
          // docs/api-spec.md §6: checkout returns the ticket "pending" (not
          // an error) — fetch the Payment row it created to read PayPal's
          // buyer-facing approval link, then send the fan there with a full
          // page redirect.
          const paymentResponse = await PaymentService.getTicketStatus(ticket.id)
          this.paypalApprovalUrl = paymentResponse.data.pg_approval_url
          this.outcome = 'redirecting'
          this.step = 4
          if (this.paypalApprovalUrl) {
            window.location.href = this.paypalApprovalUrl
          } else {
            this.error = this.$t('checkout.paypalError')
          }
          return
        }

        this.orderNumber = ticket.id.slice(0, 8)
        this.outcome = ticket.status === 'paid' ? 'purchase' : 'declined'
        this.step = 4

        useToastStore().add({
          type: this.outcome === 'purchase' ? 'success' : 'error',
          message: this.$t(this.outcome === 'purchase' ? 'ticketPurchase.wentTitle' : 'ticketPurchase.declinedTitle')
        })

        // The tier's sold_quantity just changed server-side (on a
        // successful purchase) — refetch so ticketTypes stays accurate if
        // the buyer navigates back to step 1.
        TicketTypesService.getByConcertPublic(this.concert.id).then(response => { this.ticketTypes = response.data })
      } catch (err) {
        this.error = err.message
      } finally {
        this.placing = false
      }
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

.panel-hint {
  margin-top: -8px;
  font-family: $font-content;
  font-size: 13px;
  color: $color-gray-500;
}

.info-table {
  border: 1.5px solid $color-line;
  border-radius: 14px;
  overflow: hidden;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid $color-line;

  &:last-child {
    border-bottom: none;
  }
}

.info-row__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;
}

.info-row__value {
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
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

.mock-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
  cursor: pointer;

  input {
    accent-color: $color-brand;
    width: 16px;
    height: 16px;
  }
}

.gateway-choice {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.gateway-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid $color-line;
  border-radius: 12px;
  padding: 11px 14px;
  cursor: pointer;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13.5px;
  color: $color-ink;
  transition: border-color .15s ease, background .15s ease;

  input {
    accent-color: $color-brand;
    width: 16px;
    height: 16px;
  }

  &.is-selected {
    border-color: $color-brand;
    background: $color-brand-tint-2;
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

  &:hover:not(:disabled) {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: .5;
    cursor: not-allowed;
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

  &--declined {
    background: $color-error;
  }

  &--pending {
    background: $color-brand;
  }
}

.confirmation__title {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: 28px;
  color: $color-brand;

  &--declined {
    color: $color-error;
  }
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
