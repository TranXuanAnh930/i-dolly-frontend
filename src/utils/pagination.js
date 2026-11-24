// The paged endpoints (docs/api-spec.md §0 "Pagination") return
// {page, limit, count, data}, where count is the total number of matching
// rows across every page (backend bugs.md #23). An older backend sent this
// page's length instead and some mocks send no count at all, so a missing
// count gives null: the caller falls back to "a full page may have a next".

export function totalPagesFrom (count, limit) {
  if (typeof count !== 'number' || !Number.isFinite(count) || count < 0 || !limit) return null
  return Math.max(1, Math.ceil(count / limit))
}

export function hasNextPage ({ page, limit, rowCount, totalPages }) {
  if (totalPages == null) return rowCount === limit
  return page < totalPages
}
