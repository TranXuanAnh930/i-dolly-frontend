import { BaseService } from './base.service'

// GET /concerts/all, GET /concerts/{id} — public, no auth. See
// docs/api-spec.md §4 (Events & Ticketing) in the E-commerce backend repo
// for the full ConcertRead shape: id, venue_id, title, description,
// capacity, event_datetime, doors_open_at, company_id, status,
// created_at, updated_at. Pair with TicketTypesService (concert ticket
// tiers) and the concert-performers endpoint to build a full concert page.
export class ConcertsService extends BaseService {
  static get entity () {
    return 'concerts'
  }
}
