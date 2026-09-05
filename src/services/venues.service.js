import { BaseService } from './base.service'

// GET /venues/all — public, no auth. VenueRead: id, name, address, city,
// country, total_capacity, contact_info, size (derived), created_at.
// Concerts reference one via venue_id.
export class VenuesService extends BaseService {
  static get entity () {
    return 'venues'
  }
}
