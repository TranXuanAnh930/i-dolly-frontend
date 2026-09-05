<template>
  <component
    :is="interactive ? 'button' : 'span'"
    :type="interactive ? 'button' : undefined"
    class="unit-pill"
    :class="{ 'is-outline': interactive && !active }"
    :style="pillStyle"
    @click="interactive && $emit('toggle', unit.id)">
    {{ unit.name }}
  </component>
</template>

<script>
export default {
  name: 'UnitPill',

  props: {
    unit: { type: Object, required: true },
    active: { type: Boolean, default: true },
    interactive: { type: Boolean, default: false }
  },

  emits: ['toggle'],

  computed: {
    pillStyle () {
      const filled = !this.interactive || this.active
      return {
        backgroundColor: filled ? this.unit.color : 'transparent',
        color: filled ? this.unit.textColor : this.unit.color,
        borderColor: this.unit.color
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.unit-pill {
  display: inline-flex;
  align-items: center;
  border: 1.5px solid transparent;
  border-radius: 999px;
  padding: 6px 14px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  cursor: default;

  &.is-outline {
    cursor: pointer;
    transition: transform .12s ease;

    &:hover {
      transform: translateY(-1px);
    }
    &:active {
      transform: translateY(0);
    }
  }
}
</style>
