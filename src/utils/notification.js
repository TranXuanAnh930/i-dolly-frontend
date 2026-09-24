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
  if (item.type === 'order_shipped') return 'order-shipped'
  if (item.type === 'ticket_confirmation' || item.type === 'lottery_payment_confirmation' || item.type === 'lottery_registered' || item.type === 'lottery_payment_reminder') return 'ticket'
  if (item.type === 'lottery_result') return isWin ? 'lottery-won' : 'lottery-lost'
  if (item.type === 'lottery_draw_triggered') return 'lottery-draw'
  if (item.type === 'lottery_draw_failed') return 'lottery-draw-failed'
  if (item.type === 'lottery_draw_completed') return 'lottery-draw-done'
  return 'generic'
}

// Manager-facing (see concert_service.notify_managers_of_draw_trigger/
// _failure/_completion) — the row only carries concert_id, not the
// concert's title, so none of these can describe which one inline.
// triggered/failed both point at the manager's edit page, where
// store/events/lotteryDraw.js's own poll lives: landing here after a
// lottery_draw_failed notification shows the same failed state and the
// re-enabled draw button, not just a bare fact with nothing to do next.
// completed instead goes straight to the results table — by then there's
// nothing left to watch or retry, only winners/losers to review.
export function notificationLink (item) {
  if (item.type === 'order_confirmation' || item.type === 'order_shipped') return `/history/orders/${item.order_id}`
  // A lottery_payment_reminder fired by a draw that ran before the backend's
  // new_ticket.id-population fix will have ticket_id: null forever — falls
  // back to the notifications list instead of a dead /history/tickets/null.
  if (item.type === 'ticket_confirmation' || item.type === 'lottery_payment_confirmation' || item.type === 'lottery_payment_reminder') {
    return item.ticket_id ? `/history/tickets/${item.ticket_id}` : '/notifications'
  }
  if (item.type === 'lottery_result' || item.type === 'lottery_registered') return `/history/lottery/${item.lottery_entry_id}`
  if (['lottery_draw_triggered', 'lottery_draw_failed'].includes(item.type)) {
    return { name: 'manager-events-edit', params: { id: item.concert_id } }
  }
  if (item.type === 'lottery_draw_completed') {
    return { name: 'manager-events-lottery-results', params: { id: item.concert_id } }
  }
  return '/notifications'
}

export function notificationTitleKey (item, isWin) {
  if (item.type === 'order_confirmation') return 'notifications.orderConfirmationTitle'
  if (item.type === 'order_shipped') return 'notifications.orderShippedTitle'
  if (item.type === 'ticket_confirmation') return 'notifications.ticketConfirmationTitle'
  if (item.type === 'lottery_payment_confirmation') return 'notifications.lotteryPaymentConfirmationTitle'
  if (item.type === 'lottery_registered') return 'notifications.lotteryRegisteredTitle'
  if (item.type === 'lottery_payment_reminder') return 'notifications.lotteryPaymentReminderTitle'
  if (item.type === 'lottery_result') return isWin ? 'notifications.lotteryWonTitle' : 'notifications.lotteryLostTitle'
  if (item.type === 'lottery_draw_triggered') return 'notifications.lotteryDrawTriggeredTitle'
  if (item.type === 'lottery_draw_failed') return 'notifications.lotteryDrawFailedTitle'
  if (item.type === 'lottery_draw_completed') return 'notifications.lotteryDrawCompletedTitle'
  if (item.type === 'password_reset') return 'notifications.passwordResetTitle'
  return 'notifications.genericTitle'
}

export function notificationMessageKey (item, isWin) {
  if (item.type === 'order_confirmation') return 'notifications.orderConfirmationMessage'
  if (item.type === 'order_shipped') return 'notifications.orderShippedMessage'
  if (item.type === 'ticket_confirmation') return 'notifications.ticketConfirmationMessage'
  if (item.type === 'lottery_payment_confirmation') return 'notifications.lotteryPaymentConfirmationMessage'
  if (item.type === 'lottery_registered') return 'notifications.lotteryRegisteredMessage'
  if (item.type === 'lottery_payment_reminder') return 'notifications.lotteryPaymentReminderMessage'
  if (item.type === 'lottery_result') return isWin ? 'notifications.lotteryWonMessage' : 'notifications.lotteryLostMessage'
  if (item.type === 'lottery_draw_triggered') return 'notifications.lotteryDrawTriggeredMessage'
  if (item.type === 'lottery_draw_failed') return 'notifications.lotteryDrawFailedMessage'
  if (item.type === 'lottery_draw_completed') return 'notifications.lotteryDrawCompletedMessage'
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

// draw_lottery processes every open campaign on a concert in one pass (see
// lottery_draw_service.py), so a fan who entered more than one tier for the
// same event gets one lottery_result row per tier — won on one, lost on
// another is the normal, correct outcome, not a conflicting pair of
// notifications for "the same" draw. Without the tier in the title/message,
// though, "You won!" and "Lottery result" sitting next to each other in the
// list read exactly like a contradiction, so this resolves which tier each
// row is actually about.
export function lotteryResultTier (item, lotteryEntriesStore) {
  if (item.type !== 'lottery_result') return ''
  const entry = lotteryEntriesStore.byId(item.lottery_entry_id)
  const tier = entry && entry.campaign && entry.campaign.ticket_type && entry.campaign.ticket_type.tier
  return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : ''
}
