import i18n from '@/i18n'

// Backend enum values → translated display labels. Reads i18n.global fresh on
// every call (like utils/format.js), so a LanguageSwitcher change re-renders
// them. Anything outside the known vocabulary falls back to the raw value
// rather than showing an i18n key path.

// ticket_types.tier: 'vip' | 'premium' | 'regular'
export function tierLabel (tier) {
  if (!tier) return ''
  const key = `labels.tier.${tier}`
  return i18n.global.te(key) ? i18n.global.t(key) : tier
}

// Product category names as the backend returns them ('Album', 'Single',
// 'EP', 'Merch' — see the backend's scripts/seed.py).
export function categoryLabel (category) {
  if (!category) return ''
  const key = `labels.category.${category.toLowerCase()}`
  return i18n.global.te(key) ? i18n.global.t(key) : category
}
