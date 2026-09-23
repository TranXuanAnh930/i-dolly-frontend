<template>
  <router-link :to="`/products/${release.id}`" class="release-card">
    <div class="cover" :style="!coverPhoto ? { background: `linear-gradient(155deg, ${color.hex} 0%, rgba(0,0,0,.38) 115%)` } : null">
      <img v-if="coverPhoto" :src="coverPhoto" :alt="release.name" class="cover__photo">
      <span v-else class="cover__watermark" :style="{ color: color.text }">{{ release.name.charAt(0) }}</span>
      <span class="cover__type">{{ release.category }}</span>
      <span v-if="stockStatus !== 'in'" class="cover__stock" :class="`cover__stock--${stockStatus}`">
        {{ stockStatus === 'out' ? $t('store.outOfStock') : $t('store.lowStock', { count: release.quantity }) }}
      </span>
    </div>

    <div class="body">
      <span class="artist" v-if="artist" :style="{ color: color.hex }">{{ artist.name }}</span>
      <h3 class="title">{{ release.name }}</h3>
      <p class="meta" v-if="metaLine">{{ metaLine }}</p>
      <div class="genre-row" v-if="genres.length">
        <span class="genre-chip" v-for="genre in genres" :key="genre.id">{{ genre.name }}</span>
      </div>
      <p class="blurb">{{ release.description }}</p>

      <div class="footer">
        <span class="price-block">
          <span class="price">&yen;{{ formattedPrice }}</span>
          <span class="price-tax">{{ $t('store.taxIncluded', { price: formattedTaxedPrice }) }}</span>
        </span>
        <span class="details-link">{{ $t('store.viewDetails') }} &rarr;</span>
      </div>
    </div>
  </router-link>
</template>

<script>
import { parseISO } from 'date-fns'

import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { resolveMediaUrl } from '@/utils/media'
import { formatDate, formatNumber } from '@/utils/format'
import { stockStatus } from '@/utils/stock'
import { withTax } from '@/utils/tax'

export default {
  name: 'ReleaseCard',

  props: {
    // Page-shaped (ProductCard from the backend): album info, genres, and
    // the resolved artist all embedded, so this card never needs a store
    // lookup.
    release: { type: Object, required: true }
  },

  computed: {
    artist () {
      return this.release.artist
    },
    // The artist's real color (only ever set for an idol with one) when
    // resolved, otherwise the same stable palette fallback keyed by the
    // release's own id.
    color () {
      const artistHex = this.release.artist && this.release.artist.color_hex
      const hex = artistHex || paletteColorForId(this.release.id)
      return { hex, text: contrastTextColor(hex) }
    },
    // One source of truth for a release's cover: the product's own
    // image_url. album.cover_image_url used to take priority here, but
    // nothing in this app ever lets the two differ intentionally — they're
    // set from the same upload at creation (scripts/seed.py) — and nothing
    // keeps them in sync after a product's image is replaced, so preferring
    // the album copy meant a re-uploaded cover could look fine on the
    // manager's own product table (reads image_url directly) while still
    // showing the old file everywhere a fan actually sees it.
    coverPhoto () {
      return resolveMediaUrl(this.release.image_url)
    },
    metaLine () {
      const album = this.release.album || {}
      const parts = []
      if (album.track_count) {
        const key = album.track_count === 1 ? 'store.trackCountOne' : 'store.trackCountOther'
        parts.push(this.$t(key, { count: album.track_count }))
      }
      if (album.release_date) parts.push(formatDate(parseISO(album.release_date), 'MMM d, yyyy'))
      return parts.join(' · ')
    },
    formattedPrice () {
      return formatNumber(this.release.price)
    },
    formattedTaxedPrice () {
      return formatNumber(withTax(this.release.price))
    },
    stockStatus () {
      return stockStatus(this.release.quantity)
    },
    genres () {
      return this.release.genres || []
    }
  }
}
</script>

<style lang="scss" scoped>
.release-card {
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

.cover {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.cover__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover__watermark {
  position: absolute;
  right: -10px;
  bottom: -30px;
  font-family: $font-title;
  font-weight: 900;
  font-size: 128px;
  line-height: 1;
  opacity: .18;
  user-select: none;
}

.cover__type {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, .85);
  border-radius: 999px;
  padding: 5px 12px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  color: $color-ink;
}

.cover__stock {
  position: absolute;
  top: 12px;
  right: 12px;
  border-radius: 999px;
  padding: 5px 12px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;

  &--out {
    background: rgba(255, 255, 255, .9);
    color: $color-error;
  }

  &--low {
    background: rgba(255, 255, 255, .9);
    color: #b06a00;
  }
}

.body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  flex: 1;
}

.artist {
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  color: $color-ink;
}

.meta {
  font-family: $font-content;
  font-size: 12.5px;
  color: $color-gray-500;
}

.genre-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.genre-chip {
  border-radius: 999px;
  padding: 3px 10px;
  background: $color-brand-tint-2;
  color: $color-brand-deep;
  font-family: $font-content;
  font-weight: 700;
  font-size: 10.5px;
  letter-spacing: .02em;
}

.blurb {
  margin-top: 4px;
  font-family: $font-content;
  font-size: 13px;
  line-height: 1.5;
  color: $color-font-main;
}

.footer {
  margin-top: auto;
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid $color-line;
}

.price-block {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.price {
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
  font-variant-numeric: tabular-nums;
}

.price-tax {
  font-family: $font-content;
  font-size: 10.5px;
  color: $color-gray-400;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.details-link {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12.5px;
  color: $color-brand;
  white-space: nowrap;
}
</style>
