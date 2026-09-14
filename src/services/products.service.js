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

  // POST /products/add_with_detail — bundles product creation with its
  // AlbumDetail/MerchDetail row (fields.detail_kind: 'album' | 'merch',
  // plus idol_id/group_id and whichever kind-specific fields apply) into
  // one request, so a product is never left without one — see
  // ManagerProductFormPage.vue and the backend's ProductWithDetailCreate.
  // Same multipart shape as create() above, just a different route/fields.
  static async createWithDetail (fields = {}) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/add_with_detail`, toFormData(fields))
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

  // GET /products/store-page — public, no auth. One bundled response for
  // the Store grid: every product with its album info, genre tags, and
  // resolved artist embedded, plus the group list the unit filter needs.
  static async getStorePagePublic () {
    try {
      const response = await this.request().get(`${this.entity}/store-page`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /products/{id}/detail — public, no auth. One bundled response for a
  // product's own detail page: the product (same shape as a store card) and
  // its pre-computed recommendations (same-artist + same-genre).
  static async getDetailPublic (id) {
    try {
      const response = await this.request().get(`${this.entity}/${id}/detail`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /products/manager-products-page — public, no auth. One bundled
  // response for ManagerProductsPage's table: plain product rows only, no
  // album_details. companyId, when given, scopes the result to that
  // company's products plus any ownerless merch (matching the backend's
  // "ownerless = manageable by anyone" rule) — a manager passes their own,
  // an admin viewing everything passes none.
  static async getManagerProductsPagePublic (companyId) {
    try {
      const params = companyId ? { company_id: companyId } : {}
      const response = await this.request().get(`${this.entity}/manager-products-page`, { params })
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /products/manager-product-form-page — public, no auth. One bundled
  // response for ManagerProductFormPage: products (for the isEditing
  // lookup) plus categories (the category <select>). companyId scopes the
  // products list the same way getManagerProductsPagePublic does.
  static async getManagerProductFormPagePublic (companyId) {
    try {
      const params = companyId ? { company_id: companyId } : {}
      const response = await this.request().get(`${this.entity}/manager-product-form-page`, { params })
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }

  // GET /products/{id}/sales — manager/admin only. Paginated
  // (page/limit), newest-first sales history for one product, `{page,
  // limit, count, data}` envelope. 403s if a manager doesn't own this
  // product (via its idol's/group's company_id) — this replaces the old
  // hard "Delete" action on the manager products page, which would have
  // CASCADE-deleted this exact history.
  static async getSalesHistory (id, { page = 1, limit = 10 } = {}) {
    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/${id}/sales`, { params: { page, limit } })
      return this.responseWrapper(response, response.data)
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
