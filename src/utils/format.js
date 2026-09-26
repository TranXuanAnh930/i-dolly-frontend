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

// date-fns only swaps token TEXT for a locale (weekday/month names, the
// am/pm marker) — it never reorders the tokens themselves. Reusing the
// English "EEE, MMM d, yyyy · h:mm a" pattern under the ja locale used to
// just translate the words in place ("水, 10月 7, 2026 · ...", comma-joined
// like English but with Japanese tokens dropped in) instead of reading like
// an actual Japanese date. This picks a genuinely different pattern per
// locale for the one "event date + start time" format used on event/ticket
// pages, rather than one pattern translated in place.
const EVENT_DATE_TIME_FORMAT = {
  en: 'EEE, MMM d, yyyy · h:mm a',
  ja: 'yyyy年M月d日(E) · h:mm a'
}

export function formatEventDateTime (date) {
  return format(date, EVENT_DATE_TIME_FORMAT[currentLocale()], { locale: DATE_FNS_LOCALES[currentLocale()] })
}

export function formatNumber (value, options) {
  return new Intl.NumberFormat(INTL_LOCALES[currentLocale()], options).format(value)
}

export function formatRelativeTime (date) {
  return formatDistanceToNow(date, { addSuffix: true, locale: DATE_FNS_LOCALES[currentLocale()] })
}
