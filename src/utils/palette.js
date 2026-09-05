/**
 * Fallback color for entities the real API doesn't theme itself (groups,
 * concerts — only individual idols carry a color_id). Reuses the same six
 * hues the rest of the site's gradient/section-rule already draws from, so
 * an unthemed card still reads as "on brand" instead of falling back to
 * plain gray. Deterministic per id, not random, so a card's color stays
 * stable across reloads.
 */
const PALETTE = ['#E4007F', '#F2B705', '#1F8FD6', '#B6379C', '#1FA876', '#E8492C']

export function paletteColorForId (id) {
  const n = typeof id === 'number' ? id : String(id).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return PALETTE[Math.abs(n) % PALETTE.length]
}

/**
 * Real idol_colors hex values are light pastels (e.g. #FFB3D9), unlike the
 * old mock palette's saturated hues that always safely paired with white
 * text — pick black or white based on relative luminance so text stays
 * legible against whatever color comes back.
 */
export function contrastTextColor (hex) {
  const clean = String(hex || '').replace('#', '')
  if (clean.length !== 6) return '#ffffff'

  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.6 ? '#1E1420' : '#ffffff'
}
