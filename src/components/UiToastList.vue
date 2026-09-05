<template>
  <transition-group name="toast" tag="div" class="ui-toast-list component">
    <UiToast
      @remove="onRemove"
      v-for="item in toastsList"
      :item="item"
      :key="item.id"
    />
  </transition-group>
</template>

<script>
import UiToast from './UiToast'
import { useToastStore } from '@/store/toast'

export default {
  name: 'UiToastList',

  components: {
    UiToast
  },

  watch: {
    $route: {
      handler: 'clearToastList',
      deep: 'true'
    }
  },

  computed: {
    toastsList () {
      return useToastStore().toastsList
    }
  },

  methods: {
    onRemove (id) {
      useToastStore().remove(id)
    },
    clearToastList () {
      if (this.toastsList.length) {
        useToastStore().clear()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ui-toast-list.component {
  top: 20px;
  right: 20px;
  width: 340px;
  max-width: calc(100vw - 24px);
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;

  @include media_mobile {
    top: 12px;
    right: 12px;
    left: 12px;
    width: auto;
  }
}

.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: transform .3s cubic-bezier(.32, .72, 0, 1), opacity .3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(24px, -8px) scale(.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(24px, 0) scale(.96);
}

.toast-leave-active {
  position: absolute;
  width: 100%;
}
</style>
