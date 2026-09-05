# I-Dolly Frontend

Frontend for **I-Dolly**, an idol/artist event ticketing platform — browsing events, member/idol profiles, seat selection, cart and checkout.

Built with Vue 3, Vite, Pinia and vue-i18n.

## Tech stack

- [Vue 3](https://vuejs.org/) (Composition/Options API, `<script>` SFCs)
- [Vite](https://vitejs.dev/) — dev server & build
- [Vue Router 4](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/) — state management
- [vue-i18n](https://vue-i18n.intlify.dev/) — localization (`en`, `ja`)
- [Axios](https://axios-http.com/) — HTTP client
- Sass (`@use` module API)

## Getting started

### Prerequisites

- Node.js 18+
- A running instance of the API backend (see [`src/env.js`](src/env.js) for the expected URL)

### Install

```bash
npm install
```

### Configure

Runtime config lives in [`src/env.js`](src/env.js) (API URL/port, domain title). Adjust it to point at your backend.

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
├── assets/         Fonts, images and other static media
├── components/      Shared UI components (Ui* base components, cards, icons, loaders)
├── core/            Small internal utilities (e.g. assertion helpers)
├── data/            Static lookup/reference data
├── i18n/            vue-i18n setup and locale files (en, ja)
├── layout/          App shell (Header, Footer, root layout)
├── mixins/          Global mixins (currently: currentUser)
├── pages/           Route-level page components
├── plugins/         App-wide plugin registration (event bus, etc.)
├── router/          Router instance, routes and navigation middlewares
├── scss/            Global styles, variables and mixins
├── services/        API access layer (one service class per resource)
├── store/           Pinia stores
├── utils/           Stateless helper functions
├── env.js           Runtime environment config
└── main.js          App entry point
```

### Services

API calls are grouped into one class per resource in `src/services/` (e.g. `idols.service.js`, `concerts.service.js`, `venues.service.js`). `http.init.js` sets up the shared Axios instance; `auth.service.js` handles login/refresh; `util.js` provides `ResponseWrapper`/`ErrorWrapper` helpers used across services.

### Store

Pinia stores under `src/store/` are split by domain (`auth`, `user`, `cart`, `catalog`, `concerts`, `idols`, `notifications`, `toast`, `dom`).

### Router

- `routes.js` declares all routes.
- `middlewares.js` handles current-user initialization, route access checks and page title updates.

## License

Proprietary — all rights reserved.
