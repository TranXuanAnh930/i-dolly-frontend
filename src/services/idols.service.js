import { BaseService } from './base.service'

// GET /idols/all, GET /idols/{id} — public, no auth. See docs/api-spec.md
// §3 (Talent) in the E-commerce backend repo for the full IdolRead shape:
// id, name, company_id, group_id, date_of_birth, hometown, color_id,
// short_intro, long_description, profile_image_url, created_at, updated_at.
export class IdolsService extends BaseService {
  static get entity () {
    return 'idols'
  }
}
