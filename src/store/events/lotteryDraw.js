import { defineStore } from 'pinia'

import { ConcertsService } from '@/services/events/concerts.service'
import { NotificationService } from '@/services/account/notification.service'

// PUT /concerts/lottery-draw/{id} is fire-and-forget: it answers with a bare
// "scheduled" ack — no task id, no result — because the draw itself runs in a
// Celery worker (backend app/tasks/lottery.py). The outcome can only be read
// off the side effects that worker leaves behind, and there are exactly two:
//
//   success  every campaign the job touched flips status open -> drawn with
//            draw_at set, visible on GET /concerts/{id}/detail (the job
//            invalidates that cache entry itself, so the flip is never
//            hidden behind a stale cache).
//   failure  draw_lottery_task's except branch fires a lottery_draw_failed
//            notification to every manager at the concert's company.
//
// Both are watched together, which is what makes a hard timeout unnecessary:
// every real outcome has a signal. (A worker that dies before either one
// fires would leave a watch running until logout — deliberately out of scope.)
const POLL_INTERVAL_MS = 4000

// GET /notifications/mine is rate-limited at 10/60s, far tighter than the tick
// rate, so it's only fetched when the cheap /unread-count says something
// changed — plus one forced sweep every SWEEP_EVERY_TICKS as a backstop. The
// backstop matters because the count is a single number: a manager marking an
// unrelated notification read in the same window can cancel out the +1 from
// the failure notification and leave the count looking unchanged.
const SWEEP_EVERY_TICKS = 8

// Module-level, not store state — a setInterval id and the per-watch
// bookkeeping below (id lists, counters) aren't reactive data, and Pinia is a
// singleton per app, so there's exactly one loop however many concerts are
// being watched at once.
let pollTimer = null
const watchers = new Map()

// The notification half of a tick is deliberately NOT per-watcher: the list
// being read is the caller's own and comes back identical whichever concert
// is being asked about, so reading it once per watched concert would just
// multiply the same response against a 10/60s budget.
let sweep = { ticks: 0, unreadCount: null }

function stopPolling () {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// Tracks an in-flight lottery draw per concert, so both the admin events table
// and the manager event form can show the same "drawing" state for the same
// concert — including across a navigation between them, since the loop lives
// here rather than in either component.
export const useLotteryDrawStore = defineStore('lotteryDraw', {
  state: () => ({
    // concertId -> true while that concert's draw is in flight
    inProgress: {},
    // concertId -> true once a lottery_draw_failed notification landed for it.
    // Cleared when that concert's draw is triggered again; retrying is safe,
    // since draw_lottery only ever touches campaigns still status='open'.
    failed: {}
  }),

  getters: {
    // Coerced to string on both sides — callers pass either a route param
    // (always a string) or an id straight off the API.
    isDrawing: (state) => (concertId) => !!state.inProgress[String(concertId)],
    hasFailed: (state) => (concertId) => !!state.failed[String(concertId)]
  },

  actions: {
    // Throws whatever ConcertsService.drawLottery throws (403 for a manager
    // out of company scope, 404, network) so the caller can toast it — that
    // failure means nothing was ever enqueued, which is different from the
    // draw itself failing later and is worth reporting differently.
    async trigger (concertId) {
      const key = String(concertId)
      delete this.failed[key]

      // Both baselines are taken BEFORE the draw is enqueued, on purpose. The
      // campaign ids decide what "done" means for this attempt; the failure
      // notification ids decide what counts as a NEW failure. A previous
      // failed attempt on this concert leaves its lottery_draw_failed row
      // behind forever, so without this the retry would read attempt #1's
      // failure as its own and give up on the first tick.
      const [campaignIds, seenFailureIds] = await Promise.all([
        this._openCampaignIds(concertId),
        this._failureIds(concertId)
      ])

      await ConcertsService.drawLottery(concertId)

      watchers.set(key, { campaignIds, seenFailureIds })
      this.inProgress[key] = true
      if (!pollTimer) {
        sweep = { ticks: 0, unreadCount: null }
        pollTimer = setInterval(() => this._tick(), POLL_INTERVAL_MS)
      }
    },

    // The campaigns this attempt is responsible for. Only ones still open can
    // be drawn (draw_lottery filters on status='open'), so anything already
    // drawn from an earlier attempt is excluded — otherwise a retry would see
    // those as "already done" and declare success immediately.
    async _openCampaignIds (concertId) {
      const response = await ConcertsService.getDetailPublic(concertId)
      return response.data.lottery_campaigns
        .filter(campaign => campaign.status === 'open')
        .map(campaign => campaign.id)
    },

    // null (not an empty set) when the baseline can't be read — that's the
    // difference between "this concert has no past failures" and "we don't
    // know", and treating the second as the first would turn a stale failure
    // from last week into an instant false negative for this attempt. A null
    // baseline disables failure detection for this watch and leans on the
    // success signal alone.
    async _failureIds (concertId) {
      try {
        const response = await NotificationService.getMine()
        return new Set(
          response.data
            .filter(item => item.type === 'lottery_draw_failed' && String(item.concert_id) === String(concertId))
            .map(item => item.id)
        )
      } catch {
        return null
      }
    },

    async _tick () {
      if (!watchers.size) return stopPolling()

      // Failures are resolved first because a failed draw rolls its whole
      // transaction back, leaving the campaigns exactly as they were — so
      // there is no status flip coming for them, and settling them here
      // saves a pointless detail read on the same tick.
      const failedKeys = await this._newFailureKeys()
      failedKeys.forEach(key => {
        this.failed[key] = true
        this._stopWatching(key)
      })

      await Promise.all([...watchers.keys()].map(key => this._pollCampaigns(key)))
      if (!watchers.size) stopPolling()
    },

    async _pollCampaigns (key) {
      const watcher = watchers.get(key)
      if (!watcher) return

      let campaigns
      try {
        const response = await ConcertsService.getDetailPublic(key)
        campaigns = response.data.lottery_campaigns
      } catch {
        return // a blip; the next tick re-reads
      }

      const watched = campaigns.filter(campaign => watcher.campaignIds.includes(campaign.id))
      if (watched.length && watched.every(campaign => campaign.status === 'drawn' && campaign.draw_at)) {
        this._stopWatching(key)
      }
    },

    // One read for every watched concert — returns the keys whose draw has
    // newly failed.
    async _newFailureKeys () {
      // Tick 0 always sweeps, so a failure landing before the unread count
      // has any baseline to be compared against isn't missed; after that the
      // cheap count gates the heavier read.
      const forcedSweep = sweep.ticks % SWEEP_EVERY_TICKS === 0
      sweep.ticks += 1

      if (!forcedSweep) {
        try {
          const response = await NotificationService.getUnreadCount()
          const count = response.data.count
          const changed = sweep.unreadCount !== null && count !== sweep.unreadCount
          sweep.unreadCount = count
          if (!changed) return []
        } catch {
          // A 429 here just means this poll overlapped another tab's — not a
          // real error (same reasoning as the notifications store). Either way
          // the next tick, or the next forced sweep, retries.
          return []
        }
      }

      let notifications
      try {
        const response = await NotificationService.getMine()
        notifications = response.data
      } catch {
        return []
      }
      sweep.unreadCount = notifications.filter(item => !item.is_read).length

      return [...watchers.entries()]
        .filter(([key, watcher]) => watcher.seenFailureIds && notifications.some(item =>
          item.type === 'lottery_draw_failed' &&
          String(item.concert_id) === key &&
          !watcher.seenFailureIds.has(item.id)
        ))
        .map(([key]) => key)
    },

    _stopWatching (key) {
      watchers.delete(key)
      delete this.inProgress[key]
      if (!watchers.size) stopPolling()
    },

    clearOnLogout () {
      stopPolling()
      watchers.clear()
      sweep = { ticks: 0, unreadCount: null }
      this.inProgress = {}
      this.failed = {}
    }
  }
})
