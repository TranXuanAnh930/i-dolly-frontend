<!-- Compact EN / 日本語 toggle. Shows the language you'd switch TO. -->
<template>
  <button type="button" class="lang-switch" @click="toggle" :aria-label="`Switch to ${isJa ? 'English' : '日本語'}`">
    {{ isJa ? 'English' : '日本語' }}
  </button>
</template>

<script>
import { LOCALE_STORAGE_KEY } from '@/i18n'

export default {
  name: 'LanguageSwitcher',

  computed: {
    isJa () {
      return this.$i18n.locale === 'ja'
    }
  },

  methods: {
    toggle () {
      const next = this.isJa ? 'en' : 'ja'
      this.$i18n.locale = next
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, next)
      } catch {
        // ignore — storage may be unavailable
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.lang-switch {
  border: 1.5px solid rgba(255, 255, 255, .5);
  border-radius: 999px;
  background: none;
  padding: 5px 12px;
  color: $color-white;
  font-family: $font-content;
  font-weight: 700;
  font-size: 11.5px;
  cursor: pointer;
  transition: background .12s ease, border-color .12s ease;

  &:hover {
    background: rgba(255, 255, 255, .15);
    border-color: $color-white;
  }
}
</style>
