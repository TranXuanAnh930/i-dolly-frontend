<!--
  A simplified, illustrative arena diagram (stage + three fanning seat zones) —
  not tied to a real venue's actual layout, same as the "image only" seat
  charts real ticket sites publish before seats go on sale.
-->
<template>
  <figure class="venue-map">
    <svg viewBox="0 0 400 320" role="img" font-family="'M PLUS 1', sans-serif" aria-label="Illustrative seating diagram: VIP, Premium and Regular zones fanning out from the stage.">
      <defs>
        <filter id="venueMapShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0b1220" flood-opacity=".18"/>
        </filter>
      </defs>

      <rect x="8" y="8" width="384" height="304" rx="18" fill="none" stroke="#dfeaf6" stroke-width="2"/>

      <rect x="130" y="24" width="140" height="42" rx="10" fill="#8a92a6" filter="url(#venueMapShadow)"/>
      <text x="200" y="50" text-anchor="middle" font-weight="700" font-size="13" letter-spacing="1.5" fill="#ffffff">STAGE</text>

      <polygon points="150,80 250,80 263,122 137,122" fill="#F2B705" filter="url(#venueMapShadow)"/>
      <text x="200" y="105" text-anchor="middle" font-weight="700" font-size="13" fill="#ffffff">VIP</text>

      <polygon points="118,132 282,132 307,194 93,194" fill="#B6379C" filter="url(#venueMapShadow)"/>
      <text x="200" y="167" text-anchor="middle" font-weight="700" font-size="13" fill="#ffffff">Premium</text>

      <polygon points="66,204 334,204 380,302 20,302" fill="#1F8FD6" filter="url(#venueMapShadow)"/>
      <text x="200" y="257" text-anchor="middle" font-weight="700" font-size="13" fill="#ffffff">Regular</text>
    </svg>

    <div class="venue-map__legend">
      <span class="legend-item"><span class="legend-swatch" style="background:#F2B705"></span>VIP</span>
      <span class="legend-item"><span class="legend-swatch" style="background:#B6379C"></span>Premium</span>
      <span class="legend-item"><span class="legend-swatch" style="background:#1F8FD6"></span>Regular</span>
    </div>

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
  margin-left: auto;
  margin-right: auto;
}

.venue-map svg {
  display: block;
  width: 100%;
  height: auto;
}

.venue-map__legend {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  color: $color-font-main;
}

.legend-swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}

.venue-map__caption {
  margin-top: 10px;
  font-family: $font-content;
  font-size: 11.5px;
  color: $color-gray-400;
  text-align: center;
}
</style>
