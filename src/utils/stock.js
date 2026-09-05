const LOW_STOCK_THRESHOLD = 20

export function stockStatus (quantity) {
  if (quantity <= 0) return 'out'
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low'
  return 'in'
}
