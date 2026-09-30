import { useUserStore } from '@/store/auth/user'
import { useAuthStore } from '@/store/auth/auth'
import { AuthService } from '@/services/auth/auth.service'
import { setRouteTitle } from '@/utils/pageTitle'

/**
 * Current user state initialization
 * @WARN Must be always first in middleware chain
 */
export async function initCurrentUserStateMiddleware (to, from, next) {
  const userStore = useUserStore()
  const currentUserId = userStore.currentUser.id

  // Skipped while a failed restore is still inside its wait (e.g. the
  // refresh rate limit's window) — trying again then would only spend
  // another request on the same 429.
  if (AuthService.hasRefreshToken() && !currentUserId && !useAuthStore().isSessionRestoreBackingOff()) {
    // Never throws: a rejected refresh token ends the session (-> login);
    // any other failure keeps it and is recorded in authStore.sessionRestore
    // (see checkAccessMiddleware). next() must always run — never calling
    // it leaves this navigation hanging forever, which renders as a
    // permanently blank <router-view> under a fine header.
    await AuthService.restoreSession()
  }
  next()
}

// A stored session that couldn't be loaded yet (rate limited, offline,
// server error) — the fan may well still be logged in, so this is not a
// logout.
function isRestoringSession () {
  return !useUserStore().currentUser.id && useAuthStore().sessionRestore.error !== null
}

/**
 * The old shared /settings entry point — sends a manager to their working
 * area and an admin to theirs. Done as a guard (not a static `redirect:` on
 * the route) so it runs after initCurrentUserStateMiddleware and can rely
 * on currentUser.role actually being loaded, including on a hard reload.
 */
export function redirectSettingsRootMiddleware (to, from, next) {
  // No role yet while a session restore is pending: stay put (the layout
  // shows the reconnect notice) and route by role once it's loaded.
  const role = useUserStore().currentUser.role
  if (to.name === 'settings-root' && role) {
    return next({ name: role === 'admin' ? 'admin-companies' : 'manager-events' })
  }
  next()
}

/**
 * A manager landing on the fan-facing events page — a fresh tab reopening
 * the site (root "/" is an alias for it), a bookmark, or the header logo —
 * lands on their own events page instead. Scoped to this one route rather
 * than the whole fan-facing site, so a manager can still browse Members/
 * Groups/Store like any other visitor if they navigate there directly.
 */
export function redirectManagerHomeMiddleware (to, from, next) {
  if (to.name === 'events' && useUserStore().currentUser.role === 'manager') {
    return next({ name: 'manager-events' })
  }
  next()
}

/**
 * Check access permission to auth routes, to routes restricted to specific
 * roles (manager/admin sections) via `meta.roles`, and to fan-facing pages
 * hidden from specific roles via `meta.excludeRoles` (e.g. history/contact/
 * about for managers and admins — the header hides those links too, this
 * just covers a typed URL or old bookmark).
 */
export function checkAccessMiddleware (to, from, next) {
  const currentUser = useUserStore().currentUser
  const isAuthRoute = to.matched.some(item => item.meta.isAuth)
  const requiredRoles = to.matched.flatMap(item => item.meta.roles || [])
  const excludedRoles = to.matched.flatMap(item => item.meta.excludeRoles || [])

  // While a session restore is pending, let a route that needs a user
  // resolve anyway: AppLayout shows SessionRestoreNotice in place of the
  // page (so nothing on it runs without a user) until the session loads.
  if ((isAuthRoute || requiredRoles.length) && isRestoringSession()) return next()
  if (isAuthRoute && !currentUser.id) return next({ name: 'login' })
  if (requiredRoles.length && !requiredRoles.includes(currentUser.role)) return next({ name: 'events' })
  // Back to each role's own home: an admin's is Companies; 'events' itself
  // bounces a manager on to their own events page (redirectManagerHomeMiddleware).
  if (currentUser.role && excludedRoles.includes(currentUser.role)) {
    return next({ name: currentUser.role === 'admin' ? 'admin-companies' : 'events' })
  }
  next()
}

// meta.titleKey is an i18n key (pageTitle.*) rather than a finished string,
// so the tab title follows the language switcher — see utils/pageTitle.js.
export function setPageTitleMiddleware (to, from, next) {
  const withTitle = to.matched.find(item => item.meta.titleKey)
  setRouteTitle(withTitle && withTitle.meta.titleKey)
  next()
}
