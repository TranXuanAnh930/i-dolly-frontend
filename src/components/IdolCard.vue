<template>
  <router-link :to="`/members/${member.id}`" class="idol-card">
    <div class="portrait-area" :style="{ backgroundColor: color.hex }">
      <span class="position-badge" v-if="primaryPosition">{{ primaryPosition.name }}</span>
      <img v-if="photoUrl" :src="photoUrl" :alt="member.name" class="portrait-photo">
      <IdolPortrait v-else :name="member.name" v-bind="fallbackPortrait" :accent="color.hex"/>
    </div>

    <div class="nameplate" :style="{ backgroundColor: color.hex, color: color.text }">
      <p class="nameplate__name">{{ member.name }}</p>
      <p class="nameplate__unit" v-if="group">{{ group.name }}</p>
    </div>

    <div class="body">
      <p class="description" v-if="member.short_intro">{{ member.short_intro }}</p>
      <p class="meta" v-if="member.hometown">{{ member.hometown }}</p>
      <p class="birthday" v-if="birthdayLabel">{{ $t('idolDetail.birthday') }} &middot; {{ birthdayLabel }}</p>
    </div>
  </router-link>
</template>

<script>
import { parseISO } from 'date-fns'

import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { resolveMediaUrl } from '@/utils/media'
import { fallbackPortraitFor } from '@/utils/idolPortrait'
import { formatDate } from '@/utils/format'
import IdolPortrait from './IdolPortrait.vue'

export default {
  name: 'IdolCard',

  components: { IdolPortrait },

  props: {
    // Page-shaped (IdolWithPositions from the backend): positions, color
    // and group all embedded, so this card never needs a store lookup.
    member: { type: Object, required: true }
  },

  computed: {
    group () {
      return this.member.group
    },
    // The idol's real color (color_id → idol_colors.hex_code, embedded by
    // the backend) when set, otherwise the same stable palette fallback
    // used everywhere else an idol/group has no real color of its own.
    color () {
      const hex = this.member.color ? this.member.color.hex_code : paletteColorForId(this.member.id)
      return { hex, text: contrastTextColor(hex) }
    },
    photoUrl () {
      return resolveMediaUrl(this.member.profile_image_url)
    },
    birthdayLabel () {
      if (!this.member.date_of_birth) return null
      return formatDate(parseISO(this.member.date_of_birth), 'MMM d')
    },
    fallbackPortrait () {
      return fallbackPortraitFor(this.member, this.color.hex)
    },
    // The is_primary credit, falling back to whichever came back first.
    primaryPosition () {
      const positions = this.member.idol_positions || []
      const primary = positions.find(p => p.is_primary)
      return (primary || positions[0] || {}).position || null
    }
  }
}
</script>

<style lang="scss" scoped>
.idol-card {
  display: flex;
  flex-direction: column;
  background: $color-white;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
  transition: transform .15s ease, box-shadow .15s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 22px -8px rgba($color-ink, .22);
  }
}

.portrait-area {
  position: relative;
  aspect-ratio: 3 / 4;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, .16) 0,
    rgba(255, 255, 255, .16) 12px,
    transparent 12px,
    transparent 24px
  );
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-top: 14px;
  overflow: hidden;
}

.portrait-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.position-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
  background: rgba(255, 255, 255, .85);
  border-radius: 999px;
  padding: 5px 12px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  color: $color-ink;
}

.nameplate {
  padding: 10px 14px 12px;
}

.nameplate__name {
  font-family: $font-title;
  font-weight: 900;
  font-size: 19px;
  color: inherit;
  line-height: 1.1;
}

.nameplate__unit {
  margin-top: 2px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: inherit;
  opacity: .8;
}

.body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.description {
  font-family: $font-content;
  font-size: 13px;
  line-height: 1.5;
  color: $color-font-main;
}

.meta {
  font-family: $font-content;
  font-size: 11.5px;
  color: $color-gray-500;
}

.birthday {
  font-family: $font-content;
  font-size: 11.5px;
  color: $color-gray-400;
}
</style>
