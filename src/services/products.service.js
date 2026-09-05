import { BaseService } from './base.service'
import { toFormData } from '@/utils/formData'

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

  // POST /products/add_product — a different path than the base class's
  // `/add`, and multipart/form-data (an optional `image` file). Response is
  // just {msg}, not the created product — callers should re-fetch the list.
  static async create (fields = {}) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/add_product`, toFormData(fields))
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // POST /products/{id}/image — replaces an existing product's image
  // without touching any other field.
  static async uploadImage (id, file) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/${id}/image`, toFormData({ image: file }))
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
