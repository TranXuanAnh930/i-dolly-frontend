/**
 * Caps how many of a burst of same-kind requests run at once. Several
 * per-item endpoints in this API have no bulk "/all" route (genres per
 * product, positions per idol, ...), so a grid of 20+ cards mounting at
 * once would otherwise fire 20+ simultaneous requests and trip the
 * backend's rate limiter. Excess calls queue and run as slots free up.
 */
export function createQueue (concurrency) {
  let active = 0
  const pending = []

  function runNext () {
    if (active >= concurrency || pending.length === 0) return
    active++
    const { task, resolve, reject } = pending.shift()
    task().then(resolve, reject).finally(() => {
      active--
      runNext()
    })
  }

  return function enqueue (task) {
    return new Promise((resolve, reject) => {
      pending.push({ task, resolve, reject })
      runNext()
    })
  }
}
