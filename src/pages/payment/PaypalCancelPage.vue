<template>
  <div class="paypal-cancel-page">
    <div class="wrapper content">
      <div class="confirmation">
        <div class="confirmation__badge">&times;</div>
        <h1 class="confirmation__title">{{ $t('paypalCancel.title') }}</h1>
        <p class="confirmation__note">{{ $t('paypalCancel.note') }}</p>
        <div class="confirmation__actions">
          <router-link to="/history" class="confirmation__btn">{{ $t('ticketPurchase.viewHistory') }}</router-link>
          <router-link to="/events" class="confirmation__link">{{ $t('checkout.backToEvents') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PaymentService } from '@/services/payment/payment.service'
import { useOrdersStore } from '@/store/store/orders'
import { useTicketsStore } from '@/store/events/tickets'

// Lands here when the fan backs out on PayPal's own approval page instead
// of finishing (docs/api-spec.md §6 steps 6-7). Tells the backend to cancel
// the checkout right away, rather than leaving it pending until the fan's
// next checkout cleans it up. The page shows the same thing whatever the
// call returns: a 404 means the checkout was already resolved (a reload,
// or a later checkout in another tab), and a network error still leaves
// nothing charged.
export default {
  name: 'PaypalCancelPage',

  async created () {
    const pgOrderId = this.$route.query.token
    if (!pgOrderId) return
    try {
      await PaymentService.cancelPaypal(pgOrderId)
    } catch (error) {
      // 404 = already resolved; anything else is non-fatal here, see above.
    }
    // The orders/tickets stores are a once-per-session cache that may hold
    // this checkout's pre-payment "pending" snapshot (see
    // PaypalReturnPage.vue). Refetch whichever is loaded so History shows it
    // cancelled; an unloaded one fetches fresh when History opens.
    const stores = [useOrdersStore(), useTicketsStore()]
    await Promise.all(stores.filter(store => store.loaded).map(store => store.fetchAll({ force: true })))
  }
}
</script>

<style lang="scss" scoped>
.paypal-cancel-page {
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
  background: $color-gray-400;
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
  color: $color-ink;
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
