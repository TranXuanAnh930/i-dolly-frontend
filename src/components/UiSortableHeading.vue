<template>
  <div @click="onClick" :class="isActiveClass" class="ui-sortable-heading component">
    <slot></slot>
    <span>
      <UiBaseIcon class="default-sort" iconName="sort" v-if="!sort"/>
      <UiBaseIcon class="asc" iconName="sortUp" v-if="sort === 'asc'"/>
      <UiBaseIcon class="desc" iconName="sortDown" v-if="sort === 'desc'"/>
    </span>
  </div>
</template>

<script>
import UiBaseIcon from './icons/UiBaseIcon'

export default {
  name: 'UiSortableHeading',
  props: {
    modelValue: {
      type: String,
      'default': ''
    }
  },

  emits: ['reset', 'update:modelValue'],

  components: {
    UiBaseIcon
  },

  watch: {
    modelValue (value) {
      this.sort = value || ''
    }
  },

  data () {
    return {
      sort: this.modelValue
    }
  },
  methods: {
    onClick () {
      if (this.sort === '') {
        this.sort = 'asc'
      } else if (this.sort === 'asc') {
        this.sort = 'desc'
      } else {
        this.sort = ''
      }
      // at first send reset events
      this.$emit('reset')
      // and ONLY after reset event send change event
      this.$emit('update:modelValue', this.sort)
    }
  },
  computed: {
    isActiveClass () {
      return {'active': this.sort === 'asc' || this.sort === 'desc'}
    }
  }
}
</script>

<style scoped lang="scss">
.ui-sortable-heading.component {
  display: flex;
  align-items: center;
  font-weight: 400;
  cursor: pointer;
  &.active {
    font-weight: 600;
  }
  span {
    margin-left: 5px;
  }
}
</style>
