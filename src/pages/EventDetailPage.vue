<template>
  <UiPageLoader v-if="loading"/>

  <div v-else-if="concert" class="event-detail-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <router-link to="/events" class="back-link">&larr; {{ $t('eventDetail.backToEvents') }}</router-link>

        <div class="hero__tags">
          <router-link v-for="group in performingGroups" :key="group.id" :to="`/groups/${group.id}`" class="unit-link">
            <UnitPill :unit="unitFor(group)"/>
          </router-link>
          <StatusBadge :status="concert.status"/>
        </div>

        <h1 class="hero__title" :style="{ color: color.hex }">{{ concert.title }}</h1>
        <p class="hero__meta">{{ dateLabel }}<template v-if="venue"> &middot; {{ venue.name }}</template></p>
      </div>
    </section>

    <div class="wrapper content">
      <div class="info-table">
        <div class="info-row">
          <span class="info-row__label">{{ $t('eventDetail.eventDate') }}</span>
          <span class="info-row__value">
            {{ dateLabel }}
            <template v-if="doorsLabel"> &middot; {{ $t('events.doorsAt', { time: doorsLabel }) }}</template>
          </span>
        </div>
        <div class="info-row" v-if="venue">
          <span class="info-row__label">{{ $t('eventDetail.venue') }}</span>
          <span class="info-row__value">{{ venue.name }}<template v-if="venue.city"> &middot; {{ venue.city }}</template></span>
        </div>
      </div>

      <section class="block" v-if="lineup.length">
        <h2 class="block__title">{{ $t('eventDetail.lineup') }}</h2>
        <div class="section-rule"></div>
        <p class="block__lead" v-if="performingGroupNames">{{ performingGroupNames }}</p>

        <div class="lineup-list">
          <router-link v-for="member in lineup" :key="member.id" :to="`/members/${member.id}`" class="lineup-row">
            <div class="lineup-row__portrait" :style="{ backgroundColor: colorFor(member).hex }">
              <img v-if="photoFor(member)" :src="photoFor(member)" :alt="member.name" class="lineup-row__photo">
              <IdolPortrait v-else :name="member.name" v-bind="fallbackPortraitFor(member, colorFor(member).hex)" :accent="colorFor(member).hex"/>
            </div>
            <div class="lineup-row__info">
              <span class="lineup-row__name">{{ member.name }}</span>
            </div>
          </router-link>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">{{ $t('eventDetail.tickets') }}</h2>
        <div class="section-rule"></div>

        <div class="tiers" v-if="ticketTypes.length">
          <div class="tier" v-for="tier in ticketTypes" :key="tier.id">
            <div class="tier__info">
              <span class="tier__name">{{ tierLabel(tier) }}</span>
              <span class="tier__note">{{ tier.sale_method === 'lottery' ? $t('eventDetail.lotteryLabel') : $t('eventDetail.directSaleLabel') }} &middot; {{ $t('eventDetail.leftSuffix', { count: remaining(tier) }) }}</span>
            </div>
            <span class="tier__price-block">
              <span class="tier__price">&yen;{{ formatNumber(tier.price) }}</span>
              <span class="tier__price-tax">{{ $t('store.taxIncluded', { price: formatNumber(withTax(tier.price)) }) }}</span>
            </span>
          </div>
        </div>

        <h3 class="subhead">{{ $t('eventDetail.seatMap') }}</h3>
        <VenueSeatMap class="seat-map"/>

        <div class="sale-panel">
          <p class="sale-panel__note">{{ saleNote }}</p>
          <component
            :is="ctaDisabled ? 'span' : 'router-link'"
            :to="ctaDisabled ? undefined : ctaTo"
            class="cta-btn"
            :class="{ 'is-disabled': ctaDisabled }">
            {{ ctaLabel }}
          </component>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">{{ $t('eventDetail.goodToKnow') }}</h2>
        <div class="section-rule"></div>

        <div class="accordion">
          <details class="accordion-item" open>
            <summary>
              {{ $t('eventDetail.eventGuidelines') }}
              <svg class="accordion-item__chevron" viewBox="0 0 20 20"><path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </summary>
            <ul class="accordion-item__list">
              <li>{{ $t('guidelines.venueItem1') }}</li>
              <li>{{ $t('guidelines.venueItem2') }}</li>
              <li>{{ $t('guidelines.venueItem3') }}</li>
              <li>{{ $t('guidelines.venueItem4') }}</li>
            </ul>
          </details>

          <details class="accordion-item" open>
            <summary>
              {{ $t('eventDetail.qa') }}
              <svg class="accordion-item__chevron" viewBox="0 0 20 20"><path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </summary>
            <dl class="accordion-item__qa">
              <div class="qa-pair">
                <dt>{{ $t('eventDetail.qaRefundQ') }}</dt>
                <dd>{{ $t('eventDetail.qaRefundA') }}</dd>
              </div>
              <div class="qa-pair">
                <dt>{{ $t('eventDetail.qaTransferQ') }}</dt>
                <dd>{{ $t('eventDetail.qaTransferA') }}</dd>
              </div>
              <div class="qa-pair" v-if="hasLotteryTickets">
                <dt>{{ $t('eventDetail.qaLotteryQ') }}</dt>
                <dd>{{ $t('eventDetail.qaLotteryA') }}</dd>
              </div>
              <div class="qa-pair">
                <dt>{{ $t('eventDetail.qaAgeQ') }}</dt>
                <dd>{{ $t('eventDetail.qaAgeA') }}</dd>
              </div>
            </dl>
          </details>
        </div>
      </section>
    </div>
  </div>

  <NotFound v-else/>
</template>

<script>
import { parseISO } from 'date-fns'

import { ConcertsService } from '@/services/concerts.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { resolveMediaUrl } from '@/utils/media'
import { fallbackPortraitFor } from '@/utils/idolPortrait'
import { formatDate, formatNumber } from '@/utils/format'
import { withTax } from '@/utils/tax'
import UnitPill from '@/components/UnitPill.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import IdolPortrait from '@/components/IdolPortrait.vue'
import VenueSeatMap from '@/components/VenueSeatMap.vue'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'
import NotFound from '@/pages/NotFound.vue'

export default {
  name: 'EventDetailPage',

  components: { UnitPill, StatusBadge, IdolPortrait, VenueSeatMap, UiPageLoader, NotFound },

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      concert: null,
      venue: null,
      ticketTypes: [],
      lineup: [],
      performingGroups: [],
      loading: true
    }
  },

  computed: {
    // Concerts carry no color of their own — fall back to a stable
    // palette pick so the hero still reads as themed rather than gray.
    color () {
      const hex = this.concert ? paletteColorForId(this.concert.id) : '#cccccc'
      return { hex, text: contrastTextColor(hex) }
    },
    directTicketTypes () {
      return this.ticketTypes.filter(tier => tier.sale_method === 'direct')
    },
    hasLotteryTickets () {
      return this.ticketTypes.some(tier => tier.sale_method === 'lottery')
    },
    performingGroupNames () {
      return this.performingGroups.map(group => group.name).join(', ')
    },
    dateLabel () {
      return this.concert ? formatDate(parseISO(this.concert.event_datetime), 'EEE, MMM d, yyyy · h:mm a') : ''
    },
    doorsLabel () {
      return this.concert && this.concert.doors_open_at ? formatDate(parseISO(this.concert.doors_open_at), 'h:mm a') : null
    },
    ctaDisabled () {
      return !this.concert || this.concert.status !== 'on_sale' || !this.ticketTypes.length
    },
    ctaLabel () {
      if (!this.concert) return ''
      if (this.concert.status === 'sold_out') return this.$t('eventDetail.statusSoldOut')
      if (this.concert.status === 'scheduled') return this.$t('eventDetail.statusComingSoon')
      if (this.concert.status === 'completed') return this.$t('eventDetail.statusEnded')
      if (this.concert.status === 'cancelled') return this.$t('eventDetail.statusCancelled')
      if (!this.ticketTypes.length) return this.$t('eventDetail.statusNotOnSale')
      return this.$t('eventDetail.ctaApply')
    },
    ctaTo () {
      return this.concert ? `/events/${this.concert.id}/seats` : ''
    },
    saleNote () {
      if (!this.concert) return ''
      if (this.concert.status === 'sold_out') return this.$t('eventDetail.saleNoteSoldOut')
      if (this.concert.status === 'scheduled') return this.$t('eventDetail.saleNoteScheduled')
      if (this.concert.status === 'completed') return this.$t('eventDetail.saleNoteCompleted')
      if (this.concert.status === 'cancelled') return this.$t('eventDetail.saleNoteCancelled')
      if (!this.directTicketTypes.length) return this.$t('eventDetail.saleNoteLotteryOnly')
      return this.$t('eventDetail.saleNoteDefault')
    }
  },

  watch: {
    concert (concert) {
      if (concert) document.title = `${concert.title} | I-Dolly`
    },
    id: {
      immediate: true,
      handler () {
        this.fetchPage()
      }
    }
  },

  methods: {
    formatNumber,
    withTax,
    fallbackPortraitFor,
    async fetchPage () {
      this.loading = true
      try {
        const response = await ConcertsService.getDetailPublic(this.id)
        this.concert = response.data.concert
        this.venue = response.data.venue
        this.ticketTypes = response.data.ticket_types
        this.lineup = response.data.lineup
        this.performingGroups = response.data.performing_groups
      } catch {
        this.concert = null
      } finally {
        this.loading = false
      }
    },
    // The idol's real color (embedded by the backend, on the lineup entry)
    // when set, otherwise the same stable palette fallback used elsewhere.
    colorFor (idol) {
      const hex = idol.color_hex || paletteColorForId(idol.id)
      return { hex, text: contrastTextColor(hex) }
    },
    photoFor (idol) {
      return resolveMediaUrl(idol.profile_image_url)
    },
    // Groups carry no color of their own — same stable palette fallback.
    unitFor (group) {
      const hex = paletteColorForId(group.id)
      return { id: group.id, name: group.name, color: hex, textColor: contrastTextColor(hex) }
    },
    tierLabel (tier) {
      return tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)
    },
    remaining (tier) {
      return Math.max(0, tier.total_quantity - tier.sold_quantity)
    }
  }
}
</script>

<style lang="scss" scoped>
.event-detail-page {
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

.hero__tags {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.unit-link {
  display: inline-flex;
  text-decoration: none;
  transition: transform .12s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

.hero__title {
  margin-top: 14px;
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(20px, 4.6vw, 44px);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @include media_mobile {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }
}

.hero__meta {
  margin-top: 10px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-font-main;
}

.content {
  margin-top: 10px;
  position: relative;
  padding-bottom: 90px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.info-table {
  background: $color-white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
}

.info-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid $color-line;

  &:last-child {
    border-bottom: none;
  }

  @include media_mobile {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

.info-row__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-brand;
}

.info-row__value {
  font-family: $font-content;
  font-size: 14px;
  color: $color-ink;
}

.block__title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 24px;
  color: $color-ink;
}

.section-rule {
  margin-top: 8px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, $color-brand, #f2b705, #1f8fd6, #b6379c, #1fa876);
}

.block__lead {
  margin-top: 16px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-font-main;
}

.lineup-list {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.lineup-row {
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

.lineup-row__portrait {
  flex: none;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
}

.lineup-row__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.lineup-row__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.lineup-row__name {
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tiers {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: $color-line;
  border: 1px solid $color-line;
  border-radius: 16px;
  overflow: hidden;
}

.tier {
  background: $color-white;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tier__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tier__name {
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
}

.tier__note {
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-400;
}

.tier__price-block {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.tier__price {
  font-family: $font-content;
  font-weight: 900;
  font-size: 16px;
  color: $color-ink;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.tier__price-tax {
  font-family: $font-content;
  font-size: 11px;
  color: $color-gray-400;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.subhead {
  margin-top: 24px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: $color-gray-500;
}

.seat-map {
  margin-top: 12px;
  max-width: 420px;
}

.sale-panel {
  margin-top: 20px;
  background: $color-white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
}

.sale-panel__note {
  font-family: $font-content;
  font-size: 13px;
  color: $color-font-main;
}

.cta-btn {
  border: none;
  border-radius: 999px;
  padding: 14px 28px;
  background: $color-brand;
  color: $color-white;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

  &:hover {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }

  &.is-disabled {
    background: $color-gray-200;
    color: $color-gray-500;
    box-shadow: none;
    cursor: default;
  }
}

.accordion {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.accordion-item {
  background: $color-white;
  border-radius: 16px;
  padding: 4px 20px;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);

  summary {
    list-style: none;
    padding: 16px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    font-family: $font-content;
    font-weight: 700;
    font-size: 15px;
    color: $color-ink;

    &::-webkit-details-marker {
      display: none;
    }
  }

  &[open] summary {
    border-bottom: 1px solid $color-line;
  }
}

.accordion-item__chevron {
  width: 18px;
  height: 18px;
  flex: none;
  color: $color-brand;
  transition: transform .2s ease;

  [open] & {
    transform: rotate(180deg);
  }
}

.accordion-item__list {
  padding: 16px 0 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  list-style: disc;

  li {
    font-family: $font-content;
    font-size: 13.5px;
    line-height: 1.5;
    color: $color-font-main;
  }
}

.accordion-item__qa {
  padding: 4px 0 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qa-pair dt {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13.5px;
  color: $color-ink;
}

.qa-pair dd {
  margin-top: 4px;
  font-family: $font-content;
  font-size: 13.5px;
  line-height: 1.5;
  color: $color-font-main;
}

</style>
