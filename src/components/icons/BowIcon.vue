<!-- A classic hair-bow silhouette: two pointed, twisted ribbon loops pinched by a center knot. -->
<template>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <path id="bow-icon-wing" d="M11.5,9.7 C8,6.5 4.2,4.3 1.6,2.6 C3.1,9 2.1,15.8 2.6,21 C6.1,17.8 9.6,15.8 11.5,14.3 C10.4,12.8 10.4,11.2 11.5,9.7 Z"/>
    </defs>

    <use href="#bow-icon-wing" fill="currentColor"/>
    <use href="#bow-icon-wing" fill="currentColor" transform="scale(-1,1) translate(-24,0)"/>

    <g stroke="#000" stroke-opacity=".22" stroke-width=".6" fill="none" stroke-linecap="round">
      <path d="M9.2,10.3 C7,8.5 5,7 3.3,5.8"/>
      <path d="M9.2,13.5 C6.8,16 4.8,18.3 3.4,20.2"/>
      <path d="M14.8,10.3 C17,8.5 19,7 20.7,5.8"/>
      <path d="M14.8,13.5 C17.2,16 19.2,18.3 20.6,20.2"/>
    </g>

    <rect x="10.3" y="9.6" width="3.4" height="4.8" rx=".9" fill="currentColor"/>
    <rect x="11.15" y="11.2" width="1.7" height="1.6" rx=".3" fill="#fff" fill-opacity=".55"/>
  </svg>
</template>

<script>
export default {
  name: 'BowIcon'
}
</script>
