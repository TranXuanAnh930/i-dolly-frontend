<template>
  <div class="checkout-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('checkout.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('checkout.title') }}</h1>
      </div>
    </section>

    <div class="wrapper content">
      <div v-if="order && order.status === 'confirmed'" class="confirmation">
        <div class="confirmation__badge">✓</div>
        <h2 class="confirmation__title">{{ $t('checkout.orderPlaced') }}</h2>
        <p class="confirmation__note">{{ $t('checkout.orderConfirmed', { orderNumber: orderShortId }) }}</p>
        <div class="confirmation__actions">
          <router-link to="/store" class="confirmation__btn">{{ $t('checkout.keepShopping') }}</router-link>
          <router-link to="/events" class="confirmation__link">{{ $t('checkout.backToEvents') }}</router-link>
        </div>
      </div>

      <div v-else-if="order && order.status === 'pending'" class="confirmation confirmation--pending">
        <div class="confirmation__badge confirmation__badge--pending">→</div>
        <h2 class="confirmation__title">{{ $t('checkout.paypalRedirectTitle') }}</h2>
        <p class="confirmation__note">{{ $t('checkout.paypalRedirectNote') }}</p>
        <div class="confirmation__actions">
          <a v-if="paypalApprovalUrl" :href="paypalApprovalUrl" class="confirmation__btn">{{ $t('checkout.paypalContinue') }}</a>
        </div>
      </div>

      <div v-else-if="order" class="confirmation confirmation--declined">
        <div class="confirmation__badge confirmation__badge--declined">&times;</div>
        <h2 class="confirmation__title confirmation__title--declined">{{ $t('checkout.orderDeclinedTitle') }}</h2>
        <p class="confirmation__note">{{ $t('checkout.orderDeclinedNote') }}</p>
        <div class="confirmation__actions">
          <router-link to="/store" class="confirmation__btn">{{ $t('cart.goToStore') }}</router-link>
        </div>
      </div>

      <div v-else-if="lines.length && step === 1" class="layout">
        <form class="form-panel" @submit.prevent="reviewOrder">
          <h2 class="panel-title">{{ $t('checkout.shippingAddress') }}</h2>

          <div v-if="addressLoading" class="address-box address-box--muted">
            {{ $t('common.loading') }}
          </div>
          <div v-else-if="shippingAddress" class="address-box">
            <p class="address-box__line">{{ shippingAddress.address_line1 }}<template v-if="shippingAddress.address_line2">, {{ shippingAddress.address_line2 }}</template></p>
            <p class="address-box__line">{{ shippingAddress.city }}, {{ shippingAddress.state }} {{ shippingAddress.postal_code }}</p>
            <p class="address-box__line">{{ shippingAddress.country }}</p>
            <router-link to="/account" class="address-box__edit">{{ $t('checkout.editAddress') }}</router-link>
          </div>
          <div v-else class="address-box address-box--empty">
            <p class="address-box__line">{{ $t('checkout.noAddressHint') }}</p>
            <router-link to="/account" class="address-box__edit">{{ $t('checkout.goToAccount') }}</router-link>
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
            <p class="panel-hint">{{ $t('checkout.paymentMockHint') }}</p>

            <label class="field">
              <span class="field__label">{{ $t('checkout.cardNumber') }}</span>
              <input type="text" v-model="card.number" placeholder="4242 4242 4242 4242" autocomplete="cc-number" inputmode="numeric">
            </label>

            <div class="field-grid">
              <label class="field">
                <span class="field__label">{{ $t('checkout.expiry') }}</span>
                <input type="text" v-model="card.expiry" placeholder="MM / YY" autocomplete="cc-exp">
              </label>
              <label class="field">
                <span class="field__label">{{ $t('checkout.cvc') }}</span>
                <input type="text" v-model="card.cvc" placeholder="123" autocomplete="cc-csc" inputmode="numeric">
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

          <button type="submit" class="place-order-btn" :disabled="!canPlaceOrder">
            {{ $t('checkout.reviewOrder') }} →
          </button>
        </form>

        <div class="summary">
          <h2 class="summary__title">{{ $t('checkout.orderSummary') }}</h2>
          <div class="summary__lines">
            <div v-for="line in lines" :key="line.productId" class="summary__line">
              <span>{{ line.product.name }} &times;{{ line.qty }}</span>
              <span>&yen;{{ formatNumber(cart.lineTotal(line)) }}</span>
            </div>
          </div>
          <div class="summary__row summary__row--total">
            <span>{{ $t('checkout.total') }}</span>
            <span>&yen;{{ formatNumber(subtotal) }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="lines.length && step === 2" class="layout">
        <div class="form-panel">
          <h2 class="panel-title">{{ $t('checkout.confirmTitle') }}</h2>
          <p class="panel-hint">{{ gateway === 'paypal' ? $t('checkout.confirmHintPaypal') : $t('checkout.confirmHint') }}</p>

          <div class="info-table">
            <div class="info-row">
              <span class="info-row__label">{{ $t('checkout.shippingAddress') }}</span>
              <span class="info-row__value">{{ shippingAddress.address_line1 }}<template v-if="shippingAddress.address_line2">, {{ shippingAddress.address_line2 }}</template>, {{ shippingAddress.city }}, {{ shippingAddress.state }} {{ shippingAddress.postal_code }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">{{ $t('checkout.paymentMethod') }}</span>
              <span class="info-row__value">{{ gateway === 'paypal' ? $t('checkout.gatewayPaypal') : $t('checkout.gatewayMock') }}<template v-if="gateway === 'mock'"> — &bull;&bull;&bull;&bull; {{ card.number.slice(-4) }}</template></span>
            </div>
          </div>

          <p class="form-error" v-if="error" :key="error">{{ error }}</p>

          <div class="form-actions">
            <button type="button" class="back-btn" :disabled="placing" @click="step = 1">&larr; {{ $t('checkout.back') }}</button>
            <button type="button" class="place-order-btn" :disabled="placing" @click="placeOrder">
              {{ placing ? (gateway === 'paypal' ? $t('checkout.paypalRedirecting') : $t('checkout.placingOrder')) : `${$t('checkout.placeOrder')} →` }}
            </button>
          </div>
        </div>

        <div class="summary">
          <h2 class="summary__title">{{ $t('checkout.orderSummary') }}</h2>
          <div class="summary__lines">
            <div v-for="line in lines" :key="line.productId" class="summary__line">
              <span>{{ line.product.name }} &times;{{ line.qty }}</span>
              <span>&yen;{{ formatNumber(cart.lineTotal(line)) }}</span>
            </div>
          </div>
          <div class="summary__row summary__row--total">
            <span>{{ $t('checkout.total') }}</span>
            <span>&yen;{{ formatNumber(subtotal) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-state__title">{{ $t('checkout.emptyTitle') }}</p>
        <p class="empty-state__hint">{{ $t('checkout.emptyHint') }}</p>
        <router-link to="/store" class="empty-state__cta">{{ $t('cart.goToStore') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '@/store/store/cart'
import { useCatalogStore } from '@/store/store/catalog'
import { useOrdersStore } from '@/store/store/orders'
import { useToastStore } from '@/store/toast'
import { OrderService } from '@/services/store/order.service'
import { PaymentService } from '@/services/payment/payment.service'
import { ShippingAddressesService } from '@/services/account/shippingAddresses.service'
import { formatNumber } from '@/utils/format'

export default {
  name: 'CheckoutPage',

  data () {
    return {
      step: 1,
      shippingAddress: null,
      addressLoading: true,
      gateway: 'mock',
      card: {
        number: '',
        expiry: '',
        cvc: ''
      },
      simulateSucc: true,
      placing: false,
      error: '',
      order: null,
      paypalApprovalUrl: null
    }
  },

  computed: {
    cart () {
      return useCartStore()
    },
    lines () {
      return this.cart.lines
    },
    subtotal () {
      return this.cart.subtotal
    },
    canPlaceOrder () {
      return !!this.shippingAddress && this.lines.length > 0 && !this.placing
    },
    orderShortId () {
      return this.order ? this.order.id.slice(0, 8) : ''
    }
  },

  created () {
    useCatalogStore().fetchAll()
    // Refreshes a logged-in fan's real cart — a no-op for guests/non-fan
    // roles (see cartStore.isServerBacked).
    this.cart.fetchCart()
    this.fetchAddress()
  },

  methods: {
    formatNumber,
    // Backend only stores one shipping address per user (see
    // AccountSettingsPage) — checkout just uses that saved address rather
    // than collecting one inline, and points to /account when there isn't
    // one yet.
    async fetchAddress () {
      try {
        const response = await ShippingAddressesService.fetchAll()
        this.shippingAddress = response.data[0] || null
      } finally {
        this.addressLoading = false
      }
    },
    // Validates the address/payment fields and moves to the confirm step —
    // the actual charge only fires from there (placeOrder), so a fan always
    // sees a review screen before anything is submitted.
    reviewOrder () {
      if (!this.canPlaceOrder) return

      // Card fields aren't sent anywhere — the mock gateway only reads
      // simulateSucc — but requiring them keeps the flow feeling real
      // rather than skippable with an empty payment step. PayPal has
      // nothing to validate here: the buyer enters their own payment
      // details on PayPal's side, not this form.
      if (this.gateway === 'mock' && (!this.card.number.trim() || !this.card.expiry.trim() || !this.card.cvc.trim())) {
        this.error = this.$t('checkout.errorPayment')
        return
      }

      this.error = ''
      this.step = 2
    },
    async placeOrder () {
      this.error = ''
      this.placing = true

      try {
        const response = await OrderService.checkout({
          amount: this.subtotal,
          shipping_address_id: this.shippingAddress.id,
          gateway: this.gateway,
          simulate_succ: this.gateway === 'mock' ? this.simulateSucc : undefined,
          idempotency_key: crypto.randomUUID(),
        })
        this.order = response.data

        // The backend consumes the cart (stock decremented, rows deleted)
        // as soon as checkout runs — for mock that's immediate (approved or
        // declined), for paypal it happens up front too even though the
        // order itself stays "pending" until the buyer actually pays.
        await this.cart.fetchCart()

        // Cache the order directly rather than refetching the whole list —
        // it's already known in full, and this is what makes it show up in
        // History immediately (see ordersStore.add).
        useOrdersStore().add(this.order)

        if (this.gateway === 'paypal') {
          // docs/api-spec.md §6: checkout returns the order "pending", not
          // an error — fetch the Payment row it created to read PayPal's
          // buyer-facing approval link, then send the fan there with a full
          // page redirect (not a new tab — PayPal itself redirects back to
          // this same tab when the fan approves or cancels).
          const paymentResponse = await PaymentService.getOrderStatus(this.order.id)
          this.paypalApprovalUrl = paymentResponse.data.pg_approval_url
          if (this.paypalApprovalUrl) {
            window.location.href = this.paypalApprovalUrl
            return
          }
          this.error = this.$t('checkout.paypalError')
          this.order = null
          return
        }

        if (this.order.status === 'confirmed') {
          useToastStore().add({ type: 'success', message: this.$t('checkout.orderPlaced') })
        } else {
          useToastStore().add({ type: 'error', message: this.$t('checkout.orderDeclinedTitle') })
        }
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
.checkout-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 40px 0 40px;
}

.hero__eyebrow {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: $color-brand;
  margin-bottom: 8px;
}

.hero__title {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(30px, 5vw, 44px);
  color: $color-brand;
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

.form-panel {
  background: $color-white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 20px;
  color: $color-ink;

  &--spaced {
    margin-top: 10px;
  }
}

.panel-hint {
  margin-top: -8px;
  font-family: $font-content;
  font-size: 12.5px;
  color: $color-gray-500;
}

.address-box {
  border: 1.5px solid $color-line;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &--muted {
    color: $color-gray-400;
    font-family: $font-content;
    font-size: 13px;
  }

  &--empty {
    border-style: dashed;
  }
}

.address-box__line {
  font-family: $font-content;
  font-size: 13.5px;
  color: $color-ink;
}

.address-box__edit {
  margin-top: 8px;
  align-self: flex-start;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12.5px;
  color: $color-brand;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
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
  flex: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;
}

.info-row__value {
  text-align: right;
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
}

.form-actions {
  margin-top: 4px;
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

  &:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
}

.form-actions .place-order-btn {
  margin-top: 0;
  margin-left: auto;
  padding: 14px 26px;
}

.field-grid {
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
  margin-top: -4px;
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
  background: #fdeaf1;
  color: $color-error;
  border-radius: 12px;
  padding: 10px 14px;
  font-family: $font-content;
  font-size: 13px;
  font-weight: 700;
}

.place-order-btn {
  margin-top: 4px;
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
  gap: 12px;
  position: sticky;
  top: 20px;
}

.summary__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 20px;
  color: $color-ink;
  margin-bottom: 4px;
}

.summary__lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary__line {
  display: flex;
  justify-content: space-between;
  font-family: $font-content;
  font-size: 13px;
  color: $color-font-main;
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

.empty-state {
  text-align: center;
  padding: 70px 20px;
  background: $color-white;
  border-radius: 20px;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
}

.empty-state__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  color: $color-ink;
}

.empty-state__hint {
  margin-top: 6px;
  font-family: $font-content;
  font-size: 13px;
  color: $color-gray-500;
}

.empty-state__cta {
  display: inline-block;
  margin-top: 18px;
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
  background: $color-brand;
  color: $color-white;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;

  &:hover {
    background: $color-brand-deep;
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
  margin-bottom: 8px;

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
  max-width: 42ch;
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
</style>
