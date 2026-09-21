import { BaseService } from '../base.service'

// GET /idol_colors/all — public, no auth. IdolColorRead: id, name, hex_code.
// Idols reference one via color_id; used to theme idol cards with their
// real brand color instead of a fallback palette pick.
export class IdolColorsService extends BaseService {
  static get entity () {
    return 'idol_colors'
  }
}
