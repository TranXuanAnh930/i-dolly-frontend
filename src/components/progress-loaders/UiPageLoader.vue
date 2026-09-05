<template>
  <div class="ui-page-loader component">
    <UiSpinnerWave color="#E4007F" :size="96"/>
  </div>
</template>

<script>
import UiSpinnerWave from './UiSpinnerWave.vue'

export default {
  name: 'UiPageLoader',
  components: { UiSpinnerWave }
}
</script>

<style scoped lang="scss">
.ui-page-loader.component {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, .5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>
