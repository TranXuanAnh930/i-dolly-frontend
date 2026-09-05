/**
 * import and init global mixins
 */

import currentUser from '../mixins/currentUser'

export function registerMixins (app) {
  app.mixin(currentUser)
}
