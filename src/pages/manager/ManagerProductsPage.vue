<template>
  <div class="wrapper crud-page">
    <div class="page-head">
      <h2 class="page-head__title">{{ $t('managerProducts.title') }}</h2>
      <router-link :to="{ name: 'manager-products-new' }" class="add-btn">{{ $t('managerProducts.addProduct') }}</router-link>
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
              <img v-if="resolveMediaUrl(product.image_url)" :src="resolveMediaUrl(product.image_url)" :alt="product.name" class="thumb">
              <span v-else class="thumb thumb--empty" aria-hidden="true"></span>
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.category }}</td>
            <td>&yen;{{ product.price.toLocaleString('en-US') }}</td>
            <td>{{ product.quantity }}</td>
            <td class="actions">
              <router-link :to="{ name: 'manager-products-edit', params: { id: product.id } }">{{ $t('common.edit') }}</router-link>
              <router-link :to="{ name: 'manager-products-sales', params: { id: product.id }, query: { name: product.name } }">{{ $t('managerProducts.viewSales') }}</router-link>
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
import { ProductsService } from '@/services/products.service'
import { resolveMediaUrl } from '@/utils/media'

export default {
  name: 'ManagerProductsPage',

  data () {
    return {
      products: [],
      error: ''
    }
  },

  computed: {
    // Products carry no direct company_id — the backend resolves one via
    // album_details/lightstick_details when it can, and treats plain merch
    // with neither as manageable by anyone. A manager is scoped to their
    // own company (plus that ownerless merch) — see AdminProductsPage for
    // the unscoped admin equivalent.
    companyId () {
      return this.$currentUser.company_id
    }
  },

  created () {
    this.fetchPage()
  },

  methods: {
    resolveMediaUrl,
    async fetchPage () {
      try {
        const response = await ProductsService.getManagerProductsPagePublic(this.companyId)
        this.products = response.data.products
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
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
}

.thumb-cell {
  width: 40px;
}

.thumb {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
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

  a, button {
    border: 1.5px solid $color-line;
    background: $color-white;
    border-radius: 8px;
    padding: 6px 12px;
    font-family: $font-content;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    color: $color-ink;
    text-decoration: none;

    &:hover {
      border-color: $color-brand;
      color: $color-brand;
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
