# I-Dolly Frontend

Frontend for **I-Dolly**, a mock idol/artist ticketing and merch storefront — browsing concerts and
member/idol/group profiles, direct-sale and lottery ticket flows, a merch store with cart/checkout
(mock gateway or PayPal), fan order/ticket/lottery history with notifications, and manager/admin
back-office CRUD for concerts, idols, groups, products and orders.

Built with Vue 3, Vite, Pinia and vue-i18n. Talks to a separate FastAPI backend
(`i-dolly-backend`, a sibling repo).

## Tech stack

- [Vue 3](https://vuejs.org/) — Options API throughout (no `<script setup>`/Composition API)
- [Vite](https://vitejs.dev/) — dev server & build
- [Vue Router 4](https://router.vuejs.org/) — `createWebHistory()`
- [Pinia](https://pinia.vuejs.org/) — state management, Options-style stores
- [vue-i18n](https://vue-i18n.intlify.dev/) — localization (`en`, `ja`), `legacy: true` mode
- [Axios](https://axios-http.com/) (pre-1.0, `^0.19.2`) — HTTP client, via a small `Http`/
  `BaseService` wrapper
- Sass (`@use` module API)
- No test suite — correctness is verified by lint + build + manual/live browser checks

## Getting started

### Prerequisites

- Node.js 18+
- A running instance of the [`i-dolly-backend`](../i-dolly-backend) API

### Install

```bash
npm install
```

### Configure

The API base URL comes from the `VITE_API_URL` env var (see [`src/env.js`](src/env.js)); with
nothing set it falls back to `http://localhost:8000`, so local dev needs no configuration as long
as the backend runs on its default port. To point at a different backend (e.g. a deployed one),
copy [`.env.example`](.env.example) to `.env.local` and set `VITE_API_URL` there.

### Develop

```bash
npm run dev
```

Starts the Vite dev server on `http://localhost:8080`.

### Build

```bash
npm run build
```

Outputs a production build to `dist/`.

### Preview a production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project structure

```
src/
├── assets/            Fonts, images and other static media
├── components/        Shared UI — cards, form primitives (Ui*), icons/, progress-loaders/
├── core/              Small internal utilities (e.g. assertion helpers)
├── data/              Static lookup data (e.g. statusMeta.js for StatusBadge)
├── i18n/              vue-i18n setup and locale files (en, ja)
├── layout/            App shell — index.vue (AppLayout), Header.vue, Footer.vue
├── mixins/            Global mixins (currentUser.js → this.$currentUser)
├── pages/             Route-level page components — public storefront, fan account/history,
│                      auth, plus manager/ and admin/ subfolders for staff-only CRUD
├── plugins/           App-wide plugin registration (event bus via mitt)
├── router/            Router instance, routes and navigation middlewares
├── scss/              Global styles, variables and mixins
├── services/          API access layer — one *.service.js per backend resource, all extending
│                      BaseService
├── store/             Pinia stores, one per domain concern
├── utils/             Stateless helper functions (format, tax, notification, palette, ...)
├── env.js             Runtime environment config (API URL, domain title)
└── main.js            App entry point
```

For a deeper, source-verified walkthrough of how the code is organized (routing conventions,
store/service patterns, i18n setup, styling) see [`docs/architecture.md`](docs/architecture.md).
For what the app actually models — roles, the concert/ticket/lottery/order domain, the business
rules the frontend enforces or mirrors — see [`docs/business_logic.md`](docs/business_logic.md).

### Key flows

- **Storefront**: browse events/members/groups/store (`EventsPage`, `MembersPage`, `GroupsPage`,
  `StorePage`) → event/product detail → cart → `CheckoutPage`.
- **Tickets**: direct-sale purchase (`TicketPurchasePage`) or lottery application
  (`LotteryEntryPage`, ranked preferences) → if the fan wins, pay via `LotteryPaymentPage`
  (reached from a "Pay for ticket" CTA on `LotteryResultDetailsPage`/history).
- **Payment**: every checkout (merch order, direct-sale ticket, lottery-won ticket) lets the fan
  choose **mock** (instant simulated approve/decline) or **PayPal** (redirects to PayPal, returns
  through `PaypalReturnPage`/`PaypalCancelPage` to capture or acknowledge the cancellation).
- **Fan account**: `HistoryPage` (orders/tickets/lottery entries), `NotificationsPage` +
  `NotificationDropdown` (short-polled unread notifications), `AccountSettingsPage`.
- **Manager** (`pages/manager/`): scoped to the logged-in manager's own company — idols, groups,
  events (ticket types, lottery/direct-sale campaigns, running the draw), products, order/sales
  history. No company picker; there's only ever one.
- **Admin** (`pages/admin/`): the same CRUD surface as manager, unscoped, with a company `<select>`
  on each page, plus company and manager-account management with no manager-facing equivalent.

### Services

API calls are grouped into one class per resource in `src/services/` (e.g. `concerts.service.js`,
`ticket.service.js`, `lottery.service.js`, `order.service.js`, `payment.service.js`,
`products.service.js`, `companies.service.js`, ...), all extending `base.service.js`.
`http.init.js` sets up the shared Axios instance; `auth.service.js` handles login/refresh;
`util.js` provides the `ResponseWrapper`/`ErrorWrapper` helpers used across every service.

### Store

Pinia stores under `src/store/` are split by domain: `auth`, `user`, `cart`, `catalog`,
`concerts`, `idols`, `companies`, `orders`, `tickets`, `lotteryEntries`, `notifications`, `toast`,
`dom`.

### Router

- `routes.js` declares all routes — fan-facing, plus `/manager/*` and `/admin/*` gated by
  `meta.roles: ['manager']` / `['admin']`.
- `middlewares.js` handles current-user initialization (session restore on load), route access
  checks (`meta.isAuth`/`meta.roles`) and page title updates.

## License

Proprietary — all rights reserved.
