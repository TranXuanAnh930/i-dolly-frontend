import { BaseService } from './base.service'

// GET /products/all, GET /products/{id} — public, no auth. See
// docs/api-spec.md §5 (Marketplace) in the E-commerce backend repo for the
// full ProductRead shape: id, name, price, description, quantity,
// image_url, category (the category *name*, not its id).
//
// /products/all is unpaginated like every other "/all" list here — for a
// large catalog, GET /products/pagination ({page, limit, count, data}) or
// GET /products/filter (category/name/price-range + paging) are the real
// endpoints to reach for instead; not wired up here since only "fetch all"
// was asked for.
export class ProductsService extends BaseService {
  static get entity () {
    return 'products'
  }
}
