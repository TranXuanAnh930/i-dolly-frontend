<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerProducts.title') }}</h2>
      <router-link :to="{ name: 'admin-products-new' }" class="add-btn">{{ $t('managerProducts.addProduct') }}</router-link>
    </div>

    <div class="table-card" v-if="products.length">
      <table class="table">
        <thead>
          <tr>
            <th></th>
            <th>{{ $t('common.name') }}</th>
            <th>{{ $t('managerProducts.category') }}</th>
            <th>{{ $t('managerProducts.price') }}</th>
            <th>{{ $t('managerProducts.quantity') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td class="thumb-cell">
              <img v-if="resolveMediaUrl(product.image_url) && !brokenImageIds.has(product.id)" :src="resolveMediaUrl(product.image_url)" :alt="product.name" class="thumb" @error="onImageError(product.id)">
              <span v-else class="thumb thumb--empty" aria-hidden="true"></span>
            </td>
            <td :data-label="$t('common.name')">{{ product.name }}</td>
            <td :data-label="$t('managerProducts.category')">{{ product.category }}</td>
            <td :data-label="$t('managerProducts.price')">&yen;{{ product.price.toLocaleString('en-US') }}</td>
            <td :data-label="$t('managerProducts.quantity')">{{ product.quantity }}</td>
            <td class="actions">
              <UiRowActions>
                <router-link :to="{ name: 'admin-products-edit', params: { id: product.id } }">{{ $t('common.edit') }}</router-link>
                <button type="button" class="danger" @click="remove(product)">{{ $t('common.delete') }}</button>
              </UiRowActions>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="empty-note" v-else>{{ $t('managerProducts.noResults') }}</p>

    <p class="form-error" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import UiRowActions from '@/components/UiRowActions.vue'
import { ProductsService } from '@/services/store/products.service'
import { resolveMediaUrl } from '@/utils/media'

export default {
  name: 'AdminProductsPage',

  components: { UiRowActions },

  data () {
    return {
      products: [],
      // Product ids whose image fails to load — falls back to the same
      // empty-thumb placeholder as a product with no image (see
      // ManagerProductsPage).
      brokenImageIds: new Set(),
      error: ''
    }
  },

  created () {
    this.fetchPage()
  },

  methods: {
    resolveMediaUrl,
    async fetchPage () {
      try {
        // Products carry no direct company_id — the backend resolves one
        // via album_details/lightstick_details when it can, and treats
        // plain merch with neither as manageable by anyone. An admin isn't
        // scoped, unlike a manager (see ManagerProductsPage); this page
        // lists every company, so no company_id is passed (the service
        // takes one for an admin screen that narrows to a company).
        const response = await ProductsService.getManagerProductsPage()
        this.products = response.data.products
      } catch (error) {
        if (!error.redirected) this.error = error.message
      }
    },
    onImageError (productId) {
      this.brokenImageIds.add(productId)
    },
    async remove (product) {
      if (!window.confirm(this.$t('common.confirmDelete', { name: product.name }))) return
      try {
        await ProductsService.remove(product.id)
        await this.fetchPage()
      } catch (error) {
        this.error = error.message
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.crud-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 0 80px;

  // .wrapper's own side padding is overridden by the shorthand above; fine
  // on desktop where the wrapper is centered with room either side, but
  // on a phone it leaves the cards flush against the screen edges.
  @include media_mobile {
    padding: 20px 16px 80px;
  }
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.page-head__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 22px;
  color: $color-ink;
}

.add-btn {
  border: none;
  border-radius: 999px;
  padding: 10px 20px;
  background: $color-brand;
  color: $color-white;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: $color-brand-deep;
  }
}

.empty-note {
  font-family: $font-content;
  font-size: 14px;
  color: $color-gray-500;
  padding: 20px 0;
}

.table-card {
  background: $color-white;
  border-radius: 16px;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
  overflow-x: auto;

  @include media_mobile {
    overflow-x: visible;
  }
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-family: $font-content;
  font-size: 13.5px;

  th, td {
    padding: 12px 16px;
    text-align: left;
    white-space: nowrap;
  }

  th {
    font-weight: 700;
    color: $color-gray-500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .03em;
    border-bottom: 1px solid $color-line;
  }

  tbody tr {
    border-bottom: 1px solid $color-line;

    &:last-child {
      border-bottom: none;
    }
  }

  // Same phone card as ManagerProductsPage: image filling the left half,
  // the remaining columns stacked label-over-value in the right half (label
  // re-shown via data-label, kept in sync with the real <th> text/i18n
  // above), and the row actions collapsed into a dropdown at the bottom of
  // that right half.
  @include media_mobile {
    display: block;

    thead {
      display: none;
    }

    tbody {
      display: block;

      // 4 data rows sized to content, then a flexible last row for the
      // actions — whatever height the image has beyond the text goes there,
      // pinning the actions toggle to the image's bottom edge.
      tr {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: repeat(4, auto) 1fr;
        column-gap: 14px;
        row-gap: 8px;
        padding: 16px;
      }
    }

    td {
      grid-column: 2;
      display: block;
      min-width: 0;
      padding: 0;
      white-space: normal;
      overflow-wrap: anywhere;

      &[data-label]::before {
        content: attr(data-label);
        display: block;
        margin-bottom: 2px;
        font-weight: 700;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: .03em;
        color: $color-gray-500;
      }
    }
  }
}

// td.thumb-cell (not just .thumb-cell) so the grid placement below matches
// ".table td"'s own specificity and wins, instead of getting pushed into
// column 2 with every other cell.
td.thumb-cell {
  width: 40px;

  @include media_mobile {
    grid-column: 1;
    grid-row: 1 / -1;
    width: auto;
  }
}

.thumb {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;

  @include media_mobile {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    border-radius: 12px;
  }
}

// A product with no image renders nothing here otherwise, collapsing
// that row shorter than every other row in the table (there's nothing
// else in a row to keep it at the same height).
.thumb--empty {
  display: block;
  background: $color-gray-100;
}

.actions {
  display: flex;
  gap: 8px;

  @include media_mobile {
    align-self: end;
  }

  a, button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1.5px solid $color-line;
    background: $color-white;
    border-radius: 8px;
    padding: 6px 12px;
    font-family: $font-content;
    font-weight: 700;
    font-size: 12px;
    // Pinned so a <router-link> (inherits the page's line-height) and a
    // <button> (UA default) render the same height side by side.
    line-height: 1.4;
    // One shared width so a row's Edit / Deactivate / Sales buttons read as
    // a matched set instead of each hugging its own label; wide enough for
    // the longest common label ("Deactivate"), longer ones just grow past it.
    min-width: 92px;
    cursor: pointer;
    color: $color-ink;
    text-decoration: none;

    &:hover {
      border-color: $color-brand;
      color: $color-brand;
    }

    &.danger:hover {
      border-color: $color-error;
      color: $color-error;
    }
  }
}

.form-error {
  background: #fdeaf1;
  color: $color-error;
  border-radius: 12px;
  padding: 10px 14px;
  font-family: $font-content;
  font-size: 13px;
  font-weight: 700;
}
</style>
