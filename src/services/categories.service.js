import { BaseService } from './base.service'

// GET /Categories/all — public, no auth (note the capitalized route
// prefix, unlike every other entity). Used to populate the product form's
// category dropdown; category CRUD itself isn't part of this app.
export class CategoriesService extends BaseService {
  static get entity () {
    return 'Categories'
  }
}
