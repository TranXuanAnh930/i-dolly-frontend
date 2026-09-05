import { createI18n } from 'vue-i18n'

import en from './locales/en'
import ja from './locales/ja'

export const LOCALE_STORAGE_KEY = 'i-dolly-locale'

function getInitialLocale () {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved === 'en' || saved === 'ja') return saved
  } catch {
    // ignore — storage may be unavailable
  }
  return 'en'
}

const i18n = createI18n({
  legacy: true, // gives every Options API component this.$t / $i18n for free
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, ja }
})

export default i18n
