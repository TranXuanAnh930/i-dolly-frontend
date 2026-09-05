<template>
  <div class="cart-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('cart.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('cart.title') }}</h1>
      </div>
    </section>

    <div class="wrapper content">
      <div v-if="lines.length" class="layout">
        <div class="lines">
          <div v-for="line in lines" :key="line.productId" class="line">
            <div class="line__cover" :style="{ background: `linear-gradient(155deg, ${colorFor(line.product).hex} 0%, rgba(0,0,0,.38) 115%)` }">
              <img v-if="coverFor(line.product)" :src="coverFor(line.product)" :alt="line.product.name" class="line__photo">
              <span v-else class="line__watermark" :style="{ color: colorFor(line.product).text }">{{ line.product.name.charAt(0) }}</span>
            </div>

            <div class="line__info">
              <span class="line__type">{{ line.product.category }}<template v-if="artistFor(line.product)"> &middot; {{ artistFor(line.product).name }}</template></span>
              <span class="line__title">{{ line.product.name }}</span>
              <span class="line__price">{{ $t('cart.unitPrice', { price: `¥${formatNumber(line.product.price)}` }) }}</span>
            </div>

            <div class="line__qty">
              <button type="button" class="qty-btn" @click="updateQty(line.productId, line.qty - 1)" :aria-label="$t('common.decreaseQuantity')">&minus;</button>
              <span class="qty-value">{{ line.qty }}</span>
              <button type="button" class="qty-btn" @click="updateQty(line.productId, line.qty + 1)" :aria-label="$t('common.increaseQuantity')">+</button>
            </div>

            <span class="line__total">&yen;{{ formatNumber(line.product.price * line.qty) }}</span>

            <button type="button" class="line__remove" @click="removeItem(line.productId)" :aria-label="$t('cart.removeItem')">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3 13 13M13 3 3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>

        <div class="summary">
          <h2 class="summary__title">{{ $t('cart.orderSummary') }}</h2>
          <div class="summary__row">
            <span>{{ $t('cart.subtotal', { count: itemCount }) }}</span>
            <span>&yen;{{ formatNumber(subtotal) }}</span>
          </div>
          <div class="summary__row">
            <span>{{ $t('cart.shipping') }}</span>
            <span>{{ $t('cart.free') }}</span>
          </div>
          <div class="summary__row summary__row--total">
            <span>{{ $t('cart.total') }}</span>
            <span>&yen;{{ formatNumber(subtotal) }}</span>
          </div>
          <router-link to="/checkout" class="checkout-btn">{{ $t('cart.checkout') }} &rarr;</router-link>
          <router-link to="/store" class="continue-link">&larr; {{ $t('cart.continueShopping') }}</router-link>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-state__title">{{ $t('cart.emptyTitle') }}</p>
        <p class="empty-state__hint">{{ $t('cart.emptyHint') }}</p>
        <router-link to="/store" class="empty-state__cta">{{ $t('cart.goToStore') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '@/store/cart'
import { useCatalogStore } from '@/store/catalog'
import { useIdolsStore } from '@/store/idols'
import { resolveMediaUrl } from '@/utils/media'
import { formatNumber } from '@/utils/format'

export default {
  name: 'CartPage',

  computed: {
    cart () {
      return useCartStore()
    },
    catalogStore () {
      return useCatalogStore()
    },
    lines () {
      return this.cart.lines
    },
    itemCount () {
      return this.cart.itemCount
    },
    subtotal () {
      return this.cart.subtotal
    }
  },

  created () {
    this.catalogStore.fetchAll()
    // catalogStore.artistForAlbum/colorForRelease resolve against the idols
    // store's idols/groups — never loaded on this page otherwise.
    useIdolsStore().fetchAll()
  },

  methods: {
    formatNumber,
    artistFor (product) {
      return this.catalogStore.artistForAlbum(product)
    },
    colorFor (product) {
      return this.catalogStore.colorForRelease(product)
    },
    coverFor (product) {
      const album = product.album || {}
      return resolveMediaUrl(album.cover_image_url || product.image_url)
    },
    updateQty (productId, qty) {
      this.cart.updateQty(productId, qty)
    },
    removeItem (productId) {
      this.cart.removeItem(productId)
    }
  }
}
</script>

<style lang="scss" scoped>
.cart-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 40px 0 40px;
}

.hero__eyebrow {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: $color-brand;
  margin-bottom: 8px;
}

.hero__title {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(30px, 5vw, 44px);
  color: $color-brand;
}

.content {
  padding-bottom: 90px;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  align-items: start;

  @include media_tablet {
    grid-template-columns: 1fr;
  }
}

.lines {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.line {
  background: $color-white;
  border-radius: 16px;
  padding: 12px;
  display: grid;
  grid-template-columns: 64px 1fr auto auto auto;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);

  @include media_mobile {
    grid-template-columns: 56px 1fr;
    grid-template-areas:
      "cover info"
      "cover qty"
      "cover total";
    row-gap: 8px;
  }
}

.line__cover {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  flex: none;

  @include media_mobile {
    grid-area: cover;
    width: 56px;
    height: 56px;
  }
}

.line__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.line__watermark {
  position: absolute;
  right: -6px;
  bottom: -14px;
  font-family: $font-title;
  font-weight: 900;
  font-size: 56px;
  line-height: 1;
  opacity: .18;
}

.line__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  @include media_mobile {
    grid-area: info;
  }
}

.line__type {
  font-family: $font-content;
  font-weight: 700;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: .03em;
  color: $color-gray-400;
}

.line__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
}

.line__price {
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-500;
}

.line__qty {
  display: flex;
  align-items: center;
  gap: 10px;

  @include media_mobile {
    grid-area: qty;
  }
}

.qty-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid $color-line;
  background: $color-white;
  color: $color-ink;
  font-family: $font-content;
  font-weight: 700;
  font-size: 15px;
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
  font-size: 14px;
  min-width: 16px;
  text-align: center;
}

.line__total {
  font-family: $font-content;
  font-weight: 900;
  font-size: 14px;
  color: $color-ink;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;

  @include media_mobile {
    grid-area: total;
  }
}

.line__remove {
  border: none;
  background: none;
  color: $color-gray-300;
  cursor: pointer;
  padding: 6px;
  display: flex;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: $color-error;
  }

  @include media_mobile {
    grid-area: total;
    justify-self: end;
  }
}

.summary {
  background: $color-white;
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 20px;
}

.summary__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 20px;
  color: $color-ink;
  margin-bottom: 4px;
}

.summary__row {
  display: flex;
  justify-content: space-between;
  font-family: $font-content;
  font-size: 13.5px;
  color: $color-font-main;

  &--total {
    padding-top: 10px;
    margin-top: 4px;
    border-top: 1px solid $color-line;
    font-weight: 900;
    font-size: 16px;
    color: $color-ink;
  }
}

.checkout-btn {
  margin-top: 8px;
  border: none;
  border-radius: 999px;
  padding: 14px;
  background: $color-brand;
  color: $color-white;
  text-align: center;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

  &:hover {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }
}

.continue-link {
  text-align: center;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;
  text-decoration: none;

  &:hover {
    color: $color-brand;
  }
}

.empty-state {
  text-align: center;
  padding: 70px 20px;
  background: $color-white;
  border-radius: 20px;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
}

.empty-state__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  color: $color-ink;
}

.empty-state__hint {
  margin-top: 6px;
  font-family: $font-content;
  font-size: 13px;
  color: $color-gray-500;
}

.empty-state__cta {
  display: inline-block;
  margin-top: 18px;
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
  background: $color-brand;
  color: $color-white;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;

  &:hover {
    background: $color-brand-deep;
  }
}
</style>
