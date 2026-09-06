import { defineStore } from 'pinia'

import { CartService } from '@/services/cart.service'
import { withTax } from '@/utils/tax'
import { useCatalogStore } from './catalog'
import { useUserStore } from './user'

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

// Cart/checkout are fan-account-only server-side (FanOnlyPurchaseError) —
// a manager/admin session, or nobody logged in at all, keeps using the
// same localStorage guest cart this store always had. Guest items carry
// just { productId, qty }; server items additionally carry { cartId }, the
// backend row's own id, needed to remove/replace a line (see updateQty).
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadItems(),
    loading: false,
    error: null
  }),

  getters: {
    isServerBacked () {
      const user = useUserStore().currentUser
      return !!user.id && user.role === 'fan'
    },
    // Resolved against the catalog store on read rather than storing a
    // snapshot, so a line always reflects the product's current price/name.
    lines (state) {
      const catalogStore = useCatalogStore()
      return state.items
        .map(item => ({ ...item, product: catalogStore.releaseById(item.productId) }))
        .filter(line => line.product)
    },
    // Derived from `lines`, not raw `state.items` — a stale cart entry
    // whose product no longer resolves (deleted, or a leftover productId
    // from before a catalog reset) is already excluded from what the cart
    // page actually renders (see `lines`' filter), so the header badge
    // must exclude it too or the two disagree on "how many items".
    itemCount () {
      return this.lines.reduce((sum, line) => sum + line.qty, 0)
    },
    // Tax is applied per line (matching how the backend taxes each cart
    // row at checkout — see order_service.checkout) rather than once on
    // the raw sum, so the total shown here always equals the sum of the
    // per-line totals shown alongside it.
    lineTotal () {
      return (line) => withTax(line.product.price * line.qty)
    },
    subtotal () {
      return this.lines.reduce((sum, line) => sum + this.lineTotal(line), 0)
    }
  },

  actions: {
    // Loads the real cart for a logged-in fan — called from Header (on
    // login/app-boot-with-session) and from the cart/checkout pages
    // themselves. A no-op for guests/non-fan roles, who keep reading
    // straight from the state already loaded by loadItems().
    async fetchCart () {
      if (!this.isServerBacked) return
      this.loading = true
      this.error = null
      try {
        const response = await CartService.fetch()
        this.items = response.data.items.map(row => ({
          productId: row.product_id,
          qty: row.quantity,
          cartId: row.id
        }))
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Called on logout — empties the cart outright rather than restoring
    // whatever local guest cart existed before this fan logged in (that
    // old cart reappearing would look just as broken as leaking the fan's
    // own items: either way it's not what the person just looking at an
    // empty cart on this device expects to see).
    clearOnLogout () {
      this.items = []
      saveItems(this.items)
      this.error = null
    },

    async addItem (productId, qty = 1) {
      if (!this.isServerBacked) {
        const existing = this.items.find(item => item.productId === productId)
        if (existing) existing.qty += qty
        else this.items.push({ productId, qty })
        saveItems(this.items)
        return
      }
      try {
        await CartService.add(productId, qty)
        await this.fetchCart()
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateQty (productId, qty) {
      if (qty <= 0) return this.removeItem(productId)
      if (!this.isServerBacked) {
        const existing = this.items.find(item => item.productId === productId)
        if (!existing) return
        existing.qty = qty
        saveItems(this.items)
        return
      }
      const existing = this.items.find(item => item.productId === productId)
      if (!existing) return
      try {
        if (qty > existing.qty) {
          // Increment — the only quantity change the backend actually
          // supports (add_cart increments an existing row instead of
          // erroring on a duplicate product_id).
          await CartService.add(productId, qty - existing.qty)
        } else {
          // No decrement/set-quantity endpoint exists yet — remove the
          // line and recreate it at the new quantity. The cart row's id
          // changes as a result, which is fine since lines are keyed by
          // productId, not cartId, everywhere they're rendered.
          await CartService.remove(existing.cartId)
          await CartService.add(productId, qty)
        }
        await this.fetchCart()
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async removeItem (productId) {
      if (!this.isServerBacked) {
        this.items = this.items.filter(item => item.productId !== productId)
        saveItems(this.items)
        return
      }
      const existing = this.items.find(item => item.productId === productId)
      if (!existing) return
      try {
        await CartService.remove(existing.cartId)
        await this.fetchCart()
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async clear () {
      if (!this.isServerBacked) {
        this.items = []
        saveItems(this.items)
        return
      }
      // No bulk-clear endpoint — remove every line individually.
      try {
        await Promise.all(this.items.map(item => CartService.remove(item.cartId)))
      } finally {
        this.items = []
      }
    }
  }
})
