<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'manager-products' }" class="back-link">&larr; Back to products</router-link>

    <form class="form-card" @submit.prevent="save">
      <h3 class="form-card__title">{{ isEditing ? 'Edit product' : 'Add product' }}</h3>

      <div class="field-grid">
        <label class="field">
          <span class="field__label">Name</span>
          <input v-model="form.name" required>
        </label>
        <label class="field">
          <span class="field__label">Category</span>
          <select v-model="form.category_id" required>
            <option value="" disabled>Select a category…</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Price</span>
          <input type="number" min="0.01" step="0.01" v-model.number="form.price" required>
        </label>
        <label class="field">
          <span class="field__label">Quantity</span>
          <input type="number" min="0" v-model.number="form.quantity" required>
        </label>
        <label class="field">
          <span class="field__label">Photo</span>
          <input type="file" accept="image/*" @change="onImageChange">
        </label>
      </div>

      <label class="field">
        <span class="field__label">Description</span>
        <textarea v-model="form.description" rows="4" required></textarea>
      </label>

      <p class="form-error" v-if="error">{{ error }}</p>

      <div class="form-actions">
        <router-link :to="{ name: 'manager-products' }" class="cancel-btn">Cancel</router-link>
        <button type="submit" class="save-btn" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ProductsService } from '@/services/products.service'

function emptyForm () {
  return { name: '', category_id: '', price: '', quantity: '', description: '' }
}

export default {
  name: 'ManagerProductFormPage',

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
    },
    // Same scoping as ManagerProductsPage — a manager only ever edits their
    // own company's products (plus ownerless merch); an admin isn't scoped.
    companyId () {
      return this.$currentUser.role === 'admin' ? null : this.$currentUser.company_id
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
        const response = await ProductsService.getManagerProductFormPagePublic(this.companyId)
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
        this.error = 'Name, category and description are required.'
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
        this.$router.push({ name: 'manager-products' })
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

.form-card {
  background: $color-white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 640px;
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
