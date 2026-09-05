<!-- https://codesandbox.io/s/qvow6lvp64 -->
<script>
export default {
  name: 'UiOnClickOutside',
  props: ['do'],
  mounted () {
    this.listener = e => {
      if (e.target !== this.$el && !this.$el.contains(e.target)) {
        this.do()
      }
    }
    document.addEventListener('click', this.listener, true)
  },
  beforeUnmount () {
    document.removeEventListener('click', this.listener, true)
  },
  render () {
    return this.$slots.default()[0]
  }
}
</script>
