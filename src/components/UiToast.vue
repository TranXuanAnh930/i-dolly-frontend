<template>
  <div
    class="ui-toast component"
    :class="classList"
    role="alert">
    <span class="ui-toast__icon">
      <svg v-if="item.type === 'success'" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10.5 8 14.5 16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <svg v-else-if="item.type === 'error'" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 6 14 14M14 6 6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <svg v-else-if="item.type === 'warning'" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3.5 18 16.5H2L10 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 8.5v3.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="10" cy="14.3" r=".2" fill="currentColor" stroke="currentColor" stroke-width="1.6"/></svg>
      <svg v-else-if="item.type === 'info'" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7.2" stroke="currentColor" stroke-width="1.8"/><path d="M10 9.2v4.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="10" cy="6.6" r=".2" fill="currentColor" stroke="currentColor" stroke-width="1.6"/></svg>
      <svg v-else viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3a4 4 0 0 1 4 4v2.2c0 1.3.4 2.6 1.2 3.6l.7.9a1 1 0 0 1-.8 1.6H4.9a1 1 0 0 1-.8-1.6l.7-.9c.8-1 1.2-2.3 1.2-3.6V7a4 4 0 0 1 4-4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 16.5a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </span>

    <span class="ui-toast__message">{{ item.message }}</span>

    <button type="button" class="ui-toast__close" :aria-label="$t('common.close')" @click="remove">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3 13 13M13 3 3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>

    <span v-if="item.duration" class="ui-toast__progress" :style="{ animationDuration: `${item.duration}ms` }"></span>
  </div>
</template>

<script>
export default {
  name: 'UiToast',
  props: {
    item: {
      type: Object
    }
  },

  methods: {
    remove () {
      this.$emit('remove', this.item.id)
    }
  },

  computed: {
    classList () {
      return {
        default: this.item.type === 'default',
        success: this.item.type === 'success',
        info: this.item.type === 'info',
        warning: this.item.type === 'warning',
        error: this.item.type === 'error'
      }
    }
  },

  mounted () {
    if (this.item.duration) {
      const timer = setTimeout(() => {
        clearTimeout(timer)
        this.remove()
      }, this.item.duration)
    }
  }
}
</script>

<style lang="scss">
.ui-toast.component {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 34px 14px 14px;
  background: $color-white;
  border-radius: 14px;
  box-shadow: 0 12px 28px -10px rgba($color-ink, .28), 0 2px 6px rgba($color-ink, .08);
  overflow: hidden;
  pointer-events: auto;

  &:hover {
    box-shadow: 0 16px 32px -8px rgba($color-ink, .32), 0 2px 6px rgba($color-ink, .1);
  }

  &.default { .ui-toast__icon { background: $color-gray-50; color: $color-gray-500; } .ui-toast__progress { background: $color-gray-400; } }
  &.success { .ui-toast__icon { background: #e6f7ef; color: #147a52; } .ui-toast__progress { background: #1fa876; } }
  &.info { .ui-toast__icon { background: #e8f3fc; color: #1f6fb2; } .ui-toast__progress { background: #1f8fd6; } }
  &.warning { .ui-toast__icon { background: #fef3e0; color: #b06a00; } .ui-toast__progress { background: #f2b705; } }
  &.error { .ui-toast__icon { background: $color-brand-tint; color: $color-brand; } .ui-toast__progress { background: $color-brand; } }
}

.ui-toast__icon {
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 14px;
    height: 14px;
  }
}

.ui-toast__message {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
  font-family: $font-content;
  font-size: 13.5px;
  line-height: 1.45;
  color: $color-ink;
  word-break: break-word;
}

.ui-toast__close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: none;
  padding: 4px;
  color: $color-gray-300;
  cursor: pointer;
  display: flex;
  border-radius: 50%;
  transition: color .12s ease, background .12s ease;

  svg {
    width: 11px;
    height: 11px;
  }

  &:hover {
    color: $color-gray-500;
    background: $color-gray-50;
  }
}

.ui-toast__progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  transform-origin: left center;
  opacity: .35;
  animation-name: ui-toast-shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes ui-toast-shrink {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
</style>
