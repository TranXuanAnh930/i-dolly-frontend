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
              <span class="tier__note">{{ tier.sale_method === 'lottery' ? $t('eventDetail.lotteryLabel') : $t('eventDetail.directSaleLabel') }} &middot; {{ $t('eventDetail.leftSuffix', { count: tier.total_quantity }) }}</span>
            </div>

            <div class="tier__campaign">
              <template v-if="campaignFor(tier)">
                <span class="tier__campaign-badge" :class="`tier__campaign-badge--${campaignPhase(campaignFor(tier))}`">{{ campaignStatusLabel(campaignFor(tier)) }}</span>

                <ol class="campaign-timeline">
                  <template v-for="(step, i) in timelineSteps(campaignFor(tier))" :key="step.key">
                    <li class="timeline-step" :class="{ 'is-done': step.done, 'is-active': step.active }">
                      <span class="timeline-step__dot"></span>
                      <span class="timeline-step__label">{{ step.label }}</span>
                      <span class="timeline-step__date">{{ step.date }}</span>
                    </li>
                    <li v-if="i < 1" class="timeline-line" :class="{ 'is-done': step.done }"></li>
                  </template>
                </ol>
              </template>

              <!-- A tier with no campaign row yet (not scheduled by the
                   venue's manager) — say so plainly rather than silently
                   showing nothing, whether it's a lottery or direct-sale
                   tier. -->
              <span v-else class="tier__campaign-badge tier__campaign-badge--pending">{{ $t('eventDetail.campaignNotScheduled') }}</span>
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

import { ConcertsService } from '@/services/events/concerts.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { resolveMediaUrl } from '@/utils/media'
import { fallbackPortraitFor } from '@/utils/idolPortrait'
import { formatDate, formatEventDateTime, formatNumber } from '@/utils/format'
import { withTax } from '@/utils/tax'
import UnitPill from '@/components/UnitPill.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import IdolPortrait from '@/components/IdolPortrait.vue'
import VenueSeatMap from '@/components/VenueSeatMap.vue'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'
import NotFound from '@/pages/static/NotFound.vue'

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
      campaignsByTierId: {},
      // Personalized by the concert-detail endpoint for whoever's logged
      // in — both stay false for a guest, same as a fan with neither.
      hasTicket: false,
      hasWonLottery: false,
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
      return this.concert ? formatEventDateTime(parseISO(this.concert.event_datetime)) : ''
    },
    doorsLabel () {
      return this.concert && this.concert.doors_open_at ? formatDate(parseISO(this.concert.doors_open_at), 'h:mm a') : null
    },
    // A direct-sale tier is on sale while it still has stock; a lottery
    // tier is "on sale" only while its campaign is actually open for
    // entries — a lottery tier with no campaign yet, or a closed/drawn
    // one, isn't something a fan can act on right now.
    anyTierOnSale () {
      return this.ticketTypes.some(tier => this.tierOnSale(tier))
    },
    ctaDisabled () {
      return !this.concert || this.concert.status !== 'on_sale' || !this.ticketTypes.length || !this.anyTierOnSale || this.hasTicket || this.hasWonLottery
    },
    ctaLabel () {
      if (!this.concert) return ''
      if (this.concert.status === 'sold_out') return this.$t('eventDetail.statusSoldOut')
      if (this.concert.status === 'scheduled') return this.$t('eventDetail.statusComingSoon')
      if (this.concert.status === 'completed') return this.$t('eventDetail.statusEnded')
      if (this.concert.status === 'cancelled') return this.$t('eventDetail.statusCancelled')
      // Checked ahead of the ticketTypes/anyTierOnSale fallbacks below —
      // a fan who's already secured a ticket shouldn't see a generic
      // "not available" label just because every tier they'd otherwise
      // qualify for reads as sold out or lottery-closed to them.
      if (this.hasTicket) return this.$t('eventDetail.statusAlreadyBought')
      if (this.hasWonLottery) return this.$t('eventDetail.statusAlreadyWon')
      if (!this.ticketTypes.length) return this.$t('eventDetail.statusNotOnSale')
      if (!this.anyTierOnSale) return this.$t('eventDetail.statusUnavailable')
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
      if (this.hasTicket) return this.$t('eventDetail.saleNoteAlreadyBought')
      if (this.hasWonLottery) return this.$t('eventDetail.saleNoteAlreadyWon')
      if (!this.anyTierOnSale) return this.$t('eventDetail.saleNoteUnavailable')
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
        // One call — the concert-detail endpoint now embeds every
        // campaign (lottery and direct-sale) across every tier on this
        // concert directly, so there's nothing left to fetch separately.
        const response = await ConcertsService.getDetailPublic(this.id)
        this.concert = response.data.concert
        this.venue = response.data.venue
        this.ticketTypes = response.data.ticket_types
        this.lineup = response.data.lineup
        this.performingGroups = response.data.performing_groups
        this.hasTicket = response.data.has_ticket
        this.hasWonLottery = response.data.has_won_lottery

        const campaignsByTierId = {}
        const collect = (campaigns, startKey, endKey, saleMethod) => {
          campaigns.forEach(campaign => {
            const normalized = this.normalizeCampaign(campaign, startKey, endKey, saleMethod)
            if (!campaignsByTierId[campaign.ticket_type_id]) campaignsByTierId[campaign.ticket_type_id] = []
            campaignsByTierId[campaign.ticket_type_id].push(normalized)
          })
        }
        collect(response.data.lottery_campaigns, 'entry_start_at', 'entry_end_at', 'lottery')
        collect(response.data.direct_sale_campaigns, 'sale_start_at', 'sale_end_at', 'direct')
        this.campaignsByTierId = Object.fromEntries(
          this.ticketTypes.map(tier => [tier.id, this.mostRelevantCampaign(campaignsByTierId[tier.id] || [])])
        )
      } catch {
        this.concert = null
      } finally {
        this.loading = false
      }
    },
    // LotteryCampaignRead and DirectSaleCampaignRead carry the same
    // "when is this open" shape under different field names (entry_* for
    // a lottery tier's apply window, sale_* for a direct-sale tier's
    // purchase window) — flatten both onto start_at/end_at so every other
    // method here (badge, timeline) can treat a campaign as one shape
    // regardless of which endpoint it came from. saleMethod is kept too,
    // only to pick the right wording for an "open" badge below — a
    // lottery's "open" means entries are being accepted, a direct-sale
    // tier's means it's simply on sale.
    normalizeCampaign (campaign, startKey, endKey, saleMethod) {
      return { ...campaign, start_at: campaign[startKey], end_at: campaign[endKey], sale_method: saleMethod }
    },
    // A tier can accumulate more than one campaign over time (re-run after
    // cancellation, etc.) — prefer the currently open one, otherwise fall
    // back to whichever was created most recently.
    mostRelevantCampaign (campaigns) {
      if (!campaigns.length) return null
      const open = campaigns.find(campaign => campaign.status === 'open')
      if (open) return open
      return [...campaigns].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
    },
    campaignFor (tier) {
      return this.campaignsByTierId[tier.id] || null
    },
    // campaign.status is a *lifecycle* flag a manager sets, not a live
    // reflection of the clock: nothing ever flips an 'open' row once its
    // end date passes (no sweep job exists — see payment_service's own note
    // on the same gap), so a campaign that stopped accepting entries days
    // ago still reads 'open' in the database. Every gate here derives the
    // real phase from the window instead, so the badge, the timeline and
    // the CTA can't disagree with each other.
    campaignPhase (campaign) {
      if (campaign.status !== 'open') return campaign.status
      const now = new Date()
      if (now < new Date(campaign.start_at)) return 'upcoming'
      if (now > new Date(campaign.end_at)) return 'closed'
      return 'open'
    },
    isCampaignActive (campaign) {
      return this.campaignPhase(campaign) === 'open'
    },
    // A tier is only "on sale" while its campaign is actually open and
    // inside its window — for direct-sale that's on top of still having
    // stock, matching ticket_service.checkout_ticket's own two checks
    // (open campaign, then remaining stock) so this never shows a tier as
    // available that checkout would then reject.
    tierOnSale (tier) {
      const campaign = this.campaignFor(tier)
      if (!campaign || !this.isCampaignActive(campaign)) return false
      return tier.sale_method === 'direct' ? this.remaining(tier) > 0 : true
    },
    campaignStatusLabel (campaign) {
      const phase = this.campaignPhase(campaign)
      const key = phase.charAt(0).toUpperCase() + phase.slice(1)
      // The three clock-derived phases read differently for a lottery tier
      // (entries) and a direct-sale one (a sale); 'drawn'/'completed'/
      // 'cancelled' come straight off the lifecycle and are worded once.
      const scoped = ['open', 'upcoming', 'closed'].includes(phase)
      const prefix = scoped && campaign.sale_method === 'direct' ? 'sale' : 'lottery'
      return this.$t(`eventDetail.${prefix}Status${key}`)
    },
    // Two fixed nodes (opens → closes) — a lottery campaign's draw_at is
    // only ever set retroactively by the draw job itself (NULL until
    // actually drawn, see LotteryCampaignRead's own comment) and a
    // direct-sale campaign has no draw step at all, so neither ever has a
    // third date this timeline could show ahead of time. "done" reflects
    // whichever already happened, and the first node still pending is
    // highlighted as "active" so a fan can see where the campaign
    // currently sits at a glance. A cancelled campaign never highlights a
    // node — there's no "next" step to point at.
    timelineSteps (campaign) {
      const now = new Date()
      const started = now >= new Date(campaign.start_at)
      const closed = campaign.status !== 'open' || now >= new Date(campaign.end_at)

      const steps = [
        { key: 'start', label: this.$t('eventDetail.lotteryTimelineOpens'), date: this.formatCampaignDate(campaign.start_at), done: started },
        { key: 'end', label: this.$t('eventDetail.lotteryTimelineCloses'), date: this.formatCampaignDate(campaign.end_at), done: closed }
      ]

      if (campaign.status !== 'cancelled') {
        const activeStep = steps.find(step => !step.done)
        if (activeStep) activeStep.active = true
      }

      return steps
    },
    formatCampaignDate (date) {
      return formatDate(parseISO(date), 'MMM d')
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
  gap: 20px;

  @include media_mobile {
    flex-wrap: wrap;
    row-gap: 10px;
  }
}

.tier__info {
  flex: 1;
  min-width: 0;
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

.tier__campaign {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;

  @include media_mobile {
    align-items: flex-start;
    width: 100%;
    order: 1;
  }
}

.tier__campaign-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 2px 9px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: .02em;

  &--open {
    background: #e9f2fb;
    color: #2a6fa8;
  }

  &--upcoming {
    background: #fdf1dd;
    color: #8a5a11;
  }

  // Same muted treatment as a completed campaign — the window is over
  // either way, the only difference is whether a manager has said so yet.
  &--closed {
    background: $color-gray-100;
    color: $color-gray-500;
  }

  &--drawn {
    background: #e6f7ef;
    color: #147a52;
  }

  &--completed {
    background: $color-gray-100;
    color: $color-gray-500;
  }

  &--cancelled {
    background: $color-gray-100;
    color: $color-gray-500;
  }

  &--pending {
    background: $color-gray-100;
    color: $color-gray-500;
    font-style: italic;
    text-transform: none;
  }
}

.campaign-timeline {
  display: flex;
  align-items: flex-start;
  list-style: none;
}

.timeline-step {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 60px;
  text-align: center;
}

.timeline-step__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: $color-white;
  border: 2px solid $color-line;
}

.timeline-step.is-done .timeline-step__dot {
  background: #1fa876;
  border-color: #1fa876;
}

.timeline-step.is-active .timeline-step__dot {
  background: $color-white;
  border-color: $color-brand;
  box-shadow: 0 0 0 3px $color-brand-tint;
}

.timeline-step__label {
  margin-top: 2px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .02em;
  color: $color-gray-400;
}

.timeline-step.is-done .timeline-step__label,
.timeline-step.is-active .timeline-step__label {
  color: $color-ink;
}

.timeline-step__date {
  font-family: $font-content;
  font-size: 11px;
  color: $color-gray-400;
  white-space: nowrap;
}

.timeline-line {
  flex: 1;
  min-width: 12px;
  height: 2px;
  margin-top: 5px;
  background: $color-line;

  &.is-done {
    background: #1fa876;
  }
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
