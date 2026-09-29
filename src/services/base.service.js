import qs from 'qs'
import { assert } from '@/core'

import { Http } from './http.init'
import { ResponseWrapper } from './util'
import { toApiError } from './apiError'

export class BaseService {
  static get entity () {
    throw new Error('entity getter not defined')
  }
  /**
   * ------------------------------
   * @HELPERS
   * ------------------------------
   */

  static request (status = { auth: false }) {
    return new Http(status)
  }

  static responseWrapper (...rest) {
    return new ResponseWrapper(...rest)
  }

  static querystring (obj) {
    return qs.stringify(obj, {
      encode: false
    })
  }

  /**
   * ------------------------------
   * @API_CALLS_PUBLIC
   * ------------------------------
   */

  /**
   * GET {entity}/all — this backend's "list everything" convention (see
   * docs/api-spec.md in the E-commerce backend repo): unpaginated, no auth.
   * An empty collection is 200 [] (§0: empty is never an error — a 404
   * always means a specific resource is missing).
   */
  static async getAllPublic () {
    try {
      const response = await this.request().get(`${this.entity}/all`)
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  static async getListPublic (parameters = {}) {
    assert.object(parameters)

    const params = { ...parameters }

    try {
      const response = await this.request().get(`${this.entity}`, { params })
      const data = {
        content: response.data.data,
        total: Number(response.headers['x-total-count'])
      }

      return new ResponseWrapper(response, data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  static async getByIdPublic (id) {
    assert.id(id, { required: true })

    try {
      const response = await this.request().get(`${this.entity}/${id}`)
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  /**
   * ------------------------------
   * @API_CALLS_PRIVATE
   * ------------------------------
   */

  static async getById (id) {
    assert.id(id, { required: true })

    try {
      const response = await this.request({ auth: true }).get(`${this.entity}/${id}`)
      return new ResponseWrapper(response, response.data.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  /**
   * POST {entity}/add — the manager/admin write convention shared by
   * idols, groups, concerts, venues, ticket_types and management_companies
   * (see docs/api-spec.md in the E-commerce backend repo). `data` may be a
   * plain object (sent as JSON) or a FormData instance (for the two
   * entities — idols, products — whose /add endpoint is multipart).
   */
  static async create (data = {}) {
    try {
      const response = await this.request({ auth: true }).post(`${this.entity}/add`, data)
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  static async update (id, data = {}) {
    assert.id(id, { required: true })
    assert.object(data, { required: true })

    try {
      const response = await this.request({ auth: true }).put(`${this.entity}/update/${id}`, data)
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }

  static async remove (id) {
    assert.id(id, { required: true })

    try {
      const response = await this.request({ auth: true }).delete(`${this.entity}/delete/${id}`)
      return new ResponseWrapper(response, response.data)
    } catch (error) {
      throw toApiError(error)
    }
  }
}
