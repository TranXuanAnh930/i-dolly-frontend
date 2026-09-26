import { BaseService } from '../base.service'

// GET /album_details/all, GET /album_details/{product_id} — public, no
// auth. See docs/api-spec.md §5 (Marketplace) in the E-commerce backend
// repo for the full AlbumDetailRead shape: product_id, idol_id, group_id,
// release_date, track_count, format. No image field of its own — that
// used to be cover_image_url here, dropped in favor of the base product's
// own image_url (see ReleaseCard.vue's coverPhoto). Each row extends a
// base ProductsService product — pair the two to render an album card
// (base product for name/price/image, this for release/track/genre info).
export class AlbumDetailsService extends BaseService {
  static get entity () {
    return 'album_details'
  }
}
