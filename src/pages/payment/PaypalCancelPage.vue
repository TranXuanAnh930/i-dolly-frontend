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
// Lands here when the fan backs out on PayPal's own approval page instead
// of finishing (docs/api-spec.md §6 step 6) — no capture call needed, the
// order/ticket simply stays "pending" server-side (nothing auto-cancels
// it), so this page is purely informational.
export default {
  name: 'PaypalCancelPage'
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
