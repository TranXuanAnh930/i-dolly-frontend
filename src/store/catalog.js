import { defineStore } from 'pinia'

import { ProductsService } from '@/services/products.service'
import { AlbumDetailsService } from '@/services/albumDetails.service'
import { CategoriesService } from '@/services/categories.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { useIdolsStore } from './idols'

// The generic product collection — the Store grid and product detail page
// have their own page-shaped endpoint instead (services/products.service.js's
// getStorePagePublic/getDetailPublic, with genre tags embedded there), so
// this store's only remaining consumers are Cart/Checkout (artistForAlbum/
// colorForRelease, to theme a cart line item) and the manager/admin product
// CRUD pages — neither needs genre tags, so they aren't fetched here.
export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    products: [],
    albumDetails: [],
    // Only exists to populate ManagerProductsPage's category dropdown —
    // fetched on demand, not part of fetchAll.
    categories: [],
    loading: false,
    loaded: false,
    error: null
  }),

  getters: {
    productById: (state) => (id) => state.products.find(product => product.id === id),

    // Only a product with an attached album_details row is actually an
    // "album" — a bare product (e.g. merch with no album/lightstick detail
    // yet attached) isn't one, per docs/api-spec.md §5. Each entry merges
    // the base product (name/price/image/category) with its album detail
    // (release_date/track_count/format/cover_image_url/idol_id/group_id).
    albums (state) {
      return state.albumDetails
        .map(detail => {
          const product = state.products.find(p => p.id === detail.product_id)
          return product ? { ...product, album: detail } : null
        })
        .filter(Boolean)
    },

    // album_details ties to exactly one of idol_id / group_id (never
    // both) — resolve whichever is set against the idols store so a card
    // can show/filter by artist without a second fetch. Merch (lightsticks,
    // hoodies, tote bags) carries no album_details row and no relational
    // link at all — the API gives us nothing but the product name, which
    // is always idol/group-name-prefixed ("Sakura Prism Official
    // Lightstick", "Rin Amane Solo Penlight"), so that's the fallback.
    artistForAlbum: () => (release) => {
      const idolsStore = useIdolsStore()
      const detail = release && release.album
      if (detail) {
        if (detail.group_id) {
          const group = idolsStore.groupById(detail.group_id)
          return group ? { type: 'group', id: group.id, name: group.name } : null
        }
        if (detail.idol_id) {
          const idol = idolsStore.idolById(detail.idol_id)
          return idol ? { type: 'idol', id: idol.id, name: idol.name } : null
        }
        return null
      }
      if (!release || !release.name) return null
      const candidates = [
        ...idolsStore.groups.map(group => ({ type: 'group', id: group.id, name: group.name })),
        ...idolsStore.idols.map(idol => ({ type: 'idol', id: idol.id, name: idol.name }))
      ].sort((a, b) => b.name.length - a.name.length) // longest name first, so e.g. a group name can't shadow a member's own longer name
      const match = candidates.find(candidate => release.name.startsWith(candidate.name))
      return match ? { type: match.type, id: match.id, name: match.name } : null
    },

    // A release's theme color: the real idol/group color when one resolves
    // (see artistForAlbum), otherwise the same palette fallback keyed by
    // the release's own id — shared by ReleaseCard, CartPage and any other
    // view that needs to theme a release consistently.
    colorForRelease () {
      return (release) => {
        const idolsStore = useIdolsStore()
        const artist = this.artistForAlbum(release)
        if (artist && artist.type === 'idol') {
          return idolsStore.colorForIdol(idolsStore.idolById(artist.id) || { id: artist.id })
        }
        if (artist && artist.type === 'group') {
          return idolsStore.colorForGroup({ id: artist.id })
        }
        const hex = paletteColorForId(release.id)
        return { hex, text: contrastTextColor(hex) }
      }
    },

    // A release/product looked up by product id, merged with its album
    // detail when it has one (see `albums` above) — falls back to the bare
    // product for merch with no album_details row. Used by the cart, which
    // only stores { productId, qty } and resolves display data on read.
    releaseById () {
      return (id) => this.albums.find(release => release.id === id) || this.productById(id)
    }
  },

  actions: {
    async fetchAll ({ force = false } = {}) {
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        const [productsRes, albumDetailsRes] = await Promise.all([
          ProductsService.getAllPublic(),
          AlbumDetailsService.getAllPublic()
        ])
        this.products = productsRes.data
        this.albumDetails = albumDetailsRes.data
        this.loaded = true
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchCategories ({ force = false } = {}) {
      if (!force && this.categories.length) return
      try {
        const response = await CategoriesService.getAllPublic()
        this.categories = response.data
      } catch (error) {
        this.error = error.message
      }
    },

    // Manager/admin mutations (ManagerProductsPage) — errors bubble up to
    // the calling form rather than being caught here.
    async createProduct (fields) {
      await ProductsService.create(fields)
      await this.fetchAll({ force: true })
    },
    async updateProduct (id, fields) {
      await ProductsService.update(id, fields)
      await this.fetchAll({ force: true })
    },
    async removeProduct (id) {
      await ProductsService.remove(id)
      await this.fetchAll({ force: true })
    }
  }
})
