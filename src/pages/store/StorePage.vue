<template>
  <div class="store-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('store.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('store.title') }}</h1>
        <p class="hero__sub">{{ $t('store.sub') }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <p v-if="fetchError" class="fetch-error">{{ fetchError }}</p>

      <UiPageLoader v-if="isLoading"/>

      <template v-else>
        <div class="filter-card">
          <div class="filter-row" v-if="typeOptions.length > 1">
            <span class="filter-card__label">{{ $t('store.typeLabel') }}</span>
            <div class="chip-row">
              <button
                v-for="option in typeOptions"
                :key="option"
                type="button"
                class="chip"
                :class="{ 'is-active': activeType === option }"
                @click="activeType = option">
                {{ typeLabel(option) }}
              </button>
            </div>
          </div>

          <div class="filter-row" v-if="idolUnits.length">
            <span class="filter-card__label">{{ $t('store.unitLabel') }}</span>
            <div class="chip-row">
              <UnitPill
                v-for="unit in idolUnits"
                :key="unit.id"
                :unit="unit"
                interactive
                :active="activeUnitIds.includes(unit.id)"
                @toggle="toggleUnit"/>
            </div>
          </div>
        </div>

        <p class="result-count">{{ $t('store.resultCount', { count: filteredReleases.length }) }}</p>

        <div v-if="filteredReleases.length" class="grid">
          <ReleaseCard v-for="release in filteredReleases" :key="release.id" :release="release"/>
        </div>

        <div v-else class="empty-state">
          <p class="empty-state__title">{{ $t('store.noResults') }}</p>
          <button type="button" class="empty-state__clear" @click="clearFilters">{{ $t('events.clearFilters') }}</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ProductsService } from '@/services/store/products.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import UnitPill from '@/components/UnitPill.vue'
import ReleaseCard from '@/components/ReleaseCard.vue'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'

export default {
  name: 'StorePage',

  components: { UnitPill, ReleaseCard, UiPageLoader },

  data () {
    return {
      products: [],
      groups: [],
      isLoading: true,
      fetchError: null,
      activeType: 'All',
      activeUnitIds: []
    }
  },

  computed: {
    // Real product categories, whatever they are (e.g. "Album"/"Single"/
    // "Lightstick"/"Merch") rather than a hardcoded list — "All" is only
    // offered when there's more than one category to actually filter
    // between.
    typeOptions () {
      const categories = [...new Set(this.products.map(release => release.category))]
      return categories.length > 1 ? ['All', ...categories] : categories
    },
    // Unit filter only covers group-attributed releases — a solo-idol
    // release, or a plain merch item resolved to no artist at all, has no
    // group to filter by and only shows up in the unfiltered view.
    idolUnits () {
      return this.groups.map(group => {
        const hex = paletteColorForId(group.id)
        return { id: group.id, name: group.name, color: hex, textColor: contrastTextColor(hex) }
      })
    },
    filteredReleases () {
      return this.products.filter(release => {
        if (this.activeType !== 'All' && release.category !== this.activeType) return false
        if (this.activeUnitIds.length) {
          const artist = release.artist
          if (!artist || artist.type !== 'group' || !this.activeUnitIds.includes(artist.id)) return false
        }
        return true
      })
    }
  },

  created () {
    this.fetchPage()
  },

  methods: {
    async fetchPage () {
      this.isLoading = true
      this.fetchError = null
      try {
        const response = await ProductsService.getStorePagePublic()
        this.products = response.data.products
        this.groups = response.data.groups
      } catch (error) {
        this.fetchError = error.message
      } finally {
        this.isLoading = false
      }
    },
    toggleUnit (unitId) {
      this.activeUnitIds = this.activeUnitIds.includes(unitId)
        ? this.activeUnitIds.filter(id => id !== unitId)
        : [...this.activeUnitIds, unitId]
    },
    clearFilters () {
      this.activeType = 'All'
      this.activeUnitIds = []
    },
    typeLabel (option) {
      const key = { All: 'typeAll', Album: 'typeAlbum', Single: 'typeSingle' }[option]
      return key ? this.$t(`store.${key}`) : option
    }
  }
}
</script>

<style lang="scss" scoped>
.store-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 40px 0 60px;
  overflow: hidden;
}

.hero__eyebrow {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: $color-brand;
  margin-bottom: 8px;
}

.hero__title {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(28px, 5vw, 56px);
  line-height: 1.05;
  color: $color-brand;
}

.hero__sub {
  margin-top: 12px;
  font-family: $font-content;
  font-size: 15px;
  color: $color-font-main;
}

.content {
  margin-top: -20px;
  position: relative;
  padding-bottom: 80px;
}

.fetch-error {
  margin-bottom: 14px;
  background: #fdeaf1;
  color: $color-error;
  border-radius: 12px;
  padding: 10px 14px;
  font-family: $font-content;
  font-size: 13px;
  font-weight: 700;
}

.filter-card {
  background: $color-white;
  border-radius: 20px;
  padding: 18px 20px;
  box-shadow: 0 10px 24px -10px rgba($color-ink, .18);
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filter-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-card__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: $color-gray-500;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: 1.5px solid $color-line;
  border-radius: 999px;
  padding: 6px 14px;
  background: $color-white;
  color: $color-gray-500;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all .12s ease;

  &.is-active {
    background: $color-brand;
    border-color: $color-brand;
    color: $color-white;
  }
}

.result-count {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;
  margin-bottom: 14px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: $color-white;
  border-radius: 20px;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
}

.empty-state__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  color: $color-ink;
}

.empty-state__clear {
  margin-top: 18px;
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
  background: $color-brand;
  color: $color-white;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: $color-brand-deep;
  }
}
</style>
