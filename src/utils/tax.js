// Japan's standard consumption tax rate — prices throughout the store are
// quoted tax-excluded, same as most Japanese storefronts, with the
// tax-included total shown alongside as a reference.
const TAX_RATE = 0.1

export function withTax (price) {
  return Math.round(price * (1 + TAX_RATE))
}
