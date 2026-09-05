<template>
  <div id="app">
    <ConfettiStars class="app-backdrop"/>
    <NotificationBar></NotificationBar>
    <AppHeader></AppHeader>
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component"></component>
        </transition>
      </router-view>
    </main>
    <AppFooter></AppFooter>
  </div>
</template>

<script>
import AppHeader from './Header.vue'
import AppFooter from './Footer.vue'
import ConfettiStars from '@/components/ConfettiStars.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useDomStore } from '@/store/dom'

export default {
  name: 'AppLayout',
  components: {
    AppHeader,
    AppFooter,
    ConfettiStars,
    NotificationBar
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
