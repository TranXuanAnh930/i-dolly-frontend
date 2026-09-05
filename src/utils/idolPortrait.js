const HAIR_STYLES = ['long', 'twin', 'bob', 'pony']
const SKIN_TONES = ['#FFDFC4', '#F7CBA4', '#E8B08A']

// Only rendered when there's no real photo — a stand-in illustration, not
// fabricated bio data, so params are derived from id/color alone.
export function fallbackPortraitFor (idol, accentHex) {
  return {
    hairStyle: HAIR_STYLES[idol.id % HAIR_STYLES.length],
    hairColor: '#3B2A2A',
    eyeColor: accentHex,
    skinTone: SKIN_TONES[idol.id % SKIN_TONES.length]
  }
}
