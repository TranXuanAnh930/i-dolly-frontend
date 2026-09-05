<template>
  <div class="footer">
    <div class="wrapper">
      I-Dolly &middot; {{ $t('footer.tagline') }} &middot; &copy; {{ currentYear }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  data () {
    return {
      currentYear: new Date().getFullYear()
    }
  }
}
</script>

<style lang="scss" scoped>
.footer {
  text-align: center;
  background-color: $color-ink;
  color: rgba(255, 255, 255, .55);
  font-family: $font-content;
  font-size: 13px;
  padding: 28px 0;
  width: 100%;
  margin-top: auto;
}
</style>
