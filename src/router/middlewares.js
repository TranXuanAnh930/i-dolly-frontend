import { useUserStore } from '@/store/user'
import { AuthService } from '@/services/auth.service'

/**
 * Current user state initialization
 * @WARN Must be always first in middleware chain
 */
export async function initCurrentUserStateMiddleware (to, from, next) {
  const userStore = useUserStore()
  const currentUserId = userStore.currentUser.id

  if (AuthService.hasRefreshToken() && !currentUserId) {
    try {
      await AuthService.debounceRefreshTokens()
      await userStore.getCurrent()
      next()
    } catch (e) {
      console.error(e)
    }
  } else {
    next()
  }
}

/**
 * Check access permission to auth routes
 */
export function checkAccessMiddleware (to, from, next) {
  const currentUserId = useUserStore().currentUser.id
  const isAuthRoute = to.matched.some(item => item.meta.isAuth)

  if (isAuthRoute && currentUserId) return next()
  if (isAuthRoute) return next({ name: 'login' })
  next()
}

export function setPageTitleMiddleware (to, from, next) {
  const pageTitle = to.matched.find(item => item.meta.title)

  if (pageTitle) window.document.title = pageTitle.meta.title
  next()
}
