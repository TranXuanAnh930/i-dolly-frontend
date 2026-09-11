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
 * The old shared /settings entry point — sends a manager to their working
 * area and an admin to theirs. Done as a guard (not a static `redirect:` on
 * the route) so it runs after initCurrentUserStateMiddleware and can rely
 * on currentUser.role actually being loaded, including on a hard reload.
 */
export function redirectSettingsRootMiddleware (to, from, next) {
  if (to.name === 'settings-root') {
    const role = useUserStore().currentUser.role
    return next({ name: role === 'admin' ? 'admin-companies' : 'manager-idols' })
  }
  next()
}

/**
 * Check access permission to auth routes, and to routes restricted to
 * specific roles (manager/admin sections) via `meta.roles`.
 */
export function checkAccessMiddleware (to, from, next) {
  const currentUser = useUserStore().currentUser
  const isAuthRoute = to.matched.some(item => item.meta.isAuth)
  const requiredRoles = to.matched.flatMap(item => item.meta.roles || [])

  if (isAuthRoute && !currentUser.id) return next({ name: 'login' })
  if (requiredRoles.length && !requiredRoles.includes(currentUser.role)) return next({ name: 'events' })
  next()
}

export function setPageTitleMiddleware (to, from, next) {
  const pageTitle = to.matched.find(item => item.meta.title)

  if (pageTitle) window.document.title = pageTitle.meta.title
  next()
}
