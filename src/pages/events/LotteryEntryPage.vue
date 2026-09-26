<template>
  <UiPageLoader v-if="loading"/>

  <div v-else-if="eligible" class="lottery-entry-page">
    <section class="hero">
      <div class="wrapper hero__inner">
        <router-link :to="`/events/${id}`" class="back-link">&larr; {{ concert.title }}</router-link>
        <p class="hero__eyebrow">{{ $t('ticketPurchase.lotteryEntry') }}</p>
        <h1 class="hero__title" :style="{ color: color.hex }">{{ isEditing ? $t('lotteryEntry.editModeTitle') : $t('lotteryEntry.title') }}</h1>

        <ol class="steps">
          <li class="step" :class="stepClass(1)">
            <span class="step__dot">{{ step > 1 ? '&check;' : '1' }}</span>
            <span class="step__label">{{ $t('lotteryEntry.stepEntry') }}</span>
          </li>
          <li class="step-line" :class="{ 'is-done': step > 1 }"></li>
          <li class="step" :class="stepClass(2)">
            <span class="step__dot">{{ step > 2 ? '&check;' : '2' }}</span>
            <span class="step__label">{{ $t('lotteryEntry.stepPreferences') }}</span>
          </li>
          <li class="step-line" :class="{ 'is-done': step > 2 }"></li>
          <li class="step" :class="stepClass(3)">
            <span class="step__dot">{{ step > 3 ? '&check;' : '3' }}</span>
            <span class="step__label">{{ $t('lotteryEntry.stepConfirm') }}</span>
          </li>
          <li class="step-line" :class="{ 'is-done': step > 3 }"></li>
          <li class="step" :class="stepClass(4)">
            <span class="step__dot">4</span>
            <span class="step__label">{{ $t('ticketPurchase.stepDone') }}</span>
          </li>
        </ol>
      </div>
    </section>

    <div class="wrapper content">
      <!-- Step 1: select entry -->
      <div v-if="step === 1" class="panel">
        <h2 class="panel-title">{{ $t('lotteryEntry.introTitle', { title: concert.title }) }}</h2>
        <p class="panel-hint">{{ $t('lotteryEntry.introBody') }}</p>

        <div class="tier-list">
          <div v-for="entry in lotteryTiers" :key="entry.tier.id" class="tier-row">
            <span class="tier-row__name">{{ tierLabel(entry.tier) }}</span>
            <span class="tier-row__meta">{{ $t('eventDetail.leftSuffix', { count: entry.tier.total_quantity }) }}</span>
            <span class="tier-row__price">&yen;{{ formatNumber(withTax(entry.tier.price)) }}</span>
          </div>
        </div>

        <button type="button" class="continue-btn" @click="step = 2">{{ $t('lotteryEntry.startEntry') }} →</button>
      </div>

      <!-- Step 2: rank preferences (one slot per lottery tier on this concert) -->
      <div v-else-if="step === 2" class="panel">
        <h2 class="panel-title">{{ $t('lotteryEntry.preferencesTitle') }}</h2>
        <p class="panel-hint">{{ $t('lotteryEntry.preferencesHint') }}</p>

        <template v-for="(choiceId, i) in choices" :key="i">
          <label class="field" v-if="i === 0 || choices[i - 1]">
            <span class="field__label">{{ $t('lotteryEntry.rankLabel', { rank: i + 1 }) }}</span>
            <select v-model="choices[i]" @change="onSelectChange(i)">
              <option value="">{{ $t('lotteryEntry.selectTierPlaceholder') }}</option>
              <option v-for="entry in optionsForRank(i)" :key="entry.tier.id" :value="entry.tier.id">
                {{ tierLabel(entry.tier) }} — &yen;{{ formatNumber(withTax(entry.tier.price)) }}
              </option>
            </select>
            <!-- Just a default, not a lock — a fan can freely swap this
                 rank out. If they do, their existing entry for this tier
                 (if any) stays as-is; there's no way to withdraw one. -->
            <span v-if="lockedTierIds.includes(choices[i])" class="field__note">{{ $t('lotteryEntry.lockedExistingNote') }}</span>
          </label>
        </template>

        <div class="form-actions">
          <button v-if="!isEditing" type="button" class="back-btn" @click="step = 1">&larr; {{ $t('ticketPurchase.back') }}</button>
          <button type="button" class="continue-btn" :disabled="!canProceedPreferences" @click="step = 3">{{ $t('lotteryEntry.reviewEntry') }} →</button>
        </div>
      </div>

      <!-- Step 3: confirm -->
      <div v-else-if="step === 3" class="panel">
        <h2 class="panel-title">{{ isEditing ? $t('lotteryEntry.updateReviewTitle') : $t('lotteryEntry.confirmTitle') }}</h2>
        <p class="panel-hint">{{ isEditing ? $t('lotteryEntry.updateReviewHint') : $t('lotteryEntry.confirmHint') }}</p>

        <div class="choice-list">
          <div class="choice-row" v-for="(tierId, i) in filledChoices" :key="tierId">
            <span class="choice-row__rank">{{ $t('lotteryEntry.rankLabel', { rank: i + 1 }) }}</span>
            <span class="choice-row__name">{{ tierLabel(tierById(tierId)) }}</span>
            <span class="choice-row__price">&yen;{{ formatNumber(withTax(tierById(tierId).price)) }}</span>
          </div>
        </div>

        <p class="confirm-note">{{ $t('lotteryEntry.confirmNote') }}</p>

        <p class="form-error" v-if="error">{{ error }}</p>

        <div class="form-actions">
          <button type="button" class="back-btn" :disabled="submitting" @click="step = 2">&larr; {{ $t('ticketPurchase.back') }}</button>
          <button type="button" class="continue-btn" :disabled="submitting" @click="confirmEntry">{{ submitting ? $t('common.saving') : (isEditing ? $t('lotteryEntry.updateEntry') : $t('lotteryEntry.confirmEntry')) }}</button>
        </div>
      </div>

      <!-- Step 4: done -->
      <div v-else class="confirmation">
        <div class="confirmation__badge">&check;</div>
        <h2 class="confirmation__title">{{ isEditing ? $t('lotteryEntry.updatedTitle') : $t('ticketPurchase.appliedTitle') }}</h2>
        <p class="confirmation__note">{{ isEditing ? $t('lotteryEntry.updateSuccessNote', { title: concert.title }) : $t('lotteryEntry.successNote', { title: concert.title }) }}</p>
        <div class="confirmation__actions">
          <router-link to="/history" class="confirmation__btn">{{ $t('ticketPurchase.viewHistory') }}</router-link>
          <router-link to="/events" class="confirmation__link">{{ $t('ticketPurchase.backToEvents') }}</router-link>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <p class="not-found__title">{{ ineligibleMessage }}</p>
    <router-link :to="concert ? `/events/${concert.id}` : '/events'" class="not-found__link">&larr; {{ $t('ticketPurchase.backToEvent') }}</router-link>
  </div>
</template>

<script>
import { useLotteryEntriesStore } from '@/store/events/lotteryEntries'
import { useToastStore } from '@/store/toast'
import { ConcertsService } from '@/services/events/concerts.service'
import { LotteryService } from '@/services/events/lottery.service'
import { paletteColorForId, contrastTextColor } from '@/utils/palette'
import { formatNumber } from '@/utils/format'
import { withTax } from '@/utils/tax'
import UiPageLoader from '@/components/progress-loaders/UiPageLoader.vue'

export default {
  name: 'LotteryEntryPage',

  components: { UiPageLoader },

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      loading: true,
      concert: null,
      lotteryTiers: [], // [{ tier, campaign }] — only tiers with a currently-open campaign
      step: 1,
      choices: [], // rank-ordered tier ids, one slot per lotteryTiers entry — pre-filled with defaults, always freely editable
      // Tier ids the fan already has a LotteryEntry for. Purely
      // informational in the UI (a fan can still swap one of these out —
      // there's just no way to withdraw the entry itself once made, so
      // doing so leaves that entry orphaned from the new ranking); also
      // used at submit time to skip re-calling apply() for a tier that
      // already has one.
      lockedTierIds: [],
      isEditing: false,
      submitting: false,
      error: ''
    }
  },

  computed: {
    color () {
      const hex = this.concert ? paletteColorForId(this.concert.id) : '#cccccc'
      return { hex, text: contrastTextColor(hex) }
    },
    eligible () {
      return !!this.concert && this.concert.status === 'on_sale' && this.lotteryTiers.length > 0
    },
    ineligibleMessage () {
      if (!this.concert) return this.$t('ticketPurchase.ineligibleNotFound')
      return this.$t('lotteryEntry.ineligibleNoCampaign')
    },
    // Every rank past the 1st is optional — a fan can submit with just
    // their 1st pick and skip ranking the rest.
    canProceedPreferences () {
      return !!this.choices[0]
    },
    filledChoices () {
      return this.choices.filter(Boolean)
    }
  },

  watch: {
    concert: {
      immediate: true,
      handler (concert) {
        if (concert) document.title = `Lottery · ${concert.title} | I-Dolly`
      }
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
    stepClass (n) {
      return { 'is-active': this.step === n, 'is-done': this.step > n }
    },
    tierLabel (tier) {
      return tier ? tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1) : ''
    },
    tierById (id) {
      const entry = this.lotteryTiers.find(entry => entry.tier.id === id)
      return entry ? entry.tier : null
    },
    campaignById (id) {
      const entry = this.lotteryTiers.find(entry => entry.tier.id === id)
      return entry ? entry.campaign : null
    },
    // Tiers already picked at another rank can't be picked again — a rank's
    // own current choice stays in its list so re-selecting it (or leaving
    // it as-is) still works.
    optionsForRank (rankIndex) {
      const chosenElsewhere = this.choices.filter((id, i) => i !== rankIndex && id)
      return this.lotteryTiers.filter(entry => !chosenElsewhere.includes(entry.tier.id))
    },
    // Changing a rank invalidates every rank after it (its own options
    // list just changed), so those are reset rather than left stale.
    clearFrom (startIndex) {
      for (let i = startIndex; i < this.choices.length; i++) this.choices[i] = ''
    },
    // A campaign is enterable right now if it's still open and today falls
    // inside its entry window — mirrors what the backend's apply()/set()
    // triggers would reject anyway, just surfaced before the fan fills in
    // two steps' worth of choices instead of after.
    isEntryOpen (campaign) {
      const now = new Date()
      return campaign.status === 'open' && now >= new Date(campaign.entry_start_at) && now <= new Date(campaign.entry_end_at)
    },
    async fetchPage () {
      this.loading = true
      try {
        // One call — the concert-detail endpoint embeds this concert's
        // ticket types, every lottery campaign across them, and (for
        // whoever's logged in) which of those campaigns they've already
        // entered and their existing preference ranking. Nothing here
        // needs a second request.
        const response = await ConcertsService.getDetailPublic(this.id)
        this.concert = response.data.concert

        const campaignsByTierId = {}
        response.data.lottery_campaigns.forEach(campaign => {
          if (!campaignsByTierId[campaign.ticket_type_id]) campaignsByTierId[campaign.ticket_type_id] = []
          campaignsByTierId[campaign.ticket_type_id].push(campaign)
        })
        const lotteryTypes = response.data.ticket_types.filter(tier => tier.sale_method === 'lottery')
        this.lotteryTiers = lotteryTypes
          .map(tier => {
            const campaign = (campaignsByTierId[tier.id] || []).find(this.isEntryOpen)
            return campaign ? { tier, campaign } : null
          })
          .filter(Boolean)
        this.choices = new Array(this.lotteryTiers.length).fill('')

        // A fan who already has entries/preferences for this concert is
        // editing, not applying fresh — pre-fill their current ranking and
        // skip straight to the preferences step instead of the intro.
        const enteredCampaignIds = new Set(response.data.entered_campaign_ids)
        this.lockedTierIds = this.lotteryTiers
          .filter(entry => enteredCampaignIds.has(entry.campaign.id))
          .map(entry => entry.tier.id)

        const existingRanked = response.data.my_lottery_preferences
          .slice()
          .sort((a, b) => a.rank - b.rank)
          .map(preference => preference.ticket_type_id)
          .filter(tierId => this.lotteryTiers.some(entry => entry.tier.id === tierId))

        if (existingRanked.length || this.lockedTierIds.length) {
          this.isEditing = true
          this.step = 2
          existingRanked.forEach((tierId, i) => { this.choices[i] = tierId })
        } else {
          const preselected = this.$route.query.tier
          if (preselected && this.lotteryTiers.some(entry => entry.tier.id === preselected)) {
            this.choices[0] = preselected
          }
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    // Picking a different tier for rank i can collide with whatever a
    // later rank already holds (optionsForRank only excludes duplicates at
    // the moment each select renders, not retroactively) — clearing
    // everything after i resolves that the same way changing rank 1 used
    // to reset the whole chain, then compaction reflows what's left.
    // Picking the empty placeholder instead can't create a duplicate, so
    // later ranks are left alone — compaction just shifts them up to fill
    // the gap instead of erasing them.
    onSelectChange (i) {
      if (this.choices[i]) this.clearFrom(i + 1)
      this.compactChoices()
    },
    // Keeps every filled choice contiguous from index 0. Without this, a
    // cleared middle rank leaves a gap: the template's "only show the next
    // rank once the previous one is filled" guard would hide any rank
    // after the gap, but filledChoices' flat filter would still submit it —
    // the two would disagree on what the fan is actually seeing.
    compactChoices () {
      const filled = this.choices.filter(Boolean)
      this.choices = [...filled, ...new Array(this.lotteryTiers.length - filled.length).fill('')]
    },
    async confirmEntry () {
      this.submitting = true
      this.error = ''
      try {
        const idsInOrder = this.filledChoices
        await LotteryService.setPreferences(this.concert.id, idsInOrder)

        // Only apply for tiers that don't already have an entry — applying
        // again for one that does would just hit "cap_reached" (one entry
        // per fan per campaign — max_entries_per_user isn't settable
        // client-side and always stays 1, see docs/bugs.md #6 in the
        // backend repo), since setPreferences above only touches the
        // ranking, never the entries themselves.
        //
        // One batch call rather than one per tier: the apply endpoint allows
        // 3/60s per fan, so a per-tier loop would 429 the tail of a submission
        // on a concert with more tiers than that — and leave the earlier tiers
        // already committed. The batch is all-or-nothing for one slot.
        const newTierIds = idsInOrder.filter(tierId => !this.lockedTierIds.includes(tierId))
        if (newTierIds.length) {
          const campaignIds = newTierIds.map(tierId => this.campaignById(tierId).id)
          const entriesResponse = await LotteryService.applyToEntries(campaignIds)
          entriesResponse.data.forEach(entry => useLotteryEntriesStore().add(entry))
        }

        const successKey = this.isEditing ? 'lotteryEntry.updatedTitle' : 'ticketPurchase.appliedTitle'
        useToastStore().add({ type: 'success', message: this.$t(successKey) })
        this.step = 4
      } catch (error) {
        this.error = error.message
        useToastStore().add({ type: 'error', message: error.message })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.lottery-entry-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 24px 0 36px;
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

.hero__eyebrow {
  margin-top: 16px;
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: $color-gray-400;
}

.hero__title {
  margin-top: 4px;
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: clamp(28px, 5vw, 40px);
}

.steps {
  margin-top: 22px;
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  flex-wrap: wrap;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step__dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: $color-white;
  border: 2px solid $color-line;
  color: $color-gray-400;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-content;
  font-weight: 900;
  font-size: 12px;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}

.step__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-400;
}

.step.is-active {
  .step__dot {
    background: $color-brand;
    border-color: $color-brand;
    color: $color-white;
  }
  .step__label {
    color: $color-brand;
  }
}

.step.is-done {
  .step__dot {
    background: #1fa876;
    border-color: #1fa876;
    color: $color-white;
  }
  .step__label {
    color: $color-ink;
  }
}

.step-line {
  width: 28px;
  height: 2px;
  background: $color-line;
  transition: background .15s ease;

  &.is-done {
    background: #1fa876;
  }
}

.content {
  padding-bottom: 90px;
  max-width: 560px;
}

.panel {
  background: $color-white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-title {
  font-family: $font-title;
  font-weight: 900;
  font-size: 20px;
  color: $color-ink;
}

.panel-hint {
  margin-top: -8px;
  font-family: $font-content;
  font-size: 13px;
  line-height: 1.5;
  color: $color-gray-500;
}

.tier-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tier-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid $color-line;
  border-radius: 14px;
  padding: 12px 16px;
}

.tier-row__name {
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
}

.tier-row__meta {
  flex: 1;
  font-family: $font-content;
  font-size: 12px;
  color: $color-gray-400;
}

.tier-row__price {
  font-family: $font-content;
  font-weight: 900;
  font-size: 15px;
  color: $color-ink;
  font-variant-numeric: tabular-nums;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-family: $font-content;
  font-weight: 700;
  font-size: 12px;
  color: $color-gray-500;
}

.field select {
  border: 1.5px solid $color-line;
  border-radius: 12px;
  padding: 11px 14px;
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

.field__note {
  margin-top: 2px;
  font-family: $font-content;
  font-size: 11.5px;
  line-height: 1.4;
  color: $color-gray-500;
}

.choice-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid $color-line;
  border-radius: 14px;
  padding: 12px 16px;
}

.choice-row__rank {
  flex: none;
  border-radius: 999px;
  background: $color-brand-tint;
  color: $color-brand;
  font-family: $font-content;
  font-weight: 900;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .02em;
  padding: 4px 10px;
}

.choice-row__name {
  flex: 1;
  font-family: $font-content;
  font-weight: 700;
  font-size: 14px;
  color: $color-ink;
}

.choice-row__price {
  font-family: $font-content;
  font-weight: 900;
  font-size: 15px;
  color: $color-ink;
  font-variant-numeric: tabular-nums;
}

.confirm-note {
  font-family: $font-content;
  font-size: 13px;
  line-height: 1.5;
  color: $color-gray-500;
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
  align-items: center;
  gap: 14px;
  margin-top: 4px;
}

.back-btn {
  border: none;
  background: none;
  padding: 8px 4px;
  cursor: pointer;
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;

  &:hover:not(:disabled) {
    color: $color-brand;
  }

  &:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
}

.continue-btn {
  margin-left: auto;
  border: none;
  border-radius: 999px;
  padding: 14px 26px;
  background: $color-brand;
  color: $color-white;
  font-family: $font-content;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease;
  box-shadow: 0 10px 20px -8px rgba($color-brand, .5);

  &:hover:not(:disabled) {
    background: $color-brand-deep;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
}

.confirmation {
  text-align: center;
  padding: 70px 20px;
  background: $color-white;
  border-radius: 20px;
  box-shadow: 0 10px 24px -12px rgba($color-ink, .18);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.confirmation__badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #1fa876;
  color: $color-white;
  font-size: 28px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation__title {
  font-family: $font-title;
  font-weight: 900;
  font-style: italic;
  font-size: 28px;
  color: $color-brand;
}

.confirmation__note {
  font-family: $font-content;
  font-size: 14px;
  color: $color-font-main;
  max-width: 46ch;
}

.confirmation__actions {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.confirmation__btn {
  border: none;
  border-radius: 999px;
  padding: 12px 26px;
  background: $color-brand;
  color: $color-white;
  text-decoration: none;
  font-family: $font-content;
  font-weight: 900;
  font-size: 14px;

  &:hover {
    background: $color-brand-deep;
  }
}

.confirmation__link {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-gray-500;
  text-decoration: none;

  &:hover {
    color: $color-brand;
  }
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
