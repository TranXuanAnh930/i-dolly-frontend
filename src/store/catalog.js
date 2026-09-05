import { defineStore } from 'pinia'

import { ProductsService } from '@/services/products.service'
import { AlbumDetailsService } from '@/services/albumDetails.service'
import { GenresService } from '@/services/genres.service'
import { CategoriesService } from '@/services/categories.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { createQueue } from '@/utils/concurrencyQueue'
import { useIdolsStore } from './idols'

// The Store grid can mount 20+ ReleaseCards at once, each requesting its
// own product's genres (no bulk route exists) — cap how many of those run
// concurrently so the page doesn't trip the backend's rate limiter.
const enqueueGenresFetch = createQueue(4)

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    products: [],
    albumDetails: [],
    genres: [],
    // Genre tags are scoped to one product (no `/all` route) — fetched
    // lazily per release card and cached here by product id.
    genresByProduct: {},
    // Only exists to populate ManagerProductsPage's category dropdown —
    // fetched on demand, not part of fetchAll.
    categories: [],
    loading: false,
    loaded: false,
    error: null
  }),

  getters: {
    productById: (state) => (id) => state.products.find(product => product.id === id),

    genresForRelease: (state) => (productId) => {
      const links = state.genresByProduct[productId] || []
      return links.map(link => state.genres.find(genre => genre.id === link.genre_id)).filter(Boolean)
    },

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

    // Every storefront product — albums/singles/EPs merged with their album
    // detail (same shape as `albums`), plus plain merch (lightsticks, tote
    // bags, etc.) with no album_details row, unmerged. This is what the
    // Store page renders; `albums` stays around for call sites that
    // specifically want only the album-attached subset.
    storeItems (state) {
      return state.products.map(product => {
        const detail = state.albumDetails.find(d => d.product_id === product.id)
        return detail ? { ...product, album: detail } : product
      })
    },

    // album_details ties to exactly one of idol_id / group_id (never
    // both) — resolve whichever is set against the idols store so a card
    // can show/filter by artist without a second fetch.
    artistForAlbum: () => (album) => {
      const idolsStore = useIdolsStore()
      const detail = album && album.album
      if (!detail) return null
      if (detail.group_id) {
        const group = idolsStore.groupById(detail.group_id)
        return group ? { type: 'group', id: group.id, name: group.name } : null
      }
      if (detail.idol_id) {
        const idol = idolsStore.idolById(detail.idol_id)
        return idol ? { type: 'idol', id: idol.id, name: idol.name } : null
      }
      return null
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
        const [productsRes, albumDetailsRes, genresRes] = await Promise.all([
          ProductsService.getAllPublic(),
          AlbumDetailsService.getAllPublic(),
          GenresService.getAllPublic()
        ])
        this.products = productsRes.data
        this.albumDetails = albumDetailsRes.data
        this.genres = genresRes.data
        this.loaded = true
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Genre tags for one product — fetched on demand by ReleaseCard rather
    // than upfront for every product in fetchAll.
    async fetchGenresForProduct (productId, { force = false } = {}) {
      if (!force && this.genresByProduct[productId]) return
      try {
        const response = await enqueueGenresFetch(() => GenresService.getForProductPublic(productId))
        this.genresByProduct[productId] = response.data
      } catch (error) {
        this.error = error.message
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
