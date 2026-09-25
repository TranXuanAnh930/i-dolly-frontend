<template>
  <div class="wrapper crud-page">
    <router-link :to="{ name: 'manager-idols' }" class="back-link">&larr; {{ $t('managerIdolForm.backToIdols') }}</router-link>

    <div class="form-wrap">
      <h3 class="form-card__title">{{ isEditing ? $t('managerIdolForm.editTitle') : $t('managerIdolForm.addTitle') }}</h3>

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
            <span class="field__label">{{ $t('managerIdols.group') }}</span>
            <select v-model="form.group_id">
              <option value="">{{ $t('common.none') }}</option>
              <option v-for="group in myGroups" :key="group.id" :value="group.id">{{ group.name }}{{ !group.is_active ? ` (${$t('common.statusInactive')})` : '' }}</option>
            </select>
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerIdolForm.dateOfBirth') }}</span>
            <input type="date" v-model="form.date_of_birth">
          </label>
          <label class="field">
            <span class="field__label">{{ $t('idolDetail.hometown') }}</span>
            <input v-model="form.hometown">
          </label>
          <label class="field">
            <span class="field__label">{{ $t('managerIdolForm.color') }}</span>
            <select v-model="form.color_id">
              <option value="">{{ $t('common.none') }}</option>
              <option v-for="color in colors" :key="color.id" :value="color.id">{{ color.name }}</option>
            </select>
          </label>
        </div>

        <label class="field">
          <span class="field__label">{{ $t('managerIdolForm.shortIntro') }}</span>
          <input v-model="form.short_intro" maxlength="500">
        </label>
        <label class="field">
          <span class="field__label">{{ $t('managerIdolForm.longDescription') }}</span>
          <textarea v-model="form.long_description" rows="4"></textarea>
        </label>

        <p class="form-error" v-if="error">{{ error }}</p>

        <div class="form-actions">
          <router-link :to="{ name: 'manager-idols' }" class="cancel-btn">{{ $t('common.cancel') }}</router-link>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? $t('common.saving') : $t('common.save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { IdolsService } from '@/services/members/idols.service'
import { useToastStore } from '@/store/toast'
import { resolveMediaUrl } from '@/utils/media'

function emptyForm () {
  return {
    name: '',
    group_id: '',
    date_of_birth: '',
    hometown: '',
    color_id: '',
    short_intro: '',
    long_description: ''
  }
}

export default {
  name: 'ManagerIdolFormPage',

  props: {
    id: { type: String, default: null }
  },

  data () {
    return {
      idols: [],
      groups: [],
      colors: [],
      form: emptyForm(),
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
    idol () {
      return this.isEditing ? this.idols.find(i => i.id === this.id) : null
    },
    // A manager is always scoped to their own company; on edit the idol's
    // own (immutable) company applies — see AdminIdolFormPage for the
    // admin equivalent, which picks a company via a dropdown on create.
    companyId () {
      if (this.isEditing) return this.idol ? this.idol.company_id : ''
      return this.$currentUser.company_id
    },
    // Deactivated groups are hidden from selection (the backend rejects a
    // NEW assignment into one), except the idol's own current group so an
    // existing membership stays visible/selectable even if it later became
    // inactive — see idol_service.update_idol's group_inactive carve-out.
    myGroups () {
      return this.groups.filter(group =>
        group.company_id === this.companyId &&
        (group.is_active || (this.idol && group.id === this.idol.group_id))
      )
    },
    // A freshly picked file previews over the idol's existing photo — so a
    // manager editing can see what's currently set without picking a new
    // file just to find out, and picking one immediately shows what's about
    // to replace it.
    imagePreviewUrl () {
      if (this.newImagePreviewUrl) return this.newImagePreviewUrl
      return this.idol ? resolveMediaUrl(this.idol.profile_image_url) : null
    }
  },

  watch: {
    idol: {
      immediate: true,
      handler (idol) {
        if (!idol) return
        this.form = {
          name: idol.name,
          group_id: idol.group_id || '',
          date_of_birth: idol.date_of_birth || '',
          hometown: idol.hometown || '',
          color_id: idol.color_id || '',
          short_intro: idol.short_intro || '',
          long_description: idol.long_description || ''
        }
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
        const response = await IdolsService.getManagerIdolFormPagePublic()
        this.idols = response.data.idols
        this.groups = response.data.groups
        this.colors = response.data.colors
      } catch (error) {
        this.error = error.message
      }
    },
    onImageChange (event) {
      if (this.newImagePreviewUrl) URL.revokeObjectURL(this.newImagePreviewUrl)
      this.imageFile = event.target.files[0] || null
      this.newImagePreviewUrl = this.imageFile ? URL.createObjectURL(this.imageFile) : null
    },
    async save () {
      if (!this.form.name.trim()) {
        this.error = this.$t('common.errorNameRequired')
        return
      }
      this.saving = true
      this.error = ''
      const fields = {
        name: this.form.name,
        group_id: this.form.group_id || null,
        date_of_birth: this.form.date_of_birth || null,
        hometown: this.form.hometown || null,
        color_id: this.form.color_id || null,
        short_intro: this.form.short_intro || null,
        long_description: this.form.long_description || null
      }
      try {
        if (this.isEditing) {
          await IdolsService.update(this.id, fields)
          if (this.imageFile) await IdolsService.uploadImage(this.id, this.imageFile)
          useToastStore().add({ type: 'success', message: this.$t('managerIdolForm.updateSuccess') })
        } else {
          await IdolsService.create({ ...fields, company_id: this.companyId, image: this.imageFile })
        }
        this.$router.push({ name: 'manager-idols' })
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
  // group name) forces its whole column wider than the sibling column's
  // 1fr share instead of the two columns splitting evenly.
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
