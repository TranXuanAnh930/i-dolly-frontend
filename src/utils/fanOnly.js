import { useToastStore } from '@/store/toast'
import i18n from '@/i18n'

// Buying (cart, checkout) is fan-account-only server-side — a manager or
// admin gets 403 fan_only_purchase. Rather than let staff land on a cart
// that can never check out, these pages say so up front with the same
// permission message and send them back to their own area — still logged
// in (a 403 is never a reason to end the session).
export function redirectIfStaff (vm) {
  const role = vm.$currentUser.role
  if (role !== 'manager' && role !== 'admin') return false
  useToastStore().add({ type: 'error', message: i18n.global.t('errors.fan_only_purchase') })
  vm.$router.replace({ name: role === 'admin' ? 'admin-companies' : 'manager-events' })
  return true
}
