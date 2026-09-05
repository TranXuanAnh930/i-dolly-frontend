// Real ConcertRead.status vocabulary (docs/api-spec.md §4 in the
// E-commerce backend repo).
export const statusMeta = {
  scheduled: { labelKey: 'events.statusScheduled', bg: '#E9F2FB', color: '#2A6FA8' },
  on_sale: { labelKey: 'events.statusOnSale', bg: '#E6F7EF', color: '#147A52' },
  sold_out: { labelKey: 'events.statusSoldOut', bg: '#F0EAEE', color: '#8A7286' },
  completed: { labelKey: 'events.statusCompleted', bg: '#F0EAEE', color: '#8A7286' },
  cancelled: { labelKey: 'events.statusCancelled', bg: '#FBEAEA', color: '#B3332E' }
}

export function getStatusMeta (status) {
  return statusMeta[status] || statusMeta.scheduled
}
