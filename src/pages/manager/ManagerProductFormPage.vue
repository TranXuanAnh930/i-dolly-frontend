<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'manager-products' }" class="back-link">&larr; {{ $t('managerProductForm.backToProducts') }}</router-link>

    <div class="form-wrap">
      <h3 class="form-card__title">{{ isEditing ? $t('managerProductForm.editTitle') : $t('managerProductForm.addTitle') }}</h3>

      <form class="form-card" @submit.prevent="save">
        <label class="field field--image">
          <span class="field__label">{{ $t('common.photo') }}</span>
          <img v-if="imagePreviewUrl" :src="imagePreviewUrl" class="image-preview" alt="">
          <input type="file" accept="image/*" @change="onImageChange">
          <span class="field__hint" v-if="isEditing && !imageFile">{{ $t('common.imageKeptHint') }}</span>
        </label>

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
            <input type="number" min="0.01" step="0.01" v-model.number="form.price" required :disabled="isEditing">
            <span class="field__hint" v-if="isEditing">{{ $t('managerProductForm.priceLocked') }}</span>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerProducts.quantity') }}</span>
            <input type="number" min="0" v-model.number="form.quantity" required>
          </label>
        </div>

        <label class="field">
          <span class="field__label">{{ $t('common.description') }}</span>
          <textarea v-model="form.description" rows="4" required></textarea>
        </label>

        <!-- A product is always created together with its album/merch
             detail row (see product_service.add_product_with_detail), so
             this also shows while editing — release_date/track_count/format
             (album) or edition/color_id (merch) bundle into the same save
             as the base product fields, just like creation bundles them
             into one request. Ownership (idol/group) is immutable once set
             (AlbumDetailUpdate/MerchDetailUpdate both exclude it server-side)
             so those two fields lock the same way price does above. -->
        <template v-if="form.category_id">
          <h4 class="section-title">{{ $t(isEditing ? 'managerProductForm.detailsTitle' : 'managerProductForm.attachToTitle') }}</h4>

          <div class="field-grid">
            <!-- Ownership is immutable once set (AlbumDetailUpdate/
                 MerchDetailUpdate both exclude it server-side), so on edit
                 there's nothing to show here — a disabled select duplicating
                 a value the manager can't change is just clutter. -->
            <template v-if="!isEditing">
              <label class="field">
                <span class="field__label">{{ $t('managerProductForm.ownerType') }}</span>
                <select v-model="detail.ownerType">
                  <option value="idol">{{ $t('managerProductForm.ownerTypeIdol') }}</option>
                  <option value="group">{{ $t('managerProductForm.ownerTypeGroup') }}</option>
                </select>
              </label>
              <label class="field" v-if="detail.ownerType === 'idol'">
                <span class="field__label">{{ $t('managerProductForm.idol') }}</span>
                <select v-model="detail.idol_id" required>
                  <option value="" disabled>{{ $t('managerProductForm.selectIdolPlaceholder') }}</option>
                  <option v-for="idol in myIdols" :key="idol.id" :value="idol.id">{{ idol.name }}</option>
                </select>
              </label>
              <label class="field" v-else>
                <span class="field__label">{{ $t('managerProductForm.group') }}</span>
                <select v-model="detail.group_id" required>
                  <option value="" disabled>{{ $t('managerProductForm.selectGroupPlaceholder') }}</option>
                  <option v-for="group in myGroups" :key="group.id" :value="group.id">{{ group.name }}</option>
                </select>
              </label>
            </template>

            <template v-if="detailKind === 'album'">
              <label class="field">
                <span class="field__label">{{ $t('managerProductForm.releaseDate') }}</span>
                <input type="date" v-model="detail.release_date">
              </label>
              <label class="field">
                <span class="field__label">{{ $t('managerProductForm.trackCount') }}</span>
                <input type="number" min="1" v-model.number="detail.track_count">
              </label>
              <label class="field">
                <span class="field__label">{{ $t('managerProductForm.format') }}</span>
                <select v-model="detail.format">
                  <option value="physical">{{ $t('managerProductForm.formatPhysical') }}</option>
                  <option value="digital">{{ $t('managerProductForm.formatDigital') }}</option>
                </select>
              </label>
            </template>
            <template v-else>
              <label class="field">
                <span class="field__label">{{ $t('managerProductForm.edition') }}</span>
                <input v-model="detail.edition">
              </label>
              <label class="field">
                <span class="field__label">{{ $t('managerProductForm.color') }}</span>
                <select v-model="detail.color_id">
                  <option value="">{{ $t('managerProductForm.noColor') }}</option>
                  <option v-for="color in colors" :key="color.id" :value="color.id">{{ color.name }}</option>
                </select>
              </label>
            </template>
          </div>
        </template>

        <p class="form-error" v-if="error">{{ error }}</p>

        <div class="form-actions">
          <router-link :to="{ name: 'manager-products' }" class="cancel-btn">{{ $t('common.cancel') }}</router-link>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? $t('common.saving') : $t('common.save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ProductsService } from '@/services/store/products.service'
import { AlbumDetailsService } from '@/services/store/albumDetails.service'
import { MerchDetailsService } from '@/services/store/merchDetails.service'
import { useToastStore } from '@/store/toast'
import { resolveMediaUrl } from '@/utils/media'

function emptyForm () {
  return { name: '', category_id: '', price: '', quantity: '', description: '' }
}

function emptyDetailForm () {
  return {
    ownerType: 'idol', // 'idol' | 'group' — which of idol_id/group_id is sent
    idol_id: '',
    group_id: '',
    release_date: '',
    track_count: '',
    format: 'physical',
    edition: '',
    color_id: ''
  }
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
      idols: [],
      groups: [],
      colors: [],
      form: emptyForm(),
      detail: emptyDetailForm(),
      // True once loadDetail() has actually found a row to edit — gates
      // save() sending an album/merch detail update at all, since a product
      // with no matching row (shouldn't happen, but the GET 404s if it
      // does) has nothing there to update.
      detailLoaded: false,
      imageFile: null,
      // A local objectURL for imageFile, kept separate from it so it can be
      // revoked (onImageChange, unmounted) without re-deriving it from the
      // file on every read.
      newImagePreviewUrl: null,
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
    // own company's products (plus ownerless merch) — see
    // AdminProductFormPage for the unscoped admin equivalent.
    companyId () {
      return this.$currentUser.company_id
    },
    selectedCategory () {
      return this.categories.find(c => c.id === this.form.category_id) || null
    },
    // "Merch" is the one category name that isn't an album/single/EP — see
    // add_product_with_detail's detail_kind. Categories are a small, fixed
    // seeded set (docs/database-design.md), not open-ended, so matching by
    // name here is safe.
    detailKind () {
      return this.selectedCategory && this.selectedCategory.name === 'Merch' ? 'merch' : 'album'
    },
    myIdols () {
      return this.idols.filter(idol => idol.company_id === this.companyId)
    },
    myGroups () {
      return this.groups.filter(group => group.company_id === this.companyId)
    },
    // A freshly picked file previews over the product's existing image —
    // so a manager editing can see what's currently set without having to
    // pick a new file just to find out, and picking one immediately shows
    // what's about to replace it.
    imagePreviewUrl () {
      if (this.newImagePreviewUrl) return this.newImagePreviewUrl
      return this.product ? resolveMediaUrl(this.product.image_url) : null
    }
  },

  watch: {
    product: {
      immediate: true,
      async handler (product) {
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
        if (this.isEditing && category) await this.loadDetail(category)
      }
    }
  },

  created () {
    this.fetchPage()
  },

  unmounted () {
    if (this.newImagePreviewUrl) URL.revokeObjectURL(this.newImagePreviewUrl)
  },

  methods: {
    async fetchPage () {
      try {
        const response = await ProductsService.getManagerProductFormPagePublic(this.companyId)
        this.products = response.data.products
        this.categories = response.data.categories
        this.idols = response.data.idols
        this.groups = response.data.groups
        this.colors = response.data.colors
      } catch (error) {
        this.error = error.message
      }
    },
    // Prefills detail with the product's existing album/merch row so
    // editing starts from real values instead of emptyDetailForm()'s
    // defaults. A 404 here (no matching row) is left unhandled by design —
    // detailLoaded stays false, so save() below just skips the detail
    // update rather than erroring the whole save over it.
    async loadDetail (category) {
      const isAlbum = category.name !== 'Merch'
      try {
        const service = isAlbum ? AlbumDetailsService : MerchDetailsService
        const response = await service.getByIdPublic(this.id)
        const detail = response.data
        this.detail = {
          ownerType: detail.idol_id ? 'idol' : 'group',
          idol_id: detail.idol_id || '',
          group_id: detail.group_id || '',
          release_date: isAlbum ? (detail.release_date || '') : '',
          track_count: isAlbum ? (detail.track_count || '') : '',
          format: isAlbum ? (detail.format || 'physical') : 'physical',
          edition: !isAlbum ? (detail.edition || '') : '',
          color_id: !isAlbum ? (detail.color_id || '') : ''
        }
        this.detailLoaded = true
      } catch {
        this.detailLoaded = false
      }
    },
    onImageChange (event) {
      if (this.newImagePreviewUrl) URL.revokeObjectURL(this.newImagePreviewUrl)
      this.imageFile = event.target.files[0] || null
      this.newImagePreviewUrl = this.imageFile ? URL.createObjectURL(this.imageFile) : null
    },
    async save () {
      if (!this.form.name.trim() || !this.form.category_id || !this.form.description.trim()) {
        this.error = this.$t('managerProductForm.errorRequired')
        return
      }
      const ownerId = this.detail.ownerType === 'idol' ? this.detail.idol_id : this.detail.group_id
      if (!this.isEditing && !ownerId) {
        this.error = this.$t('managerProductForm.errorOwnerRequired')
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
          if (this.detailLoaded) {
            const isAlbum = this.detailKind === 'album'
            if (isAlbum) {
              await AlbumDetailsService.update(this.id, {
                release_date: this.detail.release_date || null,
                track_count: this.detail.track_count || null,
                format: this.detail.format
              })
            } else {
              await MerchDetailsService.update(this.id, {
                edition: this.detail.edition || null,
                color_id: this.detail.color_id || null
              })
            }
          }
          if (this.imageFile) await ProductsService.uploadImage(this.id, this.imageFile)
          useToastStore().add({ type: 'success', message: this.$t('managerProductForm.updateSuccess') })
        } else {
          const isAlbum = this.detailKind === 'album'
          await ProductsService.createWithDetail({
            ...fields,
            image: this.imageFile,
            detail_kind: this.detailKind,
            idol_id: this.detail.ownerType === 'idol' ? this.detail.idol_id : null,
            group_id: this.detail.ownerType === 'group' ? this.detail.group_id : null,
            release_date: isAlbum ? (this.detail.release_date || null) : null,
            track_count: isAlbum ? (this.detail.track_count || null) : null,
            format: isAlbum ? this.detail.format : null,
            edition: isAlbum ? null : (this.detail.edition || null),
            color_id: isAlbum ? null : (this.detail.color_id || null)
          })
        }
        this.$router.push({ name: 'manager-products' })
      } catch (error) {
        this.error = error.message
        if (this.isEditing) useToastStore().add({ type: 'error', message: error.message })
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

.section-title {
  margin-top: -4px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: $color-gray-500;
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
  // Grid items default to min-width: auto, so a long <option> (e.g. a
  // category name) forces its whole column wider than the sibling
  // column's 1fr share instead of the two columns splitting evenly.
  min-width: 0;
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

  &:disabled {
    background: $color-gray-100;
    color: $color-gray-500;
    cursor: not-allowed;
  }
}

.field textarea {
  resize: vertical;
}

.field__hint {
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-500;
}

.field--image {
  align-items: center;
  text-align: center;

  input[type="file"] {
    max-width: 280px;
  }
}

.image-preview {
  width: 100%;
  max-width: 140px;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
  border: 1.5px solid $color-line;
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
