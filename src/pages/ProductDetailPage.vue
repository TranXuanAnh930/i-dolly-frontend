<template>
  <UiPageLoader v-if="loading"/>

  <div v-else-if="product" class="product-detail-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <router-link to="/store" class="back-link">&larr; {{ $t('productDetail.backToStore') }}</router-link>
      </div>
    </section>

    <div class="wrapper content">
      <div class="layout">
        <div class="cover" :style="!coverPhoto ? { background: `linear-gradient(155deg, ${color.hex} 0%, rgba(0,0,0,.38) 115%)` } : null">
          <img v-if="coverPhoto" :src="coverPhoto" :alt="product.name" class="cover__photo">
          <span v-else class="cover__watermark" :style="{ color: color.text }">{{ product.name.charAt(0) }}</span>
          <span class="cover__type">{{ product.category }}</span>
        </div>

        <div class="info">
          <span class="artist" v-if="artist" :style="{ color: color.hex }">{{ artist.name }}</span>
          <h1 class="title">{{ product.name }}</h1>
          <p class="meta" v-if="metaLine">{{ metaLine }}</p>
          <div class="genre-row" v-if="genres.length">
            <span class="genre-chip" v-for="genre in genres" :key="genre.id">{{ genre.name }}</span>
          </div>
          <p class="blurb">{{ product.description }}</p>

          <p class="stock" :class="`stock--${stockStatus}`">
            <span class="stock__dot"></span>
            {{ stockStatus === 'out' ? $t('store.outOfStock') : stockStatus === 'low' ? $t('store.lowStock', { count: product.quantity }) : $t('store.inStock') }}
          </p>

          <div class="purchase-panel">
            <span class="price-block">
              <span class="price">&yen;{{ formattedPrice }}</span>
              <span class="price-tax">{{ $t('store.taxIncluded', { price: formattedTaxedPrice }) }}</span>
            </span>
            <button type="button" class="add-to-cart-btn" :class="{ 'is-added': justAdded }" :disabled="stockStatus === 'out'" @click="addToCart">
              {{ justAdded ? $t('store.addedToCart') : $t('store.addToCart') }}
            </button>
          </div>
        </div>
      </div>

      <section class="recommendations" v-if="recommendations.length">
        <h2 class="recommendations__title">{{ $t('productDetail.recommendations') }}</h2>
        <div class="recommendations__grid">
          <ReleaseCard v-for="item in recommendations" :key="item.id" :release="item"/>
        </div>
      </section>
    </div>
  </div>

  <div v-else class="not-found">
    <p class="not-found__title">{{ error || $t('productDetail.notFound') }}</p>
    <router-link to="/store" class="not-found__link">&larr; {{ $t('productDetail.backToStore') }}</router-link>
  </div>
</template>

<script>
import { parseISO } from 'date-fns'

import { ProductsService } from '@/services/products.service'
import { useCartStore } from '@/store/cart'
import { useToastStore } from '@/store/toast'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { resolveMediaUrl } from '@/utils/media'
import { formatDate, formatNumber } from '@/utils/format'
import { stockStatus } from '@/utils/stock'
import { withTax } from '@/utils/tax'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'
import ReleaseCard from '@/components/ReleaseCard.vue'

export default {
  name: 'ProductDetailPage',

  components: { UiPageLoader, ReleaseCard },

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      product: null,
      recommendations: [],
      loading: true,
      error: null,
      justAdded: false
    }
  },

  computed: {
    artist () {
      return this.product ? this.product.artist : null
    },
    // The artist's real color (only ever set for an idol with one) when
    // resolved, otherwise the same stable palette fallback keyed by the
    // product's own id.
    color () {
      if (!this.product) return null
      const artistHex = this.artist && this.artist.color_hex
      const hex = artistHex || paletteColorForId(this.product.id)
      return { hex, text: contrastTextColor(hex) }
    },
    coverPhoto () {
      if (!this.product) return null
      const album = this.product.album || {}
      return resolveMediaUrl(album.cover_image_url || this.product.image_url)
    },
    metaLine () {
      if (!this.product) return ''
      const album = this.product.album || {}
      const parts = []
      if (album.track_count) {
        const key = album.track_count === 1 ? 'store.trackCountOne' : 'store.trackCountOther'
        parts.push(this.$t(key, { count: album.track_count }))
      }
      if (album.release_date) parts.push(formatDate(parseISO(album.release_date), 'MMM d, yyyy'))
      return parts.join(' · ')
    },
    formattedPrice () {
      return this.product ? formatNumber(this.product.price) : ''
    },
    formattedTaxedPrice () {
      return this.product ? formatNumber(withTax(this.product.price)) : ''
    },
    stockStatus () {
      return this.product ? stockStatus(this.product.quantity) : 'in'
    },
    genres () {
      return this.product ? this.product.genres : []
    }
  },

  watch: {
    product (product) {
      if (!product) return
      document.title = `${product.name} | I-Dolly`
    },
    id: {
      immediate: true,
      handler () {
        this.fetchPage()
      }
    }
  },

  beforeUnmount () {
    clearTimeout(this.addedTimer)
  },

  methods: {
    async fetchPage () {
      this.loading = true
      this.error = null
      try {
        const response = await ProductsService.getDetailPublic(this.id)
        this.product = response.data.product
        this.recommendations = response.data.recommendations
      } catch (error) {
        this.product = null
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    async addToCart () {
      try {
        await useCartStore().addItem(this.product.id)
      } catch (error) {
        useToastStore().add({ type: 'error', message: error.message })
        return
      }
      useToastStore().add({ type: 'success', message: this.$t('cart.itemAdded', { name: this.product.name }) })
      this.justAdded = true
      clearTimeout(this.addedTimer)
      this.addedTimer = setTimeout(() => { this.justAdded = false }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
.product-detail-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 24px 0 20px;
}

.back-link {
  display: inline-block;
  color: $color-gray-500;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;

  &:hover {
    color: $color-brand;
  }
}

.content {
  padding-bottom: 90px;
}

.layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 32px;

  @include media_tablet {
    grid-template-columns: 1fr;
    max-width: 420px;
    margin: 0 auto;
  }
}

.cover {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
}

.cover__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover__watermark {
  position: absolute;
  right: -14px;
  bottom: -40px;
  font-family: $font-title;
  font-weight: 900;
  font-size: 168px;
  line-height: 1;
  opacity: .18;
  user-select: none;
}

.cover__type {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(255, 255, 255, .85);
  border-radius: 999px;
  padding: 6px 14px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  color: $color-ink;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.artist {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.title {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(26px, 4vw, 38px);
  color: $color-ink;
  line-height: 1.1;
}

.meta {
  font-family: $font-content;
  font-size: 13.5px;
  color: $color-gray-500;
}

.genre-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.genre-chip {
  border-radius: 999px;
  padding: 4px 12px;
  background: $color-brand-tint-2;
  color: $color-brand-deep;
  font-family: $font-content;
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: .02em;
}

.blurb {
  margin-top: 10px;
  font-family: $font-content;
  font-size: 14.5px;
  line-height: 1.6;
  color: $color-font-main;
}

.stock {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;

  &--in {
    color: #147a52;
    .stock__dot { background: #1fa876; }
  }

  &--low {
    color: #b06a00;
    .stock__dot { background: #f2b705; }
  }

  &--out {
    color: $color-error;
    .stock__dot { background: $color-error; }
  }
}

.stock__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
}

.purchase-panel {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid $color-line;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.price-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price {
  font-family: $font-content;
  font-weight: 900;
  font-size: 24px;
  color: $color-ink;
  font-variant-numeric: tabular-nums;
}

.price-tax {
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-500;
  font-variant-numeric: tabular-nums;
}

.add-to-cart-btn {
  border: none;
  border-radius: 999px;
  padding: 13px 28px;
  background: $color-brand;
  color: $color-white;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14.5px;
  white-space: nowrap;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

  &:hover {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }

  &.is-added {
    background: #1fa876;
  }

  &:disabled {
    background: $color-gray-200;
    color: $color-gray-500;
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
}

.recommendations {
  margin-top: 48px;
}

.recommendations__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 24px;
  color: $color-ink;
  margin-bottom: 18px;
}

.recommendations__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.not-found {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 20px;
  text-align: center;
}

.not-found__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  color: $color-ink;
}

.not-found__link {
  color: $color-brand;
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
