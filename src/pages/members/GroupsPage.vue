<template>
  <div class="groups-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('groupsPage.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('groupsPage.title') }}</h1>
        <p class="hero__sub">{{ $t('groupsPage.sub') }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <p v-if="error" class="fetch-error">{{ error }}</p>

      <UiPageLoader v-if="loading"/>

      <template v-else>
        <p class="result-count">{{ $t('groupsPage.resultCount', { count: groups.length }) }}</p>

        <div v-if="groups.length" class="grid">
          <GroupCard v-for="group in groups" :key="group.id" :group="group"/>
        </div>

        <div v-else class="empty-state">
          <p class="empty-state__title">{{ $t('groupsPage.noResults') }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { GroupsService } from '@/services/members/groups.service'
import GroupCard from '@/components/GroupCard.vue'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'

export default {
  name: 'GroupsPage',

  components: { GroupCard, UiPageLoader },

  data () {
    return {
      groups: [],
      loading: true,
      error: null
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
        const response = await GroupsService.getGroupsPagePublic()
        this.groups = response.data.groups
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.groups-page {
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
</style>
