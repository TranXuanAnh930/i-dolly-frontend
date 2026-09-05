<template>
  <div class="ui-spinner-wave component">
    <div class="loader" :style="{ width: `${size}px`, height: `${size}px` }">
      <span class="loader__ring"></span>
      <span class="loader__bow" :style="{ color }">
        <BowIcon/>
      </span>
    </div>
  </div>
</template>

<script>
import BowIcon from '@/components/icons/BowIcon.vue'

export default {
  name: 'UiSpinnerWave',
  components: { BowIcon },
  props: {
    color: {
      type: String,
      default: '#bebebe'
    },
    size: {
      type: Number,
      default: 52
    }
  }
}
</script>

<style scoped lang="scss">
.ui-spinner-wave {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader {
  position: relative;
}

.loader__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #e4007f, #f2b705, #1f8fd6, #b6379c, #1fa876, #e4007f);
  animation: loader-spin 1.1s linear infinite;

  &::after {
    content: '';
    position: absolute;
    inset: 9%;
    border-radius: 50%;
    background: $color-white;
  }
}

.loader__bow {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: loader-pulse 1.1s ease-in-out infinite;

  svg {
    width: 38%;
    height: 38%;
  }
}

@keyframes loader-spin {
  to { transform: rotate(360deg); }
}

@keyframes loader-pulse {
  0%, 100% { transform: scale(.82); opacity: .7; }
  50% { transform: scale(1.05); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .loader__ring,
  .loader__bow {
    animation: none;
  }
}
</style>
