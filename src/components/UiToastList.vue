<template>
  <transition-group name="slide" tag="div" class="ui-toast-list component">
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
  top: 50px;
  left: 50px;
  width: 300px;
  position: fixed;
  z-index: 9999;
}

.slide-leave-active,
.slide-enter-active {
  transition: .3s;
}
.slide-enter {
  transform: translate(0, 100%);
}
.slide-leave-to {
  transform: translate(-200%, 0);
}

</style>
