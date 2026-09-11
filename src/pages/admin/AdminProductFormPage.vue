<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'admin-products' }" class="back-link">&larr; {{ $t('managerProductForm.backToProducts') }}</router-link>

    <div class="form-wrap">
      <h3 class="form-card__title">{{ isEditing ? $t('managerProductForm.editTitle') : $t('managerProductForm.addTitle') }}</h3>

      <form class="form-card" @submit.prevent="save">
        <div class="field-grid">
          <label class="field">
            <span class="field__label">{{ $t('common.name') }}</span>
            <input v-model="form.name" required>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerProducts.category') }}</span>
            <select v-model="form.category_id" required>
              <option value="" disabled>{{ $t('managerProductForm.selectCategoryPlaceholder') }}</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerProducts.price') }}</span>
            <input type="number" min="0.01" step="0.01" v-model.number="form.price" required>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerProducts.quantity') }}</span>
            <input type="number" min="0" v-model.number="form.quantity" required>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('common.photo') }}</span>
            <input type="file" accept="image/*" @change="onImageChange">
          </label>
        </div>

        <label class="field">
          <span class="field__label">{{ $t('common.description') }}</span>
          <textarea v-model="form.description" rows="4" required></textarea>
        </label>

        <p class="form-error" v-if="error">{{ error }}</p>

        <div class="form-actions">
          <router-link :to="{ name: 'admin-products' }" class="cancel-btn">{{ $t('common.cancel') }}</router-link>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? $t('common.saving') : $t('common.save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ProductsService } from '@/services/products.service'

function emptyForm () {
  return { name: '', category_id: '', price: '', quantity: '', description: '' }
}

export default {
  name: 'AdminProductFormPage',

  props: {
    id: { type: String, default: null }
  },

  data () {
    return {
      products: [],
      categories: [],
      form: emptyForm(),
      imageFile: null,
      error: '',
      saving: false
    }
  },

  computed: {
    isEditing () {
      return !!this.id
    },
    product () {
      return this.isEditing ? this.products.find(p => p.id === this.id) : null
    }
  },

  watch: {
    product: {
      immediate: true,
      handler (product) {
        if (!product) return
        // ProductRead exposes the category *name*, not its id — the write
        // endpoints need category_id, so map back via the categories list.
        const category = this.categories.find(c => c.name === product.category)
        this.form = {
          name: product.name,
          category_id: category ? category.id : '',
          price: product.price,
          quantity: product.quantity,
          description: product.description
        }
      }
    }
  },

  created () {
    this.fetchPage()
  },

  methods: {
    async fetchPage () {
      try {
        // An admin isn't scoped to a company, unlike a manager (see
        // ManagerProductFormPage) — no company filter is passed here.
        const response = await ProductsService.getManagerProductFormPagePublic(null)
        this.products = response.data.products
        this.categories = response.data.categories
      } catch (error) {
        this.error = error.message
      }
    },
    onImageChange (event) {
      this.imageFile = event.target.files[0] || null
    },
    async save () {
      if (!this.form.name.trim() || !this.form.category_id || !this.form.description.trim()) {
        this.error = this.$t('managerProductForm.errorRequired')
        return
      }
      this.saving = true
      this.error = ''
      const fields = {
        name: this.form.name,
        category_id: this.form.category_id,
        price: this.form.price,
        quantity: this.form.quantity,
        description: this.form.description
      }
      try {
        if (this.isEditing) {
          await ProductsService.update(this.id, fields)
          if (this.imageFile) await ProductsService.uploadImage(this.id, this.imageFile)
        } else {
          await ProductsService.create({ ...fields, image: this.imageFile })
        }
        this.$router.push({ name: 'admin-products' })
      } catch (error) {
        this.error = error.message
      } finally {
        this.saving = false
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

.back-link {
  align-self: flex-start;
  color: $color-gray-500;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;

  &:hover {
    color: $color-brand;
  }
}

.form-wrap {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-card {
  background: $color-white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-card__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 18px;
  color: $color-ink;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;

  @include media_mobile {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  color: $color-gray-500;
}

.field input,
.field select,
.field textarea {
  border: 1.5px solid $color-line;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
  outline: none;
  background: $color-white;

  &:focus {
    border-color: $color-brand;
    box-shadow: 0 0 0 4px $color-brand-tint;
  }
}

.field textarea {
  resize: vertical;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  border: none;
  background: none;
  padding: 10px 4px;
  cursor: pointer;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;
  text-decoration: none;

  &:hover {
    color: $color-brand;
  }
}

.save-btn {
  border: none;
  border-radius: 999px;
  padding: 11px 26px;
  background: $color-brand;
  color: $color-white;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: $color-brand-deep;
  }

  &:disabled {
    opacity: .6;
    cursor: default;
  }
}
</style>
