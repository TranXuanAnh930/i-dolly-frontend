import { BaseService } from './base.service'

// GET /genres/all — public, no auth. GenreRead: id, name.
export class GenresService extends BaseService {
  static get entity () {
    return 'genres'
  }

  // GET /genres/album_genres/album/{product_id} — public, no auth. This
  // join has no `/all` route (genre tags are always scoped to one
  // product). AlbumGenreRead: product_id, genre_id. Like `{entity}/all`
  // elsewhere in this API, an untagged product responds 404 rather than
  // [] — treat that as no genres instead of an error.
  static async getForProductPublic (productId) {
    try {
      const response = await this.request().get(`${this.entity}/album_genres/album/${productId}`)
      return this.responseWrapper(response, response.data)
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return this.responseWrapper(error.response, [])
      }
      const message = error.response && error.response.data ? error.response.data.detail : error.response && error.response.statusText
      throw this.errorWrapper(error, message)
    }
  }
}
