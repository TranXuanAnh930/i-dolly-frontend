<template>
  <UiPageLoader v-if="loading"/>

  <div v-else-if="group" class="group-detail-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <router-link to="/members" class="back-link">&larr; {{ $t('idolDetail.backToMembers') }}</router-link>
        <h1 class="hero__title" :style="{ color: color.hex }">{{ group.name }}</h1>
        <p class="hero__meta" v-if="debutLabel">{{ $t('groupDetail.debut', { date: debutLabel }) }}</p>
        <p class="hero__tagline" v-if="group.description">{{ group.description }}</p>
      </div>
    </section>

    <div class="wrapper content">
      <section class="block" v-if="members.length">
        <h2 class="block__title">{{ $t('groupDetail.members') }}</h2>
        <div class="section-rule"></div>
        <div class="members-grid">
          <IdolCard v-for="member in members" :key="member.id" :member="member"/>
        </div>
      </section>

      <section class="block" v-if="events.length">
        <h2 class="block__title">{{ $t('groupDetail.events') }}</h2>
        <div class="section-rule"></div>
        <div class="events-grid">
          <EventCard v-for="event in events" :key="event.id" :event="event"/>
        </div>
      </section>

      <section class="block" v-if="products.length">
        <h2 class="block__title">{{ $t('groupDetail.products') }}</h2>
        <div class="section-rule"></div>
        <div class="products-grid">
          <ReleaseCard v-for="item in products" :key="item.id" :release="item"/>
        </div>
      </section>
    </div>
  </div>

  <div v-else class="not-found">
    <p class="not-found__title">{{ idolsStore.error || $t('groupDetail.notFound') }}</p>
    <router-link to="/members" class="not-found__link">&larr; {{ $t('idolDetail.backToMembers') }}</router-link>
  </div>
</template>

<script>
import { parseISO } from 'date-fns'

import { useIdolsStore } from '@/store/idols'
import { useConcertsStore } from '@/store/concerts'
import { useCatalogStore } from '@/store/catalog'
import { formatDate } from '@/utils/format'
import IdolCard from '@/components/IdolCard.vue'
import EventCard from '@/components/EventCard.vue'
import ReleaseCard from '@/components/ReleaseCard.vue'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'

export default {
  name: 'GroupDetailPage',

  components: { IdolCard, EventCard, ReleaseCard, UiPageLoader },

  props: {
    id: { type: String, required: true }
  },

  computed: {
    idolsStore () {
      return useIdolsStore()
    },
    concertsStore () {
      return useConcertsStore()
    },
    catalogStore () {
      return useCatalogStore()
    },
    loading () {
      return this.idolsStore.loading && !this.idolsStore.loaded
    },
    group () {
      return this.idolsStore.groupById(this.id)
    },
    color () {
      return this.idolsStore.colorForGroup(this.group)
    },
    debutLabel () {
      return this.group && this.group.debut_date ? formatDate(parseISO(this.group.debut_date), 'MMM d, yyyy') : null
    },
    members () {
      return this.idolsStore.membersOfGroup(this.id)
    },
    // Concerts carry no group reference of their own — a concert "belongs"
    // to this group only via one of its performer credits, fetched per
    // concert (see fetchConcertExtras below, no bulk performers route).
    events () {
      return this.concertsStore.concerts
        .filter(concert => this.concertsStore.performersForConcert(concert.id).some(performer => performer.group_id === this.id))
        .sort((a, b) => a.event_datetime.localeCompare(b.event_datetime))
    },
    // Real releases via their album_details.group_id, plus merch that
    // name-matches this group (see catalogStore.artistForAlbum).
    products () {
      return this.catalogStore.storeItems.filter(item => {
        const artist = this.catalogStore.artistForAlbum(item)
        return !!artist && artist.type === 'group' && artist.id === this.id
      })
    }
  },

  watch: {
    group: {
      immediate: true,
      handler (group) {
        if (group) document.title = `${group.name} | I-Dolly`
      }
    }
  },

  created () {
    this.idolsStore.fetchAll()
    this.catalogStore.fetchAll()
    this.concertsStore.fetchAll().then(() => {
      this.concertsStore.concerts.forEach(concert => this.concertsStore.fetchConcertExtras(concert.id))
    })
  }
}
</script>

<style lang="scss" scoped>
.group-detail-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 24px 0 40px;
  overflow: hidden;
}

.hero__inner {
  position: relative;
}

.back-link {
  display: inline-block;
  color: $color-gray-500;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;

  &:hover {
    color: $color-brand;
  }
}

.hero__title {
  margin-top: 14px;
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(30px, 5vw, 48px);
  line-height: 1.05;
}

.hero__meta {
  margin-top: 8px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: $color-gray-500;
}

.hero__tagline {
  margin-top: 10px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-font-main;
}

.content {
  margin-top: 10px;
  padding-bottom: 90px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.block__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 24px;
  color: $color-ink;
}

.section-rule {
  margin-top: 8px;
  margin-bottom: 18px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, $color-brand, #f2b705, #1f8fd6, #b6379c, #1fa876);
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.not-found {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 20px;
  text-align: center;
}

.not-found__title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  color: $color-ink;
}

.not-found__link {
  color: $color-brand;
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
