<template>
  <router-link :to="`/groups/${group.id}`" class="group-card">
    <div class="poster" :style="{ background: `linear-gradient(155deg, ${color.hex} 0%, rgba(0,0,0,.38) 115%)` }">
      <span class="poster__watermark" :style="{ color: color.text }">{{ group.name.charAt(0) }}</span>
      <span class="poster__count">{{ $t('members.resultCount', { count: memberCount }) }}</span>
    </div>

    <div class="body">
      <h3 class="title">{{ group.name }}</h3>
      <p class="debut" v-if="debutLabel">{{ $t('groupDetail.debut', { date: debutLabel }) }}</p>
      <p class="blurb" v-if="group.description">{{ group.description }}</p>
    </div>
  </router-link>
</template>

<script>
import { parseISO } from 'date-fns'

import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { formatDate } from '@/utils/format'

export default {
  name: 'GroupCard',

  props: {
    // Page-shaped (GroupWithCount from the backend): member_count
    // precomputed server-side, so this card never needs a store lookup.
    group: { type: Object, required: true }
  },

  computed: {
    // Groups carry no color of their own — same stable palette fallback
    // used everywhere else a group is themed.
    color () {
      const hex = paletteColorForId(this.group.id)
      return { hex, text: contrastTextColor(hex) }
    },
    memberCount () {
      return this.group.member_count
    },
    debutLabel () {
      return this.group.debut_date ? formatDate(parseISO(this.group.debut_date), 'MMM d, yyyy') : null
    }
  }
}
</script>

<style lang="scss" scoped>
.group-card {
  display: flex;
  flex-direction: column;
  background: $color-white;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
  transition: transform .15s ease, box-shadow .15s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px -6px rgba($color-ink, .18);
  }
}

.poster {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.poster__watermark {
  position: absolute;
  right: -6px;
  bottom: -34px;
  font-family: $font-title;
  font-weight: 900;
  font-size: 148px;
  line-height: 1;
  opacity: .18;
  user-select: none;
}

.poster__count {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, .9);
  border-radius: 999px;
  padding: 5px 12px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  color: $color-ink;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  flex: 1;
}

.title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 19px;
  color: $color-ink;
}

.debut {
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: $color-gray-400;
}

.blurb {
  margin-top: 6px;
  font-family: $font-content;
  font-size: 13px;
  line-height: 1.5;
  color: $color-font-main;
}
</style>
