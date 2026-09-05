import { defineStore } from 'pinia'

import { useCatalogStore } from './catalog'

const STORAGE_KEY = 'i-dolly-cart'

function loadItems () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveItems (items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore — storage may be unavailable (private mode, quota, etc.)
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadItems() // { productId, qty }
  }),

  getters: {
    // Resolved against the catalog store on read rather than storing a
    // snapshot, so a line always reflects the product's current price/name.
    lines (state) {
      const catalogStore = useCatalogStore()
      return state.items
        .map(item => ({ ...item, product: catalogStore.releaseById(item.productId) }))
        .filter(line => line.product)
    },
    itemCount (state) {
      return state.items.reduce((sum, item) => sum + item.qty, 0)
    },
    subtotal () {
      return this.lines.reduce((sum, line) => sum + line.product.price * line.qty, 0)
    }
  },

  actions: {
    addItem (productId, qty = 1) {
      const existing = this.items.find(item => item.productId === productId)
      if (existing) existing.qty += qty
      else this.items.push({ productId, qty })
      saveItems(this.items)
    },
    updateQty (productId, qty) {
      if (qty <= 0) return this.removeItem(productId)
      const existing = this.items.find(item => item.productId === productId)
      if (!existing) return
      existing.qty = qty
      saveItems(this.items)
    },
    removeItem (productId) {
      this.items = this.items.filter(item => item.productId !== productId)
      saveItems(this.items)
    },
    clear () {
      this.items = []
      saveItems(this.items)
    }
  }
})
