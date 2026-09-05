import { BaseService } from './base.service'

// GET /groups/all, GET /groups/{id} — public, no auth. See
// docs/api-spec.md §3 (Talent) in the E-commerce backend repo for the full
// GroupRead shape: id, name, company_id, debut_date, description,
// created_at, updated_at.
export class GroupsService extends BaseService {
  static get entity () {
    return 'groups'
  }
}
