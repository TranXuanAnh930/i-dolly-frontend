<template>
  <router-link :to="`/events/${event.id}`" class="event-card">
    <div class="poster" :style="{ background: `linear-gradient(155deg, ${color.hex} 0%, rgba(0,0,0,.38) 115%)` }">
      <span class="poster__watermark" :style="{ color: color.text }">{{ event.title.charAt(0) }}</span>

      <div class="poster__date">
        <span class="poster__month">{{ dateMonth }}</span>
        <span class="poster__day">{{ dateDay }}</span>
      </div>

      <StatusBadge class="poster__status" :status="event.status"/>
    </div>

    <div class="body">
      <h3 class="title">{{ event.title }}</h3>

      <p class="venue" v-if="venue">{{ venue.name }} <span v-if="venue.city">&middot; {{ venue.city }}</span></p>

      <div class="footer">
        <span class="capacity">{{ $t('events.capacity', { count: formattedCapacity }) }}</span>
        <span class="time" v-if="doorsLabel">{{ $t('events.doorsAt', { time: doorsLabel }) }}</span>
      </div>
    </div>
  </router-link>
</template>

<script>
import { parseISO } from 'date-fns'

import { useConcertsStore } from '@/store/concerts'
import { formatDate, formatNumber } from '@/utils/format'
import StatusBadge from './StatusBadge.vue'

export default {
  name: 'EventCard',

  components: { StatusBadge },

  props: {
    event: { type: Object, required: true }
  },

  computed: {
    venue () {
      return useConcertsStore().venueById(this.event.venue_id)
    },
    // Concerts carry no color of their own — fall back to a stable
    // palette pick (see store/concerts.js) so the poster still reads as
    // themed rather than gray.
    color () {
      return useConcertsStore().colorForConcert(this.event)
    },
    eventDate () {
      return parseISO(this.event.event_datetime)
    },
    dateMonth () {
      return formatDate(this.eventDate, 'MMM')
    },
    dateDay () {
      return formatDate(this.eventDate, 'd')
    },
    doorsLabel () {
      return this.event.doors_open_at ? formatDate(parseISO(this.event.doors_open_at), 'h:mm a') : null
    },
    formattedCapacity () {
      return formatNumber(this.event.capacity)
    }
  }
}
</script>

<style lang="scss" scoped>
.event-card {
  display: flex;
  flex-direction: column;
  background: $color-white;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 4px 0 rgba($color-gray-500, .12), 0 0 1px 1px rgba($color-gray-500, .05);
  transition: transform .15s ease, box-shadow .15s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px -6px rgba($color-ink, .18);
  }
}

.poster {
  position: relative;
  height: 148px;
  overflow: hidden;
}

.poster__watermark {
  position: absolute;
  right: -6px;
  bottom: -34px;
  font-family: $font-title;
  font-weight: 900;
  font-size: 148px;
  line-height: 1;
  opacity: .18;
  user-select: none;
}

.poster__date {
  position: absolute;
  top: 12px;
  left: 12px;
  background: $color-white;
  border-radius: 10px;
  padding: 6px 10px 7px;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  box-shadow: 0 2px 6px rgba($color-ink, .18);
}

.poster__month {
  font-family: $font-content;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: $color-brand;
}

.poster__day {
  font-family: $font-title;
  font-weight: 900;
  font-size: 20px;
  color: $color-ink;
  font-variant-numeric: tabular-nums;
}

.poster__status {
  position: absolute;
  top: 12px;
  right: 12px;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  flex: 1;
}

.title {
  font-family: $font-content;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.35;
  color: $color-ink;
}

.venue {
  font-family: $font-content;
  font-size: 13px;
  color: $color-font-main;
}

.footer {
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid $color-line;
}

.capacity {
  font-family: $font-content;
  font-weight: 700;
  font-size: 13px;
  color: $color-ink;
  font-variant-numeric: tabular-nums;
}

.time {
  font-family: $font-content;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .03em;
  color: $color-gray-500;
}
</style>
