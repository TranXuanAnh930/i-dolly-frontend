<template>
  <span class="status-badge" :style="{ backgroundColor: meta.bg, color: meta.color }">
    {{ $t(meta.labelKey) }}
  </span>
</template>

<script>
import { getStatusMeta } from '@/data/statusMeta'

export default {
  name: 'StatusBadge',

  props: {
    status: { type: String, required: true }
  },

  computed: {
    meta () {
      return getStatusMeta(this.status)
    }
  }
}
</script>

<style lang="scss" scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 12px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: .02em;
  white-space: nowrap;
}
</style>
