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
          <p class="resale-cap" v-if="resaleCap">{{ $t('store.resaleCapLabel', { count: resaleCap }) }}</p>

          <div class="purchase-panel">
            <span class="price-block">
              <span class="price">&yen;{{ formattedPrice }}</span>
              <span class="price-tax">{{ $t('store.taxIncluded', { price: formattedTaxedPrice }) }}</span>
            </span>

            <div class="purchase-actions">
              <div class="qty-control" v-if="stockStatus !== 'out' && !capReached">
                <button type="button" class="qty-btn" @click="qty = Math.max(1, qty - 1)" :aria-label="$t('common.decreaseQuantity')">&minus;</button>
                <span class="qty-value">{{ qty }}</span>
                <button type="button" class="qty-btn" @click="increaseQty" :aria-label="$t('common.increaseQuantity')">+</button>
              </div>
              <button type="button" class="add-to-cart-btn" :class="{ 'is-added': justAdded }" :disabled="stockStatus === 'out' || capReached" @click="addToCart">
                {{ justAdded ? $t('store.addedToCart') : capReached ? $t('store.resaleCapReached') : $t('store.addToCart') }}
              </button>
            </div>
          </div>
          <p class="resale-cap resale-cap--reached" v-if="capReached">{{ $t('store.resaleCapReachedHint') }}</p>
        </div>
      </div>

      <section class="recommendations" v-if="recommendations.length">
        <h2 class="recommendations__title">{{ $t('productDetail.recommendations') }}</h2>
        <div class="recommendations__grid">
          <ReleaseCard v-for="item in recommendations" :key="item.id" :release="item"/>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">{{ $t('productDetail.qa') }}</h2>
        <div class="section-rule"></div>

        <dl class="qa-card">
          <div class="qa-pair">
            <dt>{{ $t('productDetail.qaShippingQ') }}</dt>
            <dd>{{ $t('productDetail.qaShippingA') }}</dd>
          </div>
          <div class="qa-pair">
            <dt>{{ $t('productDetail.qaReturnQ') }}</dt>
            <dd>{{ $t('productDetail.qaReturnA') }}</dd>
          </div>
          <div class="qa-pair" v-if="resaleCap">
            <dt>{{ $t('productDetail.qaCapQ') }}</dt>
            <dd>{{ $t('productDetail.qaCapA') }}</dd>
          </div>
          <div class="qa-pair">
            <dt>{{ $t('productDetail.qaConditionQ') }}</dt>
            <dd>{{ $t('productDetail.qaConditionA') }}</dd>
          </div>
        </dl>
      </section>
    </div>
  </div>

  <NotFound v-else/>
</template>

<script>
import { parseISO } from 'date-fns'

import { ProductsService } from '@/services/store/products.service'
import { useCartStore } from '@/store/store/cart'
import { useOrdersStore } from '@/store/store/orders'
import { useToastStore } from '@/store/toast'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { resolveMediaUrl } from '@/utils/media'
import { formatDate, formatNumber } from '@/utils/format'
import { stockStatus } from '@/utils/stock'
import { withTax } from '@/utils/tax'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'
import ReleaseCard from '@/components/ReleaseCard.vue'
import NotFound from '@/pages/static/NotFound.vue'

export default {
  name: 'ProductDetailPage',

  components: { UiPageLoader, ReleaseCard, NotFound },

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      product: null,
      recommendations: [],
      loading: true,
      justAdded: false,
      qty: 1
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
    },
    // null when this product isn't resale-capped, otherwise the max units
    // a fan may ever hold across every order they've placed (see
    // order_service.checkout / product_service._build_product_cards on the
    // backend — this mirrors that exact number, not a separate guess).
    resaleCap () {
      return this.product ? this.product.resale_cap_quantity : null
    },
    // Sum of this product's quantity across every order this fan has ever
    // placed, regardless of status — matches the backend's own past_qty
    // query exactly (order_service.checkout doesn't filter by status
    // either), so this can't be more lenient than what checkout will
    // actually accept.
    pastPurchasedQty () {
      if (!this.product) return 0
      return useOrdersStore().items.reduce((sum, order) => {
        const line = order.items.find(item => item.product_id === this.product.id)
        return sum + (line ? line.quantity : 0)
      }, 0)
    },
    // Already sitting in the cart from a previous visit — counts toward
    // the cap too, since it'll be part of the same line by the time
    // checkout runs.
    cartQtyForProduct () {
      if (!this.product) return 0
      const line = useCartStore().lines.find(l => l.productId === this.product.id)
      return line ? line.qty : 0
    },
    // How many more units this fan is still allowed to add, combining the
    // resale cap (if any) with remaining stock — whichever is tighter.
    maxAddable () {
      if (!this.product) return 0
      const stockLimit = this.product.quantity
      if (this.resaleCap === null) return stockLimit
      const capLimit = Math.max(0, this.resaleCap - this.pastPurchasedQty - this.cartQtyForProduct)
      return Math.min(stockLimit, capLimit)
    },
    capReached () {
      return this.resaleCap !== null && this.maxAddable <= 0
    },
    // Which limit is actually stopping the qty stepper right now, so the
    // error toast on + names the real reason instead of a generic message.
    capIsBindingLimit () {
      if (!this.product || this.resaleCap === null) return false
      const capLimit = Math.max(0, this.resaleCap - this.pastPurchasedQty - this.cartQtyForProduct)
      return capLimit <= this.product.quantity
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
        this.qty = 1
        this.fetchPage()
      }
    }
  },

  created () {
    // A no-op for guests/non-fan roles (see ordersStore.fetchAll) — the
    // resale cap only ever needs to look at a real fan's own order
    // history, which is already loaded by the time this page mounts on
    // any normal navigation (Header's own fetch); this just covers a
    // direct/refresh landing straight on this page.
    useOrdersStore().fetchAll()
  },

  beforeUnmount () {
    clearTimeout(this.addedTimer)
  },

  methods: {
    // Silently clamping the stepper at maxAddable leaves the user guessing
    // why + stopped responding — surface why instead of just refusing.
    increaseQty () {
      if (this.qty >= this.maxAddable) {
        const message = this.capIsBindingLimit
          ? this.$t('store.resaleCapLimitReached', { count: this.resaleCap })
          : this.$t('store.lowStock', { count: this.product.quantity })
        useToastStore().add({ type: 'error', message })
        return
      }
      this.qty += 1
    },
    async fetchPage () {
      this.loading = true
      try {
        const response = await ProductsService.getDetailPublic(this.id)
        this.product = response.data.product
        this.recommendations = response.data.recommendations
      } catch {
        this.product = null
      } finally {
        this.loading = false
      }
    },
    async addToCart () {
      // Defense in depth — the qty stepper already can't be pushed past
      // maxAddable, but re-check here too in case product/order data
      // changed underneath the user (another tab, a slow-loading order
      // history) between mount and this click, so the backend's own
      // ResaleCapExceededError is never the first they hear of it.
      if (this.capReached || this.qty > this.maxAddable) {
        useToastStore().add({ type: 'error', message: this.$t('store.resaleCapReached') })
        return
      }
      try {
        await useCartStore().addItem(this.product.id, this.qty)
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

.resale-cap {
  margin-top: 6px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12.5px;
  color: $color-gray-500;

  &--reached {
    margin-top: 10px;
    color: $color-error;
  }
}

.purchase-panel {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid $color-line;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.purchase-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1.5px solid $color-line;
  background: $color-white;
  color: $color-ink;
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: $color-brand;
    color: $color-brand;
  }
}

.qty-value {
  font-family: $font-content;
  font-weight: 700;
  font-size: 15px;
  min-width: 16px;
  text-align: center;
  font-variant-numeric: tabular-nums;
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

.block {
  margin-top: 48px;
}

.block__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 24px;
  color: $color-ink;
}

.section-rule {
  margin-top: 8px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, $color-brand, #f2b705, #1f8fd6, #b6379c, #1fa876);
}

.qa-card {
  margin-top: 16px;
  background: $color-white;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qa-pair dt {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13.5px;
  color: $color-ink;
}

.qa-pair dd {
  margin-top: 4px;
  font-family: $font-content;
  font-size: 13.5px;
  line-height: 1.5;
  color: $color-font-main;
}

</style>
