<template>
  <UiPageLoader v-if="loading"/>

  <div v-else-if="member" class="idol-detail-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <router-link to="/members" class="back-link">&larr; {{ $t('idolDetail.backToMembers') }}</router-link>

        <div class="hero__layout">
          <div class="portrait-frame" :style="{ backgroundColor: color.hex }">
            <img v-if="photoUrl" :src="photoUrl" :alt="member.name" class="portrait-photo">
            <IdolPortrait v-else :name="member.name" v-bind="fallbackPortrait" :accent="color.hex"/>
          </div>

          <div class="hero__info">
            <router-link class="hero__unit" v-if="group" :to="`/groups/${group.id}`">{{ group.name }}</router-link>
            <h1 class="hero__name" :style="{ color: color.hex }">{{ member.name }}</h1>
            <p class="hero__tagline" v-if="group && group.description">{{ group.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="wrapper content">
      <div class="stats" v-if="positionsLabel || group || member.hometown || birthdayLabel">
        <div class="stat" v-if="positionsLabel">
          <span class="stat__label">{{ $t('idolDetail.position') }}</span>
          <span class="stat__value">{{ positionsLabel }}</span>
        </div>
        <div class="stat" v-if="group">
          <span class="stat__label">{{ $t('idolDetail.unit') }}</span>
          <span class="stat__value">{{ group.name }}</span>
        </div>
        <div class="stat" v-if="member.hometown">
          <span class="stat__label">{{ $t('idolDetail.hometown') }}</span>
          <span class="stat__value">{{ member.hometown }}</span>
        </div>
        <div class="stat" v-if="birthdayLabel">
          <span class="stat__label">{{ $t('idolDetail.birthday') }}</span>
          <span class="stat__value">{{ birthdayLabel }}</span>
        </div>
      </div>

      <p class="description" v-if="description">{{ description }}</p>

      <div v-if="relatedIdols.length" class="bandmates">
        <h2 class="bandmates__title">{{ relatedTitle }}</h2>
        <div class="bandmates__list">
          <router-link
            v-for="peer in relatedIdols"
            :key="peer.id"
            :to="`/members/${peer.id}`"
            class="bandmate-row">
            <div class="bandmate-row__portrait" :style="{ backgroundColor: colorFor(peer).hex }">
              <img v-if="photoFor(peer)" :src="photoFor(peer)" :alt="peer.name" class="bandmate-row__photo">
              <IdolPortrait v-else :name="peer.name" v-bind="fallbackPortraitFor(peer, colorFor(peer).hex)" :accent="colorFor(peer).hex"/>
            </div>
            <div class="bandmate-row__info">
              <span class="bandmate-row__name">{{ peer.name }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <p class="not-found__title">{{ idolsStore.error || $t('idolDetail.notFound') }}</p>
    <router-link to="/members" class="not-found__link">&larr; {{ $t('idolDetail.backLink') }}</router-link>
  </div>
</template>

<script>
import { parseISO } from 'date-fns'

import { useIdolsStore } from '@/store/idols'
import { resolveMediaUrl } from '@/utils/media'
import { fallbackPortraitFor } from '@/utils/idolPortrait'
import { formatDate } from '@/utils/format'
import IdolPortrait from '@/components/IdolPortrait.vue'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'

export default {
  name: 'IdolDetailPage',

  components: { IdolPortrait, UiPageLoader },

  props: {
    id: { type: String, required: true }
  },

  computed: {
    idolsStore () {
      return useIdolsStore()
    },
    loading () {
      return this.idolsStore.loading && !this.idolsStore.loaded
    },
    member () {
      return this.idolsStore.idolById(this.id)
    },
    group () {
      return this.member ? this.idolsStore.groupById(this.member.group_id) : null
    },
    color () {
      return this.idolsStore.colorForIdol(this.member)
    },
    photoUrl () {
      return this.member ? resolveMediaUrl(this.member.profile_image_url) : null
    },
    description () {
      return this.member ? (this.member.long_description || this.member.short_intro) : null
    },
    birthdayLabel () {
      if (!this.member || !this.member.date_of_birth) return null
      return formatDate(parseISO(this.member.date_of_birth), 'MMM d, yyyy')
    },
    fallbackPortrait () {
      return this.member ? fallbackPortraitFor(this.member, this.color.hex) : null
    },
    // Primary credit first (e.g. "Leader"), then any secondary ones.
    positionsLabel () {
      if (!this.member) return null
      const positions = [...this.idolsStore.positionsForIdol(this.member.id)]
        .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
      return positions.map(p => p.position.name).join(' · ') || null
    },
    bandmates () {
      // Solo idols have group_id: null — without this guard,
      // membersOfGroup(null) would match every other soloist instead of
      // correctly returning no bandmates.
      if (!this.member || !this.member.group_id) return []
      return this.idolsStore.membersOfGroup(this.member.group_id).filter(idol => idol.id !== this.member.id)
    },
    // Solo idols get the solo-roster equivalent of bandmates — other idols
    // with no group_id of their own.
    soloPeers () {
      if (!this.member || this.member.group_id) return []
      return this.idolsStore.soloIdols.filter(idol => idol.id !== this.member.id)
    },
    relatedIdols () {
      return this.member && this.member.group_id ? this.bandmates : this.soloPeers
    },
    relatedTitle () {
      return this.member && this.member.group_id
        ? this.$t('idolDetail.alsoIn', { name: this.group.name })
        : this.$t('idolDetail.otherSoloIdols')
    }
  },

  watch: {
    member: {
      immediate: true,
      handler (member) {
        if (member) document.title = `${member.name} | I-Dolly`
      }
    },
    id: {
      immediate: true,
      handler (id) {
        this.idolsStore.fetchAll()
        this.idolsStore.fetchPositionsForIdol(id)
      }
    }
  },

  methods: {
    fallbackPortraitFor,
    colorFor (idol) {
      return this.idolsStore.colorForIdol(idol)
    },
    photoFor (idol) {
      return resolveMediaUrl(idol.profile_image_url)
    }
  }
}
</script>

<style lang="scss" scoped>
.idol-detail-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 24px 0 50px;
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

.hero__layout {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 28px;

  @include media_mobile {
    flex-direction: column;
    text-align: center;
  }
}

.portrait-frame {
  flex: none;
  width: 180px;
  aspect-ratio: 5 / 6;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px -16px rgba($color-ink, .3);
}

.portrait-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.hero__unit {
  display: inline-block;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: $color-gray-500;
  text-decoration: none;

  &:hover {
    color: $color-brand;
    text-decoration: underline;
  }
}

.hero__name {
  margin-top: 4px;
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(30px, 5vw, 48px);
  line-height: 1.05;
}

.hero__tagline {
  margin-top: 10px;
  font-family: $font-content;
  font-size: 14px;
  color: $color-font-main;
}

.content {
  margin-top: 10px;
  position: relative;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 1px;
  background: $color-line;
  border: 1px solid $color-line;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
}

.stat {
  background: $color-white;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: $color-gray-400;
}

.stat__value {
  font-family: $font-content;
  font-weight: 700;
  font-size: 15px;
  color: $color-ink;
}

.description {
  background: $color-white;
  border-radius: 20px;
  padding: 22px 24px;
  font-family: $font-content;
  font-size: 15px;
  line-height: 1.6;
  color: $color-font-main;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
}

.bandmates__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 22px;
  color: $color-ink;
  margin-bottom: 14px;
}

.bandmates__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.bandmate-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: $color-white;
  border-radius: 16px;
  padding: 10px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
  transition: transform .15s ease, box-shadow .15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -10px rgba($color-ink, .25);
  }
}

.bandmate-row__portrait {
  flex: none;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
}

.bandmate-row__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.bandmate-row__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.bandmate-row__name {
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
