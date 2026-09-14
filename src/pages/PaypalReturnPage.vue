<template>
  <UiPageLoader v-if="capturing"/>

  <div v-else class="paypal-return-page">
    <div class="wrapper content">
      <div class="confirmation" :class="{ 'confirmation--declined': outcome === 'failed' }">
        <div class="confirmation__badge" :class="{ 'confirmation__badge--declined': outcome === 'failed' }">
          <template v-if="outcome === 'failed'">&times;</template>
          <template v-else>&check;</template>
        </div>

        <template v-if="outcome === 'success'">
          <h1 class="confirmation__title">{{ $t('paypalReturn.successTitle') }}</h1>
          <p class="confirmation__note">{{ $t('paypalReturn.successNote') }}</p>
        </template>
        <template v-else>
          <h1 class="confirmation__title confirmation__title--declined">{{ $t('paypalReturn.failedTitle') }}</h1>
          <p class="confirmation__note">{{ error || $t('paypalReturn.failedNote') }}</p>
        </template>

        <div class="confirmation__actions">
          <router-link v-if="detailsRoute" :to="detailsRoute" class="confirmation__btn">{{ $t('paypalReturn.viewDetails') }}</router-link>
          <router-link to="/history" class="confirmation__link">{{ $t('ticketPurchase.viewHistory') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PaymentService } from '@/services/payment.service'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'

// Shared landing spot for PayPal's redirect back after the buyer approves
// on PayPal's own site (docs/api-spec.md §6 step 4-5) — one route handles
// both an order checkout and a direct-sale ticket checkout, since PayPal
// itself never says which kind this was; only the capture response
// (order_id vs ticket_id populated) tells us that, after the fact.
export default {
  name: 'PaypalReturnPage',

  components: { UiPageLoader },

  data () {
    return {
      capturing: true,
      outcome: null,
      orderId: null,
      ticketId: null,
      error: ''
    }
  },

  computed: {
    detailsRoute () {
      if (this.orderId) return { name: 'order-details', params: { orderNumber: this.orderId } }
      if (this.ticketId) return { name: 'ticket-details', params: { orderNumber: this.ticketId } }
      return null
    }
  },

  async created () {
    const pgOrderId = this.$route.query.token
    if (!pgOrderId) {
      this.error = this.$t('paypalReturn.missingToken')
      this.outcome = 'failed'
      this.capturing = false
      return
    }

    try {
      const response = await PaymentService.capturePaypal(pgOrderId)
      const payment = response.data
      this.orderId = payment.order_id
      this.ticketId = payment.ticket_id
      this.outcome = payment.status === 'success' ? 'success' : 'failed'
    } catch (err) {
      this.outcome = 'failed'
      this.error = err.message
    } finally {
      this.capturing = false
    }
  }
}
</script>

<style lang="scss" scoped>
.paypal-return-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.content {
  padding: 60px 0 100px;
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
  max-width: 480px;
  margin: 0 auto;
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
