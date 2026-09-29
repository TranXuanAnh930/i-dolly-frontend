const HAIR_STYLES = ['long', 'twin', 'bob', 'pony']
const SKIN_TONES = ['#FFDFC4', '#F7CBA4', '#E8B08A']

// Ids are UUID strings, so `id % n` is NaN (and indexes to undefined) —
// hash the string instead to get a stable, non-negative index per idol.
function indexFor (id, length) {
  const str = String(id)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash % length
}

// Only rendered when there's no real photo — a stand-in illustration, not
// fabricated bio data, so params are derived from id/color alone.
export function fallbackPortraitFor (idol, accentHex) {
  return {
    hairStyle: HAIR_STYLES[indexFor(idol.id, HAIR_STYLES.length)],
    hairColor: '#3B2A2A',
    eyeColor: accentHex,
    skinTone: SKIN_TONES[indexFor(idol.id, SKIN_TONES.length)]
  }
}
