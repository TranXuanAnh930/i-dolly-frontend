<template>
  <div id="app">
    <ConfettiStars class="app-backdrop"/>
    <NotificationBar></NotificationBar>
    <AppHeader></AppHeader>
    <main class="main">
      <!-- Covers the window between the app mounting and the router's
           initial navigation resolving — a slow/cold backend can leave
           that gap open for a while (initCurrentUserStateMiddleware awaits
           a token refresh before calling next()), during which
           <router-view> renders nothing at all under an otherwise fine
           header. -->
      <UiPageLoader v-if="!routerReady"/>
      <router-view v-else v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component"></component>
        </transition>
      </router-view>
    </main>
    <AppFooter></AppFooter>
  </div>
</template>

<script>
import router from '@/router'
import AppHeader from './Header.vue'
import AppFooter from './Footer.vue'
import ConfettiStars from '@/components/ConfettiStars.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'
import { useDomStore } from '@/store/dom'

export default {
  name: 'AppLayout',
  components: {
    AppHeader,
    AppFooter,
    ConfettiStars,
    NotificationBar,
    UiPageLoader
  },
  data () {
    return {
      // Flips once, the first time the router finishes its initial
      // navigation (including every beforeEach guard) — never resets, so
      // this only ever covers app boot, not normal SPA navigation between
      // pages (each page already shows its own loading state for that).
      routerReady: false
    }
  },
  created () {
    router.isReady().then(() => { this.routerReady = true })
  },
  methods: {
    commitWindowWidth () {
      useDomStore().setWindowWidth(window.innerWidth)
    }
  },
  mounted () {
    this.commitWindowWidth()
    window.addEventListener('resize', this.commitWindowWidth)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.commitWindowWidth)
  }
}
</script>

<style scoped>
.app-backdrop {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
