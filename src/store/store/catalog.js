import { defineStore } from 'pinia'

import { ProductsService } from '@/services/store/products.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'

// Module-level, not store state — an in-flight promise isn't reactive data,
// and Pinia is a singleton per app, so there's only ever one fetch to share.
let inFlight = null

// The generic product collection — every customer-facing page and the
// manager/admin settings pages all have their own page-shaped endpoint
// instead (services/products.service.js's getStorePagePublic/getDetailPublic/
// getManagerProductsPagePublic/getManagerProductFormPagePublic, etc.), so this
// store's only remaining consumers are Cart/Checkout/OrderDetails resolving a
// cart line's product and theming it.
//
// Backed by the same /products/store-page bundle the Store grid uses. That
// endpoint returns every product (it applies no filtering) with its album row,
// its resolved artist and that artist's color already embedded — so one
// request replaces the products/all + album_details/all pair this used to
// merge client-side, and the artist/color resolution no longer needs the idols
// store loaded alongside it.
export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    products: [],
    loading: false,
    loaded: false,
    error: null
  }),

  getters: {
    productById: (state) => (id) => state.products.find(product => product.id === id),

    // Only a product with an attached album_details row is actually an
    // "album" — a bare product (e.g. merch with no album detail row) isn't
    // one, per docs/api-spec.md §5.
    albums: (state) => state.products.filter(product => product.album),

    // Resolved server-side (product_service._build_product_cards): a real
    // idol/group FK off album_details/merch_details when there is one,
    // otherwise the longest-name-first prefix match on the product name that
    // plain merch with neither detail row needs. null when nothing matches.
    artistForAlbum: () => (release) => (release && release.artist) || null,

    // A release's theme color: the artist's own color when the API resolved
    // one (only idols have one — groups always come back null), otherwise the
    // stable palette fallback. Keyed by the artist when one resolved, so every
    // release by that artist themes alike, and by the release itself when none
    // did.
    colorForRelease () {
      return (release) => {
        const artist = this.artistForAlbum(release)
        const hex = (artist && artist.color_hex) || paletteColorForId(artist ? artist.id : release.id)
        return { hex, text: contrastTextColor(hex) }
      }
    },

    // Every product already carries its album inline, so this is a plain id
    // lookup — kept as its own getter because the cart resolves lines by it.
    releaseById () {
      return (id) => this.productById(id)
    }
  },

  actions: {
    fetchAll ({ force = false } = {}) {
      if (this.loaded && !force) return Promise.resolve()
      // Header and the cart/checkout/order pages all call this, routinely in
      // the same tick — they share the in-flight request rather than each
      // firing their own. The `loaded` guard above only catches callers that
      // arrive once a fetch has already finished.
      if (inFlight) return inFlight

      this.loading = true
      this.error = null
      inFlight = ProductsService.getStorePagePublic()
        .then(response => {
          this.products = response.data.products
          this.loaded = true
        })
        .catch(error => {
          // An empty catalog 404s rather than returning an empty list (this
          // API's convention for every collection — see base.service.js),
          // which isn't an error state for this store.
          if (error.status === 404) {
            this.products = []
            this.loaded = true
          } else {
            this.error = error.message
          }
        })
        .finally(() => {
          this.loading = false
          inFlight = null
        })

      return inFlight
    }
  }
})
