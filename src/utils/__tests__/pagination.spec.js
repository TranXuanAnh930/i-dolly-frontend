import { describe, it, expect } from 'vitest'

import { hasNextPage, totalPagesFrom } from '../pagination'

describe('totalPagesFrom', () => {
  it.each([
    [0, 10, 1],
    [1, 10, 1],
    [10, 10, 1],
    [11, 10, 2],
    [20, 10, 2],
    [21, 10, 3]
  ])('count %i with limit %i is %i page(s)', (count, limit, pages) => {
    expect(totalPagesFrom(count, limit)).toBe(pages)
  })

  it('is null when the response has no usable count', () => {
    expect(totalPagesFrom(undefined, 10)).toBeNull()
    expect(totalPagesFrom(null, 10)).toBeNull()
    expect(totalPagesFrom('12', 10)).toBeNull()
    expect(totalPagesFrom(-1, 10)).toBeNull()
  })
})

describe('hasNextPage', () => {
  it('uses the total when there is one', () => {
    // An exactly-full last page has no next page.
    expect(hasNextPage({ page: 2, limit: 10, rowCount: 10, totalPages: 2 })).toBe(false)
    expect(hasNextPage({ page: 1, limit: 10, rowCount: 10, totalPages: 2 })).toBe(true)
  })

  it('falls back to "a full page may have a next" without a total', () => {
    expect(hasNextPage({ page: 1, limit: 10, rowCount: 10, totalPages: null })).toBe(true)
    expect(hasNextPage({ page: 1, limit: 10, rowCount: 3, totalPages: null })).toBe(false)
  })
})
