<template>
  <div class="events-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <p class="hero__eyebrow">{{ $t('events.eyebrow') }}</p>
        <h1 class="hero__title">{{ $t('events.title') }}</h1>
        <p class="hero__sub">{{ $t('events.sub') }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <EventFilters
        class="filters"
        :search="search"
        @update:search="search = $event"/>

      <p v-if="concertsStore.error" class="fetch-error">{{ concertsStore.error }}</p>

      <UiPageLoader v-if="concertsStore.loading && !concertsStore.loaded"/>

      <template v-else>
        <p class="result-count">{{ $t('events.resultCount', { count: filteredEvents.length }) }}</p>

        <div v-if="filteredEvents.length" class="grid">
          <EventCard v-for="event in filteredEvents" :key="event.id" :event="event"/>
        </div>

        <div v-else class="empty-state">
          <p class="empty-state__title">{{ $t('events.noResults') }}</p>
          <p class="empty-state__hint">{{ $t('events.noResultsHint') }}</p>
          <button type="button" class="empty-state__clear" @click="clearFilters">{{ $t('events.clearFilters') }}</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { useConcertsStore } from '@/store/concerts'
import EventFilters from '@/components/EventFilters.vue'
import EventCard from '@/components/EventCard.vue'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'

export default {
  name: 'EventsPage',

  components: { EventFilters, EventCard, UiPageLoader },

  data () {
    return {
      search: ''
    }
  },

  computed: {
    concertsStore () {
      return useConcertsStore()
    },
    filteredEvents () {
      const query = this.search.trim().toLowerCase()

      let list = this.concertsStore.concerts.filter(event => {
        if (!query) return true
        const venue = this.concertsStore.venueById(event.venue_id)
        const haystack = `${event.title} ${venue ? venue.name : ''} ${venue ? venue.city : ''}`.toLowerCase()
        return haystack.includes(query)
      })

      list = [...list].sort((a, b) => a.event_datetime.localeCompare(b.event_datetime))

      return list
    }
  },

  created () {
    this.concertsStore.fetchAll()
  },

  methods: {
    clearFilters () {
      this.search = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.events-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 40px 0 70px;
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
  font-size: clamp(34px, 6vw, 56px);
  line-height: 1.05;
  color: $color-brand;
  max-width: 14ch;
}

.hero__sub {
  margin-top: 12px;
  font-family: $font-content;
  font-size: 15px;
  color: $color-font-main;
  max-width: 46ch;
}

.content {
  margin-top: -30px;
  position: relative;
  padding-bottom: 80px;
}

.filters {
  margin-bottom: 18px;
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
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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

.empty-state__hint {
  margin-top: 6px;
  font-family: $font-content;
  font-size: 13px;
  color: $color-gray-500;
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
