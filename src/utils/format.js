import { format, formatDistanceToNow } from 'date-fns'
import { enUS, ja } from 'date-fns/locale'

import i18n from '@/i18n'

const DATE_FNS_LOCALES = { en: enUS, ja }
const INTL_LOCALES = { en: 'en-US', ja: 'ja-JP' }

/**
 * The active locale can change at any time (LanguageSwitcher), so this reads
 * i18n.global.locale fresh on every call rather than caching it.
 */
export function currentLocale () {
  return i18n.global.locale === 'ja' ? 'ja' : 'en'
}

export function formatDate (date, formatStr) {
  return format(date, formatStr, { locale: DATE_FNS_LOCALES[currentLocale()] })
}

export function formatNumber (value, options) {
  return new Intl.NumberFormat(INTL_LOCALES[currentLocale()], options).format(value)
}

export function formatRelativeTime (date) {
  return formatDistanceToNow(date, { addSuffix: true, locale: DATE_FNS_LOCALES[currentLocale()] })
}
