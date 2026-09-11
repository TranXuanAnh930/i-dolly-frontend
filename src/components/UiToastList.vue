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

  computed: {
    toastsList () {
      return useToastStore().toastsList
    }
  },

  methods: {
    onRemove (id) {
      useToastStore().remove(id)
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
  // Newest toast is pushed last onto the store's list — reversed so it
  // renders nearest the top-right anchor (where it visually "enters"),
  // with older ones cascading downward below it.
  flex-direction: column-reverse;
  gap: 10px;
  pointer-events: none;

  @include media_mobile {
    top: 12px;
    right: 12px;
    left: 12px;
    width: auto;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: transform .3s cubic-bezier(.32, .72, 0, 1), opacity .3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(24px, -8px) scale(.96);
}

.toast-leave-active {
  position: absolute;
  width: 100%;
}
</style>
