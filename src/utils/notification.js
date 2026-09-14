// Maps a real NotificationRead (api-spec.md §7 in the backend repo) down
// to what NotificationDropdown.vue and NotificationsPage.vue both need to
// render one — icon, link, and i18n keys — so neither duplicates this
// per-type branching. `isWin` must be resolved by the caller: a
// lottery_result row's own fields don't say won vs lost (the backend
// distinguishes it by reading the linked LotteryEntry's own status, not a
// separate notification type) — see lotteryEntriesStore, already loaded,
// rather than a fresh fetch just for this.
export function notificationIconType (item, isWin) {
  if (item.type === 'order_confirmation') return 'order'
  if (item.type === 'ticket_confirmation' || item.type === 'lottery_payment_confirmation') return 'ticket'
  if (item.type === 'lottery_result') return isWin ? 'lottery-won' : 'lottery-lost'
  return 'generic'
}

export function notificationLink (item) {
  if (item.type === 'order_confirmation') return `/history/orders/${item.order_id}`
  if (item.type === 'ticket_confirmation' || item.type === 'lottery_payment_confirmation') return `/history/tickets/${item.ticket_id}`
  if (item.type === 'lottery_result') return `/history/lottery/${item.lottery_entry_id}`
  return '/notifications'
}

export function notificationTitleKey (item, isWin) {
  if (item.type === 'order_confirmation') return 'notifications.orderConfirmationTitle'
  if (item.type === 'ticket_confirmation') return 'notifications.ticketConfirmationTitle'
  if (item.type === 'lottery_payment_confirmation') return 'notifications.lotteryPaymentConfirmationTitle'
  if (item.type === 'lottery_result') return isWin ? 'notifications.lotteryWonTitle' : 'notifications.lotteryLostTitle'
  if (item.type === 'password_reset') return 'notifications.passwordResetTitle'
  return 'notifications.genericTitle'
}

export function notificationMessageKey (item, isWin) {
  if (item.type === 'order_confirmation') return 'notifications.orderConfirmationMessage'
  if (item.type === 'ticket_confirmation') return 'notifications.ticketConfirmationMessage'
  if (item.type === 'lottery_payment_confirmation') return 'notifications.lotteryPaymentConfirmationMessage'
  if (item.type === 'lottery_result') return isWin ? 'notifications.lotteryWonMessage' : 'notifications.lotteryLostMessage'
  if (item.type === 'password_reset') return 'notifications.passwordResetMessage'
  return 'notifications.genericMessage'
}

// lottery_result is the only type that needs this — every other type's
// mapping above is a pure function of the notification row alone.
export function isLotteryWin (item, lotteryEntriesStore) {
  if (item.type !== 'lottery_result') return false
  const entry = lotteryEntriesStore.byId(item.lottery_entry_id)
  return !!entry && entry.status === 'won'
}
