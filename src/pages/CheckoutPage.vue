<template>
  <div class="checkout-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('checkout.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('checkout.title') }}</h1>
      </div>
    </section>

    <div class="wrapper content">
      <div v-if="orderPlaced" class="confirmation">
        <div class="confirmation__badge">✓</div>
        <h2 class="confirmation__title">{{ $t('checkout.orderPlaced') }}</h2>
        <p class="confirmation__note">{{ $t('checkout.orderConfirmed', { orderNumber }) }}</p>
        <div class="confirmation__actions">
          <router-link to="/store" class="confirmation__btn">{{ $t('checkout.keepShopping') }}</router-link>
          <router-link to="/events" class="confirmation__link">{{ $t('checkout.backToEvents') }}</router-link>
        </div>
      </div>

      <div v-else-if="lines.length" class="layout">
        <form class="form-panel" @submit.prevent="placeOrder">
          <h2 class="panel-title">{{ $t('checkout.contactShipping') }}</h2>

          <div class="field-grid">
            <label class="field">
              <span class="field__label">{{ $t('checkout.fullName') }}</span>
              <input type="text" v-model="form.name" :placeholder="$t('common.yourName')" autocomplete="name">
            </label>
            <label class="field">
              <span class="field__label">{{ $t('common.email') }}</span>
              <input type="text" v-model="form.email" placeholder="you@example.com" autocomplete="email">
            </label>
          </div>

          <label class="field">
            <span class="field__label">{{ $t('common.address') }}</span>
            <input type="text" v-model="form.address" :placeholder="$t('common.streetAddress')" autocomplete="street-address">
          </label>

          <div class="field-grid">
            <label class="field">
              <span class="field__label">{{ $t('common.city') }}</span>
              <input type="text" v-model="form.city" :placeholder="$t('common.city')" autocomplete="address-level2">
            </label>
            <label class="field">
              <span class="field__label">{{ $t('common.postalCode') }}</span>
              <input type="text" v-model="form.postalCode" placeholder="000-0000" autocomplete="postal-code">
            </label>
          </div>

          <h2 class="panel-title panel-title--spaced">{{ $t('checkout.paymentMock') }}</h2>

          <label class="field">
            <span class="field__label">{{ $t('checkout.cardNumber') }}</span>
            <input type="text" v-model="form.cardNumber" placeholder="4242 4242 4242 4242" autocomplete="cc-number" inputmode="numeric">
          </label>

          <div class="field-grid">
            <label class="field">
              <span class="field__label">{{ $t('checkout.expiry') }}</span>
              <input type="text" v-model="form.cardExpiry" placeholder="MM / YY" autocomplete="cc-exp">
            </label>
            <label class="field">
              <span class="field__label">{{ $t('checkout.cvc') }}</span>
              <input type="text" v-model="form.cardCvc" placeholder="123" autocomplete="cc-csc" inputmode="numeric">
            </label>
          </div>

          <p class="form-error" v-if="error" :key="error">{{ error }}</p>

          <button type="submit" class="place-order-btn">{{ $t('checkout.placeOrder') }} &rarr;</button>
        </form>

        <div class="summary">
          <h2 class="summary__title">{{ $t('checkout.orderSummary') }}</h2>
          <div class="summary__lines">
            <div v-for="line in lines" :key="line.productId" class="summary__line">
              <span>{{ line.product.name }} &times;{{ line.qty }}</span>
              <span>&yen;{{ formatNumber(line.product.price * line.qty) }}</span>
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
import { useNotificationStore } from '@/store/notifications'
import { useToastStore } from '@/store/toast'
import { formatNumber } from '@/utils/format'

export default {
  name: 'CheckoutPage',

  data () {
    return {
      form: {
        name: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: ''
      },
      error: '',
      orderPlaced: false,
      orderNumber: ''
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
    }
  },

  created () {
    useCatalogStore().fetchAll()
    if (this.$currentUser.name) this.form.name = this.$currentUser.name
    if (this.$currentUser.email) this.form.email = this.$currentUser.email
  },

  methods: {
    formatNumber,
    placeOrder () {
      if (!this.form.name.trim() || !this.form.email.trim() || !this.form.address.trim()) {
        this.error = this.$t('checkout.errorContact')
        return
      }
      if (!this.form.cardNumber.trim() || !this.form.cardExpiry.trim() || !this.form.cardCvc.trim()) {
        this.error = this.$t('checkout.errorPayment')
        return
      }

      this.error = ''
      this.orderNumber = `ID-${Math.floor(100000 + Math.random() * 900000)}`
      this.orderPlaced = true

      useToastStore().add({ type: 'success', message: this.$t('checkout.orderPlaced') })

      useNotificationStore().add({
        type: 'order',
        titleKey: 'checkout.notificationTitle',
        messageKey: 'checkout.notificationMessage',
        messageParams: { orderNumber: this.orderNumber, amount: formatNumber(this.subtotal) },
        detail: {
          orderNumber: this.orderNumber,
          lines: this.lines.map(line => ({ productId: line.productId, name: line.product.name, qty: line.qty, price: line.product.price })),
          subtotal: this.subtotal
        },
        to: `/history/orders/${this.orderNumber}`
      })

      this.cart.clear()
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
