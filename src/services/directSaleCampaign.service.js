import { BaseService } from './base.service'

// Wraps /direct_sale_campaigns — the direct-sale mirror of
// lottery_campaigns (see lottery.service.js's own comment): a time-boxed
// on-sale window for one direct-sale ticket tier. checkout_ticket requires
// an open, in-window campaign to exist before it'll sell a ticket for that
// tier, so a direct-sale tier is only really "on sale" while one of these
// says so. Campaign data itself is read straight off
// GET /concerts/{id}/detail (concerts.service.js) — this service only
// exists for the manager-facing add/update/remove CRUD, all inherited
// straight from BaseService (POST .../add, PUT .../update/{id},
// DELETE .../delete/{id}).
export class DirectSaleCampaignService extends BaseService {
  static get entity () {
    return 'direct_sale_campaigns'
  }
}
