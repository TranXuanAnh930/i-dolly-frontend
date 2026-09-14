# Architecture

How this codebase is put together and how to extend it consistently. This describes the
**actual current state of the code**, verified against the source — keep it that way as things
change. For *what the app actually does* (domain model, business rules, the concert/lottery/order
flow), see `business_logic.md` in this same folder. The backend lives in a sibling repo,
`i-dolly-backend`, with its own `docs/architecture.md` / `docs/database-design.md` /
`docs/api-spec.md` / `docs/project_status.md` — this frontend mirrors a lot of that backend's
domain model client-side (see `business_logic.md`), so when in doubt about a business rule, that
repo's docs (or the running API itself) are the source of truth, not this one.

## 1. Tech stack

- **Vue 3** (`^3.4.21`), **Options API** throughout — no `<script setup>`/Composition API in this
  codebase, stay consistent with that.
- **Vite** (`^5.1.6`) — dev server, build, and preview all go through it (`npm run dev` / `build` /
  `preview`).
- **Vue Router 4** (`^4.3.0`), `createWebHistory()` (not hash mode) — see §3.
- **Pinia** (`^2.1.7`), Options-style stores (`defineStore(id, { state, getters, actions })`) — see
  §4.
- **vue-i18n** (`^11.4.10`), `legacy: true` (deliberate — gives every Options-API component
  `this.$t`/`this.$i18n` without composition boilerplate) — see §6.
- **axios** (`^0.19.2`, notably pre-1.0 — check behavior against that version specifically if
  something axios-related looks off) via a small `Http`/`BaseService` wrapper — see §5.
- **Sass** (`^1.103.1`) for styling — see §7.
- **ESLint** (`^8.57.0` + `eslint-plugin-vue` `^9.23.0`) — `npm run lint` runs `eslint src --ext
  .js,.vue`. Config in `.eslintrc.js`: `eslint:recommended` + `plugin:vue/vue3-essential`,
  `vue/multi-word-component-names` and `vue/no-reserved-component-names` both off (this codebase's
  convention includes single-word names like `Header`, `Footer`, `Login`, icon components).
- **No test suite** — no `*.test.js`/`*.spec.js` files, no vitest/jest config, no `test` script in
  `package.json`. Correctness is verified by lint + build + manual/live browser verification.

## 2. Project structure

```
src/
  pages/              one file per route (see routes.js) — public storefront, fan account/
                       history, auth, plus manager/ and admin/ subfolders for staff-only CRUD
  layout/              index.vue (AppLayout, mounted once for the whole session), Header.vue,
                       Footer.vue
  components/          shared UI — cards, form primitives (Ui*), icons/, progress-loaders/
  store/               Pinia stores, one per domain concern — see §4
  services/            one *.service.js per backend router, all extending BaseService — see §5
  router/              routes.js (route table), middlewares.js (guards), index.js (router instance)
  i18n/                index.js (i18n instance) + locales/en.js + locales/ja.js — see §6
  scss/                _variables.scss, _fonts.scss, _mixins.scss, _medias.scss, _global.scss,
                       style.scss (entry point) — see §7
  utils/               pure helper functions (format, media, notification, palette, tax, ...)
  mixins/              currentUser.js ($currentUser global computed) + index.js (registration)
  data/                static lookup data (e.g. statusMeta.js for StatusBadge)
  core/                small internal helpers (assert/, index.js)
  plugins/              registerPlugins(app) — currently just globalEventBus (mitt)
  env.js               the one place env vars are read — see §8
  main.js              app bootstrap: createApp → use(pinia/router/i18n) → registerMixins/Plugins
                       → mount
```

## 3. Routing (`src/router/`)

**`routes.js`** — one array of route objects. Conventions, confirmed consistent across every
route:
- `name` is kebab-case and mirrors the path segments (`/admin/companies/:id/edit` →
  `admin-companies-edit`, `/manager/products/:id/sales` → `manager-products-sales`). The one
  exception is the aliased root: `path: '/events'` with `alias: '/'`, `name: 'events'`.
- `meta.title` — every route sets `` `${DOMAIN_TITLE} | <section>` ``, applied to
  `document.title` by `setPageTitleMiddleware`.
- `meta.isAuth: true` — gates any route requiring a logged-in session (checkout, history,
  notifications, account settings, every manager/admin route, event-tickets, event-lottery-entry,
  lottery-details/payment). Enforced by `checkAccessMiddleware`; redirects to `login` if the
  visitor has no `currentUser.id`.
- `meta.roles: ['manager']` / `['admin']` — further restricts a route by role, checked by the same
  guard (redirects to `events` if the current role isn't listed). No route currently lists more
  than one role.
- Public routes (events/members/groups/store, their detail pages, guidelines/about/contact,
  login/register/forgot/reset-password) carry neither `isAuth` nor `roles`.
- `/settings` (`name: 'settings-root'`) is a special case: `isAuth`-only, no component — a pure
  redirect target. It's resolved by a *guard* (`redirectSettingsRootMiddleware`), not a static
  `redirect:` on the route, specifically so it runs after `initCurrentUserStateMiddleware` and can
  rely on `currentUser.role` actually being populated, including right after a hard reload.

**`middlewares.js`** — four guards, registered in `router/index.js` in this exact order (confirmed
exhaustive, nothing else registered):
```js
router.beforeEach(initCurrentUserStateMiddleware)   // restores a session from the refresh cookie
router.beforeEach(redirectSettingsRootMiddleware)    // /settings -> role-appropriate landing route
router.beforeEach(checkAccessMiddleware)             // isAuth / roles enforcement
router.beforeEach(setPageTitleMiddleware)            // document.title from meta.title
```
`initCurrentUserStateMiddleware` **must always call `next()`**, even when its token-refresh attempt
fails — a swallowed error that never calls `next()` leaves the navigation (and `<router-view>`)
hanging forever. See §5 for why this only matters when the frontend and backend are cross-origin.

## 4. State management (Pinia, `src/store/`)

Most stores that fetch a collection from the backend follow the same shape:

```js
state: () => ({ items: [], loading: false, loaded: false, error: null }),
actions: {
  async fetchAll ({ force = false } = {}) {
    if (this.loaded && !force) return
    if (fetchAllPromise) return fetchAllPromise   // only in stores that need it, see below
    this.loading = true
    ...
  },
  clearOnLogout () { this.items = []; this.loaded = false; this.error = null }
}
```
- `loaded` makes `fetchAll()` a safe no-op to call from multiple places (every page that needs the
  data just calls it in `created()`; only the first caller actually hits the network).
- `clearOnLogout()` exists on every store holding fan-specific data (orders, tickets,
  lotteryEntries, notifications, cart) — `Header.vue`'s `$currentUser.id` watcher calls all of them
  on logout so the next person on the device (or a guest) never sees a stale fan's data. Stores
  holding only public/catalog data (catalog, idols, concerts, companies) have no `clearOnLogout` —
  there's nothing fan-specific to clear.
- **In-flight de-dupe**: `concerts.js`, `lotteryEntries.js`, and `notifications.js` additionally
  track a **module-level** (not reactive-state) `let fetchAllPromise = null` so that two callers
  firing `fetchAll()` in the same tick (e.g. `Header.vue`'s `created()` plus whichever page also
  calls it) share one in-flight request instead of each firing its own. Module-level rather than
  state because a `setInterval` id, a DOM listener reference, or an in-flight `Promise` shouldn't
  live inside a reactive Pinia proxy (storing a raw `Promise` in reactive state can break its
  `.then()` — Vue's `reactive()` wrapping doesn't play well with Promise internals). Add this
  pattern to any *new* store where multiple independent call sites might race on first load.

**Deviations from the fetchAll/loaded pattern** (all confirmed intentional, not oversights):
- `notifications.js` — no `loaded` flag; it's poll-driven, not fetch-once. Owns its own polling
  loop (`startPolling`/`stopPolling`, 20s interval, pauses on `visibilitychange`) — see
  `business_logic.md` §6 for the actual polling contract this implements.
- `cart.js` — no `loaded`; always considered ready, either localStorage-backed (guest/non-fan) or
  server-backed (fan), gated by an `isServerBacked` getter. `clearOnLogout` empties it rather than
  restoring a pre-login guest cart.
- `user.js` — no fetchAll/loaded pattern at all: a single `getCurrent()` action plus
  `setCurrentUser()`. This store's `currentUser.id` is the "am I logged in" source of truth every
  other store's actions gate on (`if (!user.id || user.role !== 'fan') return`).
- `auth.js` — trivial, just `{ accessTokenExpDate }` for `AuthService`'s expiry check.
- `dom.js` — viewport-width tracker (`windowWidth` + `isExtraSmall/isSmall/isTablet/isDesktop`
  getters), driven by a resize listener in `layout/index.vue`.
- `toast.js` — a plain queue (`toastsList`), not a fetch-backed store at all.

## 5. Service layer (`src/services/`)

Every service extends `BaseService` (`base.service.js`), which provides:
- `static get entity()` — the REST resource name, e.g. `'concerts'`.
- `request({ auth: true|false })` — returns a fresh axios instance (`Http` class,
  `http.init.js`). `auth: true` attaches an interceptor that sets the bearer header and, if the
  access token is expired, refreshes it first — see §8 for the full token lifecycle.
- `responseWrapper(response, data)` / `errorWrapper(error, message)` — thin wrappers
  (`services/util.js`) standardizing the shape callers get back (`.data`, `.status`, etc. on
  success; a `.message`/`.status` `Error` subclass on failure).
- Generic inherited methods: `getAllPublic()` (`GET {entity}/all`, 404→`[]`), `getListPublic()`,
  `getByIdPublic(id)` (`GET {entity}/{id}`), and the auth-required `create`/`update`/`remove`.
- **404-as-empty-list convention**: any list endpoint that 404s on an empty result (rather than
  returning `[]`) has its own try/catch translating that specific 404 into
  `this.responseWrapper(error.response, [])` — see `lottery.service.js`'s `getMyEntries`,
  `notification.service.js`'s `getMine`, etc. for the pattern to copy in a new service method.
- **"Page-shaped" bundled endpoints**: rather than a page firing several requests for
  concert+venue+ticket_types+lineup+campaigns separately, the backend bundles all of it into one
  response the frontend just destructures (`ConcertsService.getDetailPublic(id)` →
  `response.data.{concert,venue,ticket_types,lineup,performing_groups,lottery_campaigns,
  direct_sale_campaigns,has_ticket,has_won_lottery,entered_campaign_ids,my_lottery_preferences}`).
  The same convention exists for `getEventsPagePublic`, `getStorePagePublic`,
  `getMembersPagePublic`, `getGroupsPagePublic`, and every manager/admin `getManagerXPagePublic` /
  `getManagerXFormPagePublic` method. **When a page needs data from more than one place, check for
  an existing bundled endpoint (or ask whether one should be added) before reaching for several
  parallel service calls** — this is a deliberate, established convention, not just an
  optimization.
- **Confirmed deviations** (intentional, not bugs): `auth.service.js` isn't a `BaseService`
  subclass at all (unauthenticated calls use raw `axios` directly, since login/register/refresh
  can't attach a bearer token that doesn't exist yet); `cart.service.js` uses its own
  `add_cart`/`see_cart`/`delete_cart` action-verb routes instead of the generic
  create/getAllPublic/remove; `ticketTypes.service.js` has no bulk `/all` route (a ticket type is
  always scoped to one concert, fetched via `getByConcertPublic`); `shippingAddresses.service.js`
  uses `/fetch` rather than `/all`.

## 6. i18n (`src/i18n/`)

- Exactly two locales: `en.js` and `ja.js` (kept in lockstep — same key structure, verbatim). No
  third locale exists.
- `createI18n({ legacy: true, locale, fallbackLocale: 'en', messages: { en, ja } })`.
- Active locale persists to `localStorage['i-dolly-locale']` (exported as `LOCALE_STORAGE_KEY`),
  read on boot (defaults to `'en'` if unset/invalid). `LanguageSwitcher.vue` sets
  `this.$i18n.locale` directly and writes back to storage.
- Locale files are namespaced per page/feature area (`common`, `nav`, `events`, `eventDetail`,
  `lotteryEntry`, `managerIdols`, `adminCompanies`, ...) — **when adding UI text for a new page,
  add a new top-level key matching the page name**, don't scatter strings across unrelated
  namespaces. Note that manager and admin idol/group/event/product pages intentionally *share* the
  same `managerX`/`managerXForm` namespaces (no separate `adminIdols` etc.) — only
  companies/manager-account-form have admin-specific keys, since those two entities have no
  manager equivalent.

## 7. Styling (`src/scss/`)

- **Color tokens** (`_variables.scss`): `$color-white`, `$color-body`, `$color-error`,
  `$color-line`, `$color-black-transparent`, `$color-font-main`, `$color-font-dim`,
  `$color-font-placeholder`, `$color-gray-50/100/200/300/400/450/500`, `$color-brand`,
  `$color-brand-deep`, `$color-brand-tint`, `$color-brand-tint-2`, `$color-ink`, and
  `$gradient-backdrop` (the six-stop pastel gradient behind every page). Use these, don't hardcode
  hex values in a component.
- **Font tokens** (`_fonts.scss`): `$font-title`, `$font-content`, `$font-content-alt` — all three
  currently resolve to the same family (`'M PLUS 1', sans-serif`); weight (400–900) does the
  differentiation, not family swapping.
- **Media-query mixins** (`_medias.scss`): `media_mobile` (≤640px), `media_tablet` (≤1024px),
  `media_desktop` (≤4096px) — `@include media_mobile { ... }` etc. (`media_ie`/`media_edge` also
  exist but are legacy, unlikely to be relevant to new work).
- **`_global.scss`** carries a handful of `!important`-forced global resets that every component
  relies on implicitly:
  - `select { appearance: none !important; ...background-image: <inline chevron svg>... }` — a
    custom chevron replaces the native dropdown arrow site-wide; don't re-implement this per
    component.
  - `input, textarea, select { font-size: 16px !important; }` under `media_mobile` — stops iOS
    Safari auto-zooming on focus.
  - `.wrapper` — the site's central max-width container (1200px desktop / 1024px tablet,
    `min-width: 300px`), used on every page's hero/content sections.
  - `.fade-enter-active`/`.fade-enter`/`.fade-leave-to` — the route-transition fade used by
    `layout/index.vue`'s `<transition name="fade">`.
- **Known gotcha worth remembering**: a `.field-grid { grid-template-columns: repeat(2, 1fr) }`
  two-column form grid whose grid-item class (`.field`) doesn't set `min-width: 0` will render
  unequal columns the moment a `<select>` inside it has a long `<option>` (grid items default to
  `min-width: auto`, so the longest option's min-content width overrides the `1fr` split). Every
  form page using this pattern with a `<select>` needs `min-width: 0` on `.field` — see
  `ManagerEventFormPage.vue`/`AdminEventFormPage.vue`/`ManagerProductFormPage.vue`/
  `AdminProductFormPage.vue`/`ManagerIdolFormPage.vue`/`AdminIdolFormPage.vue` for the fix already
  applied; apply the same one-line fix to any *new* two-column form with a select.
- **Another gotcha**: a table row whose thumbnail `<img v-if="...">` renders nothing for a
  no-image record collapses shorter than every other row. The fix is a `v-else` placeholder
  (`<span class="thumb thumb--empty">`) reserving the same footprint — see
  `ManagerProductsPage.vue`/`AdminProductsPage.vue`/`ManagerIdolsPage.vue`/`AdminIdolsPage.vue`.

## 8. Auth flow

- **Access token**: a short-lived JWT held only in an in-memory module variable
  (`auth.service.js`'s `BEARER`) — never persisted, so it's gone on every full page reload by
  design.
- **Refresh token**: an opaque token delivered as an `httponly` cookie by the backend
  (`POST /account/login` / `POST /account/refresh`), `Secure` + `SameSite=None` — `None` (not
  `Lax`) specifically because the frontend (Vercel) and backend (a separate host, e.g. Render) are
  different origins in production; a `Lax` cookie is never sent on the cross-site XHR/fetch
  `POST /account/refresh` call this app makes, only on top-level navigations, so `Lax` here means
  every reload silently fails to restore the session in production even though it "works" in local
  dev (same site there, since `localhost:8080`/`:8000` differ only by port, and "site" ignores
  port).
- **`Http` class** (`http.init.js`): when constructed with `{ auth: true }`, its request
  interceptor dynamically imports `AuthService` (breaking a
  `http.init → auth.service → store/user → users.service → base.service → http.init` circular
  import), sets the bearer header, and — if `AuthService.isAccessTokenExpired()` and a refresh
  token exists — calls `AuthService.debounceRefreshTokens()` first and retries with the new token.
- **Session restore on boot/reload**: `initCurrentUserStateMiddleware` (see §3) is what actually
  recovers a session after a reload: if a refresh-token flag exists in `localStorage` but
  `currentUser.id` is empty (fresh page load), it awaits a token refresh + `userStore.getCurrent()`
  before letting navigation proceed. This is a router *guard*, not a page-level concern — a page
  never needs to think about "am I logged in yet" during its own `created()`.
- **Boot loading state**: `layout/index.vue` shows `<UiPageLoader/>` in place of `<router-view>`
  until `router.isReady()` resolves, specifically to cover the window where the guard above is
  still awaiting a slow/cold backend — without it, a slow first navigation renders as a blank page
  under an otherwise-fine header (the header lives outside `<router-view>`, so it always renders
  immediately regardless of navigation state).

## 9. Deployment

- **Frontend**: Vercel (`vercel.json` at the repo root — a single SPA-fallback rewrite,
  `"/(.*)" → "/index.html"`, required because `createWebHistory()` needs the server to serve
  `index.html` for every path). No other root-level deployment config.
- **Backend**: a separate host (a different origin from the Vercel frontend in production — this
  is *why* the `SameSite=None` cookie requirement in §8 exists at all; it wasn't needed back when
  everything ran on `localhost`).
- **The one env var this app reads**: `VITE_API_URL` (`src/env.js`) — the backend's base URL.
  Falls back to `http://localhost:8000` if unset. `DOMAIN_TITLE` (`'I-Dolly'`) is hardcoded, not an
  env var.
