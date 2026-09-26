import { BaseService } from '../base.service'

// GET /merch_details/{product_id} — public, no auth. PUT
// /merch_details/update/{product_id} — manager/admin, edition/color_id
// only (idol_id/group_id are immutable after creation, same convention as
// AlbumDetailsService). See ManagerProductFormPage.vue, the only caller —
// it fetches a merch product's current detail row to prefill the edit form,
// then bundles the update into the same save as the base product fields.
export class MerchDetailsService extends BaseService {
  static get entity () {
    return 'merch_details'
  }
}
