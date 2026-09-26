import { createRouter, createWebHistory } from 'vue-router'

import { initCurrentUserStateMiddleware, redirectSettingsRootMiddleware, redirectManagerHomeMiddleware, checkAccessMiddleware, setPageTitleMiddleware } from './middlewares'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: 'is-active',
  routes
})

router.beforeEach(initCurrentUserStateMiddleware)
router.beforeEach(redirectSettingsRootMiddleware)
router.beforeEach(redirectManagerHomeMiddleware)
router.beforeEach(checkAccessMiddleware)
router.beforeEach(setPageTitleMiddleware)

export default router
