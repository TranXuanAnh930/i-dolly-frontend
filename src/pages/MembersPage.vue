<template>
  <div class="members-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('members.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('members.title') }}</h1>
        <p class="hero__sub">{{ $t('members.sub') }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <p v-if="error" class="fetch-error">{{ error }}</p>

      <UiPageLoader v-if="loading"/>

      <template v-else>
        <div v-if="idolUnits.length" class="filter-card">
          <span class="filter-card__label">{{ $t('members.filterByUnit') }}</span>
          <div class="unit-row">
            <UnitPill
              v-for="unit in idolUnits"
              :key="unit.id"
              :unit="unit"
              interactive
              :active="activeUnitIds.includes(unit.id)"
              @toggle="toggleUnit"/>
          </div>
        </div>

        <p class="result-count">{{ $t('members.resultCount', { count: filteredMembers.length }) }}</p>

        <div v-if="filteredMembers.length" class="grid">
          <IdolCard v-for="member in filteredMembers" :key="member.id" :member="member"/>
        </div>

        <div v-else class="empty-state">
          <p class="empty-state__title">{{ $t('members.noResults') }}</p>
          <button type="button" class="empty-state__clear" @click="activeUnitIds = []">{{ $t('events.clearFilters') }}</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { IdolsService } from '@/services/idols.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import UnitPill from '@/components/UnitPill.vue'
import IdolCard from '@/components/IdolCard.vue'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'

export default {
  name: 'MembersPage',

  components: { UnitPill, IdolCard, UiPageLoader },

  data () {
    return {
      idols: [],
      groups: [],
      loading: true,
      error: null,
      activeUnitIds: []
    }
  },

  computed: {
    // Groups have no color of their own in this API — resolve one so
    // UnitPill (which expects unit.color/textColor) can still theme it.
    idolUnits () {
      return this.groups.map(group => {
        const hex = paletteColorForId(group.id)
        return { id: group.id, name: group.name, color: hex, textColor: contrastTextColor(hex) }
      })
    },
    filteredMembers () {
      if (!this.activeUnitIds.length) return this.idols
      return this.idols.filter(member => this.activeUnitIds.includes(member.group_id))
    }
  },

  created () {
    this.fetchPage()
  },

  methods: {
    async fetchPage () {
      this.loading = true
      this.error = null
      try {
        const response = await IdolsService.getMembersPagePublic()
        this.idols = response.data.idols
        this.groups = response.data.groups
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    toggleUnit (unitId) {
      this.activeUnitIds = this.activeUnitIds.includes(unitId)
        ? this.activeUnitIds.filter(id => id !== unitId)
        : [...this.activeUnitIds, unitId]
    }
  }
}
</script>

<style lang="scss" scoped>
.members-page {
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

.hero__inner {
  position: relative;
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
  gap: 12px;
}

.filter-card__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: $color-gray-500;
}

.unit-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
