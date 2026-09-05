// Real ConcertRead.status vocabulary (docs/api-spec.md §4 in the
// E-commerce backend repo).
export const statusMeta = {
  scheduled: { label: 'Coming Soon', bg: '#E9F2FB', color: '#2A6FA8' },
  on_sale: { label: 'On Sale', bg: '#E6F7EF', color: '#147A52' },
  sold_out: { label: 'Sold Out', bg: '#F0EAEE', color: '#8A7286' },
  completed: { label: 'Completed', bg: '#F0EAEE', color: '#8A7286' },
  cancelled: { label: 'Cancelled', bg: '#FBEAEA', color: '#B3332E' }
}

export function getStatusMeta (status) {
  return statusMeta[status] || statusMeta.scheduled
}
