/**
 * import and init global plugins
 */

import globalEventBus from '../plugins/globalEventBus'

export function registerPlugins (app) {
  app.use(globalEventBus)
}
