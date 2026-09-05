<!--
  Procedural anime-style bust portrait. This project has no image-generation
  tool available, so idol "photos" are drawn here from parameters instead of
  generated raster art — hairStyle picks the back-hair silhouette, everything
  else (hair/eye/skin color) comes straight from the member's data record.
-->
<template>
  <svg class="idol-portrait" viewBox="0 0 200 240" role="img" :aria-label="`Portrait of ${name}`">
    <!-- uniform / shoulders -->
    <path d="M30,240 L38,192 Q100,168 162,192 L170,240 Z" fill="#fdfdfd"/>
    <path d="M40,193 L100,222 L62,193 Z" fill="#1e2a4a"/>
    <path d="M160,193 L100,222 L138,193 Z" fill="#1e2a4a"/>
    <polygon points="92,214 100,220 92,226 84,220" :fill="accent"/>
    <polygon points="108,214 100,220 108,226 116,220" :fill="accent"/>
    <circle cx="100" cy="220" r="3" :fill="accent"/>

    <!-- neck -->
    <path d="M84,155 L84,178 Q100,185 116,178 L116,155 Z" :fill="skinTone"/>

    <!-- back hair -->
    <path :d="backHairPath" :fill="hairColor"/>

    <!-- head -->
    <ellipse cx="100" cy="108" rx="50" ry="56" :fill="skinTone"/>

    <!-- side locks -->
    <path d="M60,90 Q52,130 58,160 Q64,155 64,120 Q66,100 60,90 Z" :fill="hairColor"/>
    <path d="M140,90 Q148,130 142,160 Q136,155 136,120 Q134,100 140,90 Z" :fill="hairColor"/>

    <!-- bangs -->
    <path d="M58,85 Q100,52 142,85 Q140,102 130,96 Q115,80 100,90 Q85,80 70,96 Q60,102 58,85 Z" :fill="hairColor"/>

    <!-- blush -->
    <ellipse cx="72" cy="128" rx="7" ry="4" fill="#ff9db8" opacity=".5"/>
    <ellipse cx="128" cy="128" rx="7" ry="4" fill="#ff9db8" opacity=".5"/>

    <!-- eyebrows -->
    <path d="M70,96 Q78,91 87,95" stroke="#3a2a2a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M130,96 Q122,91 113,95" stroke="#3a2a2a" stroke-width="2" fill="none" stroke-linecap="round"/>

    <!-- eyes -->
    <ellipse cx="78" cy="115" rx="9" ry="11" :fill="eyeColor"/>
    <ellipse cx="122" cy="115" rx="9" ry="11" :fill="eyeColor"/>
    <circle cx="75" cy="110" r="2.4" fill="#fff"/>
    <circle cx="119" cy="110" r="2.4" fill="#fff"/>
    <path d="M67,107 Q78,100 89,107" stroke="#2b2320" stroke-width="1.6" fill="none"/>
    <path d="M133,107 Q122,100 111,107" stroke="#2b2320" stroke-width="1.6" fill="none"/>

    <!-- mouth -->
    <path d="M92,138 Q100,143 108,138" stroke="#c2455e" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>
</template>

<script>
const BACK_HAIR_PATHS = {
  long: 'M50,90 Q40,180 55,235 L70,235 Q60,150 66,95 Q100,68 134,95 Q140,150 130,235 L145,235 Q160,180 150,90 Q100,38 50,90 Z',
  twin: 'M65,75 Q100,58 135,75 Q140,100 100,106 Q60,100 65,75 Z M45,100 Q30,142 38,212 Q48,227 58,212 Q52,142 62,100 Z M155,100 Q170,142 162,212 Q152,227 142,212 Q148,142 138,100 Z',
  bob: 'M55,85 Q45,140 55,176 Q100,192 145,176 Q155,140 145,85 Q100,64 55,85 Z',
  pony: 'M65,75 Q100,58 135,75 Q142,100 100,108 Q58,100 65,75 Z M55,90 Q48,122 58,152 Q66,146 65,120 Q66,100 60,90 Z M138,95 Q170,122 158,206 Q148,220 140,206 Q136,150 130,100 Z'
}

export default {
  name: 'IdolPortrait',

  props: {
    name: { type: String, required: true },
    hairStyle: { type: String, default: 'long' },
    hairColor: { type: String, required: true },
    eyeColor: { type: String, required: true },
    skinTone: { type: String, required: true },
    accent: { type: String, default: '#e4007f' }
  },

  computed: {
    backHairPath () {
      return BACK_HAIR_PATHS[this.hairStyle] || BACK_HAIR_PATHS.long
    }
  }
}
</script>

<style lang="scss" scoped>
.idol-portrait {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
