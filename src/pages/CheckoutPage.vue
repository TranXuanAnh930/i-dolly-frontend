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

      <div v-else-if="order" class="confirmation confirmation--declined">
        <div class="confirmation__badge confirmation__badge--declined">&times;</div>
        <h2 class="confirmation__title confirmation__title--declined">{{ $t('checkout.orderDeclinedTitle') }}</h2>
        <p class="confirmation__note">{{ $t('checkout.orderDeclinedNote') }}</p>
        <div class="confirmation__actions">
          <router-link to="/store" class="confirmation__btn">{{ $t('cart.goToStore') }}</router-link>
        </div>
      </div>

      <div v-else-if="lines.length" class="layout">
        <form class="form-panel" @submit.prevent="placeOrder">
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

          <h2 class="panel-title panel-title--spaced">{{ $t('checkout.paymentMock') }}</h2>
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

          <p class="form-error" v-if="error" :key="error">{{ error }}</p>

          <button type="submit" class="place-order-btn" :disabled="!canPlaceOrder">
            {{ placing ? $t('checkout.placingOrder') : `${$t('checkout.placeOrder')} →` }}
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

      <div v-else class="empty-state">
        <p class="empty-state__title">{{ $t('checkout.emptyTitle') }}</p>
        <p class="empty-state__hint">{{ $t('checkout.emptyHint') }}</p>
        <router-link to="/store" class="empty-state__cta">{{ $t('cart.goToStore') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '@/store/cart'
import { useCatalogStore } from '@/store/catalog'
import { useOrdersStore } from '@/store/orders'
import { useToastStore } from '@/store/toast'
import { OrderService } from '@/services/order.service'
import { ShippingAddressesService } from '@/services/shippingAddresses.service'
import { formatNumber } from '@/utils/format'

export default {
  name: 'CheckoutPage',

  data () {
    return {
      shippingAddress: null,
      addressLoading: true,
      card: {
        number: '',
        expiry: '',
        cvc: ''
      },
      simulateSucc: true,
      placing: false,
      error: '',
      order: null
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
    async placeOrder () {
      if (!this.canPlaceOrder) return

      // Card fields aren't sent anywhere — the mock gateway only reads
      // simulateSucc — but requiring them keeps the flow feeling real
      // rather than skippable with an empty payment step.
      if (!this.card.number.trim() || !this.card.expiry.trim() || !this.card.cvc.trim()) {
        this.error = this.$t('checkout.errorPayment')
        return
      }

      this.error = ''
      this.placing = true

      try {
        const response = await OrderService.checkout({
          amount: this.subtotal,
          shipping_address_id: this.shippingAddress.id,
          gateway: 'mock',
          simulate_succ: this.simulateSucc,
          idempotency_key: crypto.randomUUID(),
        })
        this.order = response.data

        // The backend consumes the cart (stock decremented, rows deleted)
        // as soon as checkout runs, whether the mock payment was approved
        // or declined — resync from the server rather than assuming which.
        await this.cart.fetchCart()

        // Cache the order directly rather than refetching the whole list —
        // it's already known in full, and this is what makes it show up in
        // History immediately (see ordersStore.add).
        useOrdersStore().add(this.order)

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
