<!--
  A simplified, illustrative arena diagram (stage + two fanning seat zones) —
  not tied to a real venue's actual layout, same as the "image only" seat
  charts real ticket sites publish before seats go on sale.
-->
<template>
  <figure class="venue-map">
    <svg viewBox="0 0 400 300" role="img" font-family="'M PLUS 1', sans-serif" aria-label="Illustrative seating diagram: two ticket zones fanning out from the stage.">
      <rect x="8" y="8" width="384" height="284" rx="14" fill="none" stroke="#dfeaf6" stroke-width="2"/>

      <rect x="120" y="26" width="160" height="46" rx="8" fill="#8a92a6"/>
      <text x="200" y="54" text-anchor="middle" font-weight="700" font-size="15" fill="#ffffff">STAGE</text>

      <polygon points="132,80 268,80 288,158 112,158" fill="#F2B705"/>
      <text x="200" y="110" text-anchor="middle" font-weight="700" font-size="13" fill="#ffffff">Premium</text>
      <text x="200" y="128" text-anchor="middle" font-weight="600" font-size="11" fill="rgba(255,255,255,.85)">seats</text>

      <polygon points="70,168 330,168 378,266 22,266" fill="#1F8FD6"/>
      <text x="200" y="212" text-anchor="middle" font-weight="700" font-size="13" fill="#ffffff">General</text>
      <text x="200" y="230" text-anchor="middle" font-weight="600" font-size="11" fill="rgba(255,255,255,.85)">admission</text>
    </svg>
    <figcaption class="venue-map__caption">Illustrative only — actual seating varies by venue and show.</figcaption>
  </figure>
</template>

<script>
export default {
  name: 'VenueSeatMap'
}
</script>

<style lang="scss" scoped>
.venue-map {
  background: $color-white;
  border-radius: 16px;
  padding: 16px;
}

.venue-map svg {
  display: block;
  width: 100%;
  height: auto;
}

.venue-map__caption {
  margin-top: 10px;
  font-family: $font-content;
  font-size: 11.5px;
  color: $color-gray-400;
  text-align: center;
}
</style>
