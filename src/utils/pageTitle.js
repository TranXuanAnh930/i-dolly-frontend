import { watch } from 'vue'

import i18n from '@/i18n'
import { DOMAIN_TITLE } from '@/env'

// The browser tab shows just the page's own name ("Products", "Order
// details", a product's name), translated — never a "I-Dolly | …" route
// slug or a raw id.
//
// Two layers: the route's meta.titleKey (set by setPageTitleMiddleware on
// every navigation), and an optional per-page override for pages whose
// title depends on loaded data (a product/event name). Both are stored as
// something to re-evaluate rather than a finished string, so switching the
// language re-renders whichever one is active without a reload.
let routeTitleKey = null
let override = null

function apply () {
  const text = override ? override() : routeTitleKey ? i18n.global.t(routeTitleKey) : ''
  document.title = text || DOMAIN_TITLE
}

// Called once per navigation — also drops the previous page's override, so
// it can never leak onto the next page.
export function setRouteTitle (titleKey) {
  routeTitleKey = titleKey || null
  override = null
  apply()
}

// For pages that know a better title once their data loads. Pass a function
// when the title contains translated text so it follows language switches,
// e.g. setPageTitle(() => this.$t('orderDetails.title')).
export function setPageTitle (title) {
  override = typeof title === 'function' ? title : () => title
  apply()
}

watch(() => i18n.global.locale, apply)
