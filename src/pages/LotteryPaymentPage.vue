<template>
  <div v-if="loading" class="not-found">
    <p class="not-found__title">{{ $t('common.loading') }}</p>
  </div>

  <div v-else-if="!eligible" class="not-found">
    <p class="not-found__title">{{ ineligibleMessage }}</p>
    <router-link v-if="entry" :to="`/history/lottery/${entry.id}`" class="not-found__link">&larr; {{ $t('lotteryPayment.backToEntry') }}</router-link>
    <router-link v-else to="/history" class="not-found__link">&larr; {{ $t('lotteryPayment.backToHistory') }}</router-link>
  </div>

  <div v-else class="payment-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <router-link :to="`/history/lottery/${entry.id}`" class="back-link">&larr; {{ $t('lotteryPayment.backToEntry') }}</router-link>
        <p class="hero__eyebrow">{{ $t('lotteryPayment.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('lotteryPayment.title') }}</h1>

        <ol class="steps">
          <li class="step" :class="stepClass(1)">
            <span class="step__dot">{{ step > 1 ? '&check;' : '1' }}</span>
            <span class="step__label">{{ $t('lotteryPayment.stepPayment') }}</span>
          </li>
          <li class="step-line" :class="{ 'is-done': step > 1 }"></li>
          <li class="step" :class="stepClass(2)">
            <span class="step__dot">{{ step > 2 ? '&check;' : '2' }}</span>
            <span class="step__label">{{ $t('lotteryPayment.stepConfirm') }}</span>
          </li>
          <li class="step-line" :class="{ 'is-done': step > 2 }"></li>
          <li class="step" :class="stepClass(3)">
            <span class="step__dot">3</span>
            <span class="step__label">{{ $t('lotteryPayment.stepDone') }}</span>
          </li>
        </ol>
      </div>
    </section>

    <div class="wrapper content">
      <!-- Already paid on arrival — once confirmPayment() marks the ticket
           paid during this visit, step advances to 3 and the outcome
           screen below takes over instead of this shortcut. -->
      <div v-if="alreadyPaid && step < 3" class="confirmation">
        <div class="confirmation__badge">&check;</div>
        <h2 class="confirmation__title">{{ $t('lotteryPayment.alreadyPaidTitle') }}</h2>
        <p class="confirmation__note">{{ $t('lotteryPayment.alreadyPaidNote') }}</p>
        <div class="confirmation__actions">
          <router-link to="/history" class="confirmation__btn">{{ $t('lotteryPayment.viewHistory') }}</router-link>
        </div>
      </div>

      <!-- Step 1: mock payment form -->
      <div v-else-if="step === 1" class="layout">
        <form class="panel" @submit.prevent="reviewPayment">
          <h2 class="panel-title">{{ $t('lotteryPayment.contactPayment') }}</h2>

          <div class="field-grid">
            <label class="field">
              <span class="field__label">{{ $t('lotteryPayment.fullName') }}</span>
              <input type="text" v-model="form.name" :placeholder="$t('common.yourName')" autocomplete="name">
            </label>
            <label class="field">
              <span class="field__label">{{ $t('common.email') }}</span>
              <input type="text" v-model="form.email" placeholder="you@example.com" autocomplete="email">
            </label>
          </div>

          <h2 class="panel-title panel-title--spaced">{{ $t('checkout.paymentMethod') }}</h2>

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
            <p class="panel-hint">{{ $t('lotteryPayment.mockNotice') }}</p>

            <label class="field">
              <span class="field__label">{{ $t('lotteryPayment.cardNumber') }}</span>
              <input type="text" v-model="form.cardNumber" placeholder="4242 4242 4242 4242" autocomplete="cc-number" inputmode="numeric">
            </label>

            <div class="field-grid">
              <label class="field">
                <span class="field__label">{{ $t('lotteryPayment.expiry') }}</span>
                <input type="text" v-model="form.cardExpiry" placeholder="MM / YY" autocomplete="cc-exp">
              </label>
              <label class="field">
                <span class="field__label">{{ $t('lotteryPayment.cvc') }}</span>
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
            <button type="submit" class="place-order-btn">{{ $t('lotteryPayment.reviewPayment') }} →</button>
          </div>
        </form>

        <div class="summary" v-if="context">
          <h2 class="summary__title">{{ $t('lotteryPayment.orderSummary') }}</h2>
          <p class="summary__event">{{ concertTitle }}</p>
          <p class="summary__meta">{{ tierLabel }}</p>
          <div class="summary__row summary__row--total">
            <span>{{ $t('lotteryPayment.total') }}</span>
            <span>&yen;{{ formatNumber(total) }}</span>
          </div>
        </div>
      </div>

      <!-- Step 2: confirm -->
      <div v-else-if="step === 2" class="layout">
        <div class="panel">
          <h2 class="panel-title">{{ $t('lotteryPayment.confirmTitle') }}</h2>
          <p class="panel-hint">{{ gateway === 'paypal' ? $t('checkout.confirmHintPaypal') : $t('lotteryPayment.confirmHint') }}</p>

          <div class="info-table">
            <div class="info-row">
              <span class="info-row__label">{{ $t('lotteryPayment.fullName') }}</span>
              <span class="info-row__value">{{ form.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">{{ $t('common.email') }}</span>
              <span class="info-row__value">{{ form.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">{{ $t('checkout.paymentMethod') }}</span>
              <span class="info-row__value">{{ gateway === 'paypal' ? $t('checkout.gatewayPaypal') : $t('checkout.gatewayMock') }}<template v-if="gateway === 'mock'"> — &bull;&bull;&bull;&bull; {{ form.cardNumber.slice(-4) }}</template></span>
            </div>
          </div>

          <p class="form-error" v-if="error" :key="error">{{ error }}</p>

          <div class="form-actions">
            <button type="button" class="back-btn" :disabled="paying" @click="step = 1">&larr; {{ $t('ticketPurchase.back') }}</button>
            <button type="button" class="place-order-btn" :disabled="paying" @click="confirmPayment">{{ paying ? (gateway === 'paypal' ? $t('checkout.paypalRedirecting') : $t('checkout.placingOrder')) : `${$t('lotteryPayment.payNow')} →` }}</button>
          </div>
        </div>

        <div class="summary" v-if="context">
          <h2 class="summary__title">{{ $t('lotteryPayment.orderSummary') }}</h2>
          <p class="summary__event">{{ concertTitle }}</p>
          <p class="summary__meta">{{ tierLabel }}</p>
          <div class="summary__row summary__row--total">
            <span>{{ $t('lotteryPayment.total') }}</span>
            <span>&yen;{{ formatNumber(total) }}</span>
          </div>
        </div>
      </div>

      <!-- Step 3: done -->
      <div v-else class="confirmation" :class="{ 'confirmation--declined': outcome === 'declined' }">
        <div class="confirmation__badge" :class="{ 'confirmation__badge--declined': outcome === 'declined', 'confirmation__badge--pending': outcome === 'redirecting' }">
          <template v-if="outcome === 'declined'">&times;</template>
          <template v-else-if="outcome === 'redirecting'">→</template>
          <template v-else>&check;</template>
        </div>
        <template v-if="outcome === 'declined'">
          <h2 class="confirmation__title confirmation__title--declined">{{ $t('lotteryPayment.declinedTitle') }}</h2>
          <p class="confirmation__note">{{ $t('lotteryPayment.declinedNote') }}</p>
          <div class="confirmation__actions">
            <router-link to="/history" class="confirmation__btn">{{ $t('lotteryPayment.viewHistory') }}</router-link>
          </div>
        </template>
        <template v-else-if="outcome === 'redirecting'">
          <h2 class="confirmation__title">{{ $t('checkout.paypalRedirectTitle') }}</h2>
          <p class="confirmation__note">{{ $t('checkout.paypalRedirectNote') }}</p>
          <div class="confirmation__actions">
            <a v-if="paypalApprovalUrl" :href="paypalApprovalUrl" class="confirmation__btn">{{ $t('checkout.paypalContinue') }}</a>
          </div>
        </template>
        <template v-else>
          <h2 class="confirmation__title">{{ $t('lotteryPayment.paidTitle') }}</h2>
          <p class="confirmation__note">{{ $t('lotteryPayment.paidNote', { title: concertTitle }) }}</p>
          <div class="confirmation__actions">
            <router-link to="/history" class="confirmation__btn">{{ $t('lotteryPayment.viewHistory') }}</router-link>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { useLotteryEntriesStore } from '@/store/lotteryEntries'
import { useTicketsStore } from '@/store/tickets'
import { useToastStore } from '@/store/toast'
import { TicketService } from '@/services/ticket.service'
import { PaymentService } from '@/services/payment.service'
import { formatNumber } from '@/utils/format'
import { withTax } from '@/utils/tax'

export default {
  name: 'LotteryPaymentPage',

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      loading: true,
      context: null,
      step: 1,
      form: {
        name: '',
        email: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: ''
      },
      gateway: 'mock',
      simulateSucc: true,
      paying: false,
      error: '',
      outcome: null,
      paypalApprovalUrl: null
    }
  },

  computed: {
    lotteryEntriesStore () {
      return useLotteryEntriesStore()
    },
    entry () {
      return this.lotteryEntriesStore.byId(this.id)
    },
    ticket () {
      return this.entry ? useTicketsStore().byLotteryEntryId(this.entry.id) : null
    },
    alreadyPaid () {
      return !!this.ticket && this.ticket.status === 'paid'
    },
    // A won entry whose ticket is still pending_payment — anything else
    // (not won, no ticket yet, already paid/cancelled/expired) can't pay
    // here. Once this page's own confirmPayment() has produced a definitive
    // outcome, stays true regardless of what the ticket's status becomes as
    // a result (a declined mock payment sets it to "cancelled" server-side)
    // — otherwise the declined-outcome screen below would never render,
    // since this computed would flip false the instant that write lands in
    // the store, right before step even advances to 3.
    eligible () {
      if (this.outcome !== null) return true
      return !!this.entry && this.entry.status === 'won' && !!this.ticket && (this.ticket.status === 'pending_payment' || this.ticket.status === 'paid')
    },
    ineligibleMessage () {
      if (!this.entry) return this.$t('lotteryPayment.notFound')
      if (this.entry.status !== 'won') return this.$t('lotteryPayment.notWon')
      if (!this.ticket) return this.$t('lotteryPayment.noTicket')
      return this.$t('lotteryPayment.notPayable')
    },
    tierLabel () {
      if (!this.context) return ''
      return this.context.ticketType.tier.charAt(0).toUpperCase() + this.context.ticketType.tier.slice(1)
    },
    concertTitle () {
      return this.context && this.context.concert ? this.context.concert.title : ''
    },
    total () {
      return this.context ? withTax(this.context.ticketType.price) : 0
    }
  },

  watch: {
    entry: {
      immediate: true,
      async handler (entry) {
        if (!entry) return
        document.title = `${this.$t('lotteryPayment.title')} | I-Dolly`
        this.context = await this.lotteryEntriesStore.resolveContext(entry)
      }
    }
  },

  async created () {
    if (this.$currentUser.name) this.form.name = this.$currentUser.name
    if (this.$currentUser.email) this.form.email = this.$currentUser.email
    await Promise.all([
      this.lotteryEntriesStore.fetchAll(),
      useTicketsStore().fetchAll()
    ])
    this.loading = false
  },

  methods: {
    formatNumber,
    stepClass (n) {
      return { 'is-active': this.step === n, 'is-done': this.step > n }
    },
    reviewPayment () {
      if (!this.form.name.trim() || !this.form.email.trim()) {
        this.error = this.$t('ticketPurchase.errorContactEmail')
        return
      }
      if (this.gateway === 'mock' && (!this.form.cardNumber.trim() || !this.form.cardExpiry.trim() || !this.form.cardCvc.trim())) {
        this.error = this.$t('ticketPurchase.errorPayment')
        return
      }
      this.error = ''
      this.step = 2
    },
    // POST /tickets/{ticket_id}/checkout (ticket_service.checkout_won_ticket)
    // — real charge through the same mock/paypal gateway choice as
    // CheckoutPage/TicketPurchasePage, just for a ticket a lottery draw
    // already created rather than a brand-new one.
    async confirmPayment () {
      this.error = ''
      this.paying = true

      try {
        const response = await TicketService.payForWonTicket(this.ticket.id, {
          amount: this.total,
          gateway: this.gateway,
          simulate_succ: this.gateway === 'mock' ? this.simulateSucc : undefined,
          idempotency_key: crypto.randomUUID(),
        })
        const ticket = response.data
        useTicketsStore().add(ticket)

        if (this.gateway === 'paypal') {
          // docs/api-spec.md §6: checkout returns the ticket still
          // "pending_payment" — fetch the Payment row it created to read
          // PayPal's buyer-facing approval link, then send the fan there
          // with a full page redirect.
          const paymentResponse = await PaymentService.getTicketStatus(ticket.id)
          this.paypalApprovalUrl = paymentResponse.data.pg_approval_url
          this.outcome = 'redirecting'
          this.step = 3
          if (this.paypalApprovalUrl) {
            window.location.href = this.paypalApprovalUrl
          } else {
            this.error = this.$t('checkout.paypalError')
          }
          return
        }

        this.outcome = ticket.status === 'paid' ? 'purchase' : 'declined'
        this.step = 3

        useToastStore().add({
          type: this.outcome === 'purchase' ? 'success' : 'error',
          message: this.$t(this.outcome === 'purchase' ? 'lotteryPayment.paidTitle' : 'lotteryPayment.declinedTitle')
        })
      } catch (err) {
        this.error = err.message
      } finally {
        this.paying = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.payment-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 24px 0 36px;
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
  cursor: pointer;

  &:hover {
    background: $color-brand-deep;
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
