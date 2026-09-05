<!--
  A repeating pastel confetti texture (sparkles, blossoms, cat faces) used as
  the site's default backdrop. Two layers give it depth: a "vivid" layer
  where each shape is filled with a two-stop gradient lifted from the app's
  rainbow palette, and a paler white "ghost" layer of small sparkles behind
  it for twinkle. Built as a tiled SVG pattern rather than a fixed count of
  positioned elements, so density stays even no matter how tall the page is.
-->
<template>
  <svg class="confetti-stars" aria-hidden="true">
    <defs>
      <path :id="`${uid}-star`" d="M12 2C12.5 7.5 16.5 11.5 22 12C16.5 12.5 12.5 16.5 12 22C11.5 16.5 7.5 12.5 2 12C7.5 11.5 11.5 7.5 12 2Z"/>
      <g :id="`${uid}-flower`">
        <ellipse cx="12" cy="6" rx="3" ry="5"/>
        <ellipse cx="12" cy="6" rx="3" ry="5" transform="rotate(72 12 12)"/>
        <ellipse cx="12" cy="6" rx="3" ry="5" transform="rotate(144 12 12)"/>
        <ellipse cx="12" cy="6" rx="3" ry="5" transform="rotate(216 12 12)"/>
        <ellipse cx="12" cy="6" rx="3" ry="5" transform="rotate(288 12 12)"/>
      </g>
      <g :id="`${uid}-cat`">
        <circle cx="12" cy="14" r="7"/>
        <polygon points="6,10 8.5,2 11,9"/>
        <polygon points="18,10 15.5,2 13,9"/>
      </g>

      <linearGradient v-for="(g, i) in gradients" :key="i" :id="`${uid}-grad-${i}`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="g[0]"/>
        <stop offset="1" :stop-color="g[1]"/>
      </linearGradient>

      <pattern :id="`${uid}-tile`" width="260" height="260" patternUnits="userSpaceOnUse">
        <use v-for="(item, i) in ghostItems" :key="`ghost-${i}`"
          :href="`#${uid}-star`"
          fill="#ffffff"
          opacity=".4"
          :transform="`translate(${item.x} ${item.y}) rotate(${item.rotate}) scale(${item.scale})`"/>
        <use v-for="(item, i) in mainItems" :key="`main-${i}`"
          :href="`#${uid}-${item.shape}`"
          :fill="`url(#${uid}-grad-${item.gradIdx})`"
          :opacity="item.opacity"
          :transform="`translate(${item.x} ${item.y}) rotate(${item.rotate}) scale(${item.scale})`"/>
      </pattern>
    </defs>

    <rect width="100%" height="100%" :fill="`url(#${uid}-tile)`"/>
  </svg>
</template>

<script>
// same six-stop sweep as the page's rainbow backdrop gradient
const PALETTE = ['#FFADBF', '#E9B7FD', '#9CE6FF', '#7DFFB8', '#FFF97E', '#FFB68E']

const MAIN_LAYOUT = [
  { shape: 'star', x: 30, y: 45, rotate: 10, scale: .85, opacity: .6 },
  { shape: 'flower', x: 125, y: 30, rotate: 0, scale: .75, opacity: .65 },
  { shape: 'cat', x: 210, y: 65, rotate: -8, scale: .7, opacity: .6 },
  { shape: 'star', x: 75, y: 120, rotate: 25, scale: .65, opacity: .6 },
  { shape: 'flower', x: 185, y: 150, rotate: 15, scale: .8, opacity: .6 },
  { shape: 'star', x: 25, y: 190, rotate: -15, scale: .75, opacity: .55 },
  { shape: 'cat', x: 120, y: 215, rotate: 5, scale: .65, opacity: .6 },
  { shape: 'flower', x: 230, y: 220, rotate: -10, scale: .7, opacity: .6 },
  { shape: 'star', x: 150, y: 90, rotate: 40, scale: .55, opacity: .55 },
  { shape: 'cat', x: 60, y: 250, rotate: 12, scale: .6, opacity: .55 }
]

const GHOST_LAYOUT = [
  { x: 100, y: 60, rotate: 20, scale: .4 },
  { x: 170, y: 100, rotate: -30, scale: .35 },
  { x: 50, y: 160, rotate: 15, scale: .4 },
  { x: 220, y: 180, rotate: -10, scale: .3 },
  { x: 140, y: 240, rotate: 35, scale: .35 },
  { x: 10, y: 110, rotate: -20, scale: .3 }
]

let instanceCount = 0

export default {
  name: 'ConfettiStars',

  data () {
    instanceCount += 1
    return {
      uid: `confetti-${instanceCount}`,
      gradients: PALETTE.map((color, i) => [color, PALETTE[(i + 1) % PALETTE.length]]),
      ghostItems: GHOST_LAYOUT
    }
  },

  computed: {
    mainItems () {
      return MAIN_LAYOUT.map((item, i) => ({
        ...item,
        gradIdx: i % this.gradients.length
      }))
    }
  }
}
</script>

<style scoped>
.confetti-stars {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
