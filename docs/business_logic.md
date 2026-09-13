# Business logic

What this app actually models and the rules the frontend enforces or mirrors — as opposed to
`architecture.md`, which is about how the code is put together. For the backend's own source of
truth on the data model (tables, triggers, RBAC), see the sibling `i-dolly-backend` repo's
`docs/database-design.md` and `docs/api-spec.md`; this doc only covers what the *frontend* needs
to know to behave correctly, including business rules it duplicates client-side purely so a fan
sees a clean error before submitting, not after.

## 1. What this is

I-Dolly is a mock idol-group ticketing/merch storefront: fans browse concerts and buy merch;
concert tickets are sold either **direct-sale** (first-come, pay immediately) or via **lottery**
(apply, get ranked, get drawn, pay only if you win). Three roles: **fan** (the public-facing
customer), **manager** (runs one management company's own idols/groups/concerts/products),
**admin** (unrestricted across every company, plus company management itself).

## 2. Roles and scoping

- **Fan**: default role for anyone who registers. Can browse everything public, buy tickets/merch,
  enter lotteries, view their own order/ticket/lottery history and notifications.
- **Manager**: tied to exactly one `company_id`. Every manager page (`ManagerIdolsPage`,
  `ManagerEventsPage`, `ManagerProductsPage`, `ManagerOrdersPage`, ...) is implicitly scoped to
  that company — there's no company picker on any manager page, because there's only one company
  it could ever be.
- **Admin**: not scoped to any company. Every admin equivalent of a manager page
  (`AdminIdolsPage`, `AdminEventsPage`, ...) instead has its own company `<select>` picker, and
  `AdminCompaniesPage`/`AdminCompanyFormPage`/`AdminManagerAccountFormPage` manage companies and
  manager accounts themselves — entities with no manager-facing equivalent at all, since a manager
  can't create another company or another manager.
- Route-level enforcement is `meta.roles` + `checkAccessMiddleware` (see `architecture.md` §3) —
  but the frontend doesn't re-derive company scoping beyond that; it trusts whatever the backend's
  bundled `getManagerXPagePublic` endpoints return for the logged-in manager's own company.

## 3. Core domain model (as the frontend consumes it)

| Entity | Key fields the frontend reads | Notes |
|---|---|---|
| **Concert** | `status` (`scheduled`\|`on_sale`\|`sold_out`\|`completed`\|`cancelled`), `venue_id`, `event_datetime`, `doors_open_at`, `capacity` | The "is this concert active at all" gate — most eligibility checks start with `concert.status === 'on_sale'`. |
| **Venue** | `name`, `city`, `total_capacity` | Pure display data. |
| **TicketType** ("tier") | `tier` (`vip`\|`premium`\|`regular`), `sale_method` (`lottery`\|`direct`), `price`, `total_quantity`, `sold_quantity` | One concert has multiple tiers, each independently either lottery or direct-sale — a single concert commonly mixes both. |
| **LotteryCampaign** | `ticket_type_id`, `status` (`open`\|`drawn`\|`completed`\|`cancelled`), `entry_start_at`, `entry_end_at`, `draw_at` (null until actually drawn), `max_entries_per_user` | The lottery "window" for one tier. A tier can have more than one campaign over time (re-run after cancellation) — the frontend always picks the currently-open one, or falls back to the most recent. |
| **DirectSaleCampaign** | `ticket_type_id`, `status` (`open`\|`cancelled`), `sale_start_at`, `sale_end_at` | The direct-sale equivalent of a campaign — a direct-sale tier isn't purchasable just because stock remains, it also needs an open, in-window campaign. |
| **LotteryEntry** | `campaign_id`, `status` (`pending`\|`won`\|`lost`\|`expired`), `drawn_at` | One fan's application to one campaign. Win/loss is read from *this* field — there is no separate "you won" vs "you lost" notification type (see §6). |
| **LotteryPreference** | `concert_id`, `ticket_type_id`, `rank` | A fan's ranked wishlist *per concert* (not per tier) — rank 1..N across every tier they'd accept, submitted as one ordered list that **replaces** the whole list every time. |
| **Ticket** | `ticket_type_id`, `status` (`reserved`\|`pending_payment`\|`paid`\|`cancelled`\|`expired`\|`used`), `lottery_entry_id` (null = bought direct, set = paid for after winning a lottery) | The actual thing a fan holds a claim to a seat via. |
| **Order** | line items, `total_price`, `status` | Merch purchases — unrelated to concert tickets. |
| **Notification** | `type` (see §6), exactly one of `order_id`/`ticket_id`/`lottery_entry_id`/`concert_id` set depending on `type`, `is_read`/`read_at` | Real, backend-generated rows — not a client-side simulation (see §6 for the history here). |

## 4. Ticket-buying eligibility rules (mirrored client-side)

These are enforced server-side too, but the frontend duplicates the *read-only* checks so a fan
sees a tier as unavailable/greyed-out/absent before they try, not as a rejected request after:

- A **lottery** tier is enterable only while its campaign `status === 'open'` **and** the current
  time falls inside `[entry_start_at, entry_end_at]` (`isEntryOpen`, duplicated identically in
  `LotteryEntryPage.vue` and `TicketPurchasePage.vue`).
- A **direct-sale** tier is purchasable only while its campaign is open+in-window (`isSaleOpen`)
  **and** `sold_quantity < total_quantity` (`tierOnSale`/`remaining`). A sold-out or
  lottery-closed tier is left off the tier list entirely rather than shown disabled — there's
  nothing to select in the first place.
- A concert itself must be `status === 'on_sale'` — `scheduled`/`sold_out`/`completed`/`cancelled`
  concerts show an explanatory ineligible message instead of the buy/apply flow
  (`EventDetailPage.vue`/`TicketPurchasePage.vue`/`LotteryEntryPage.vue` all have their own
  `ineligibleMessage` computed keyed off `concert.status`).
- A fan who **already has a live ticket for this concert** (bought direct, or won a previous
  lottery tier on it) or **already won this concert's lottery** can't apply/buy again — surfaced
  via `ConcertDetailRead`'s personalized `has_ticket`/`has_won_lottery` fields (false/empty for a
  guest, computed for whoever's logged in), which disable the Apply CTA on `EventDetailPage.vue`
  with a specific "already bought"/"already won" label instead of the generic one.

## 5. Lottery application flow specifics

- **Preferences must exist before an entry can be created** — the backend enforces this with a DB
  trigger, and the frontend must call `LotteryService.setPreferences(concertId, tierIdsInOrder)`
  and let it resolve *before* calling `applyToEntry(campaignId)` for any of those tiers. Get the
  order wrong and the apply call is rejected.
- **`setPreferences` replaces the whole ranked list** every time — it's not additive. Submitting a
  shorter list drops whatever ranks aren't included.
- **Only the 1st choice is required.** A fan can submit with just a rank-1 pick and leave the rest
  unranked.
- **Editing is always allowed, including rank 1** — there is no locked/disabled rank, even for a
  tier the fan already has a real entry for. If they swap out an already-entered tier's rank, that
  existing entry is left exactly as-is (there's no cancel/withdraw endpoint at all) — the UI just
  shows a small informational note ("you already have an entry for this tier — changing it here
  won't cancel that entry"), never a blocking lock.
- **Changing a rank to a genuinely different tier cascades**: every rank *after* the one just
  changed gets cleared, because that rank's own valid-options list just changed (a tier can't
  appear at two ranks at once) — see `LotteryEntryPage.vue`'s `onSelectChange`/`clearFrom`.
  **Clearing a rank back to empty does not cascade** — it can't create a duplicate the way
  changing one can, so later ranks are left alone and just shift up to close the gap
  (`compactChoices`). This distinction matters if touching that flow again — the two look similar
  but aren't the same operation.
- **A fan revisiting a concert they've already applied to lands in edit mode**, not the fresh-apply
  intro — detected via the bundled `entered_campaign_ids` (any campaign on this concert they have
  an entry for) and `my_lottery_preferences` (their existing ranking) fields on the concert-detail
  response, pre-filling `LotteryEntryPage.vue`'s ranking step directly instead of starting from
  step 1.

## 6. Notifications: types, triggers, and the polling contract

`Notification.type` is one of eight enum values, but **only four are ever actually created** by
the backend today (confirmed by tracing every `create_notification()` call site):

| Type | Actually triggered? | Trigger |
|---|---|---|
| `order_confirmation` | ✅ | An order reaches `status == confirmed` (mock payment gateway). |
| `ticket_confirmation` | ✅ | A direct-sale ticket reaches `status == paid`. |
| `lottery_result` | ✅ | Fired for **both** winners and losers at draw time — win vs. loss is read from the linked `LotteryEntry.status`, *not* a separate notification type. There's no separate "you won" type. |
| `password_reset` | ✅ | Fired on a completed password-reset flow. |
| `lottery_registered` | ❌ never fired | Defined in the schema, no call site exists — applying to a lottery currently produces no notification of its own. |
| `lottery_payment_reminder` | ✅ (fired, but only once) | Fired alongside `lottery_result` for winners at draw time — there's no recurring reminder job. |
| `lottery_payment_confirmation` | ❌ never fired | Defined, unused. |
| `event_reminder` | ❌ never fired | Defined, unused — no reminder job exists. |

If you're building something that assumes one of the ❌ types will show up, it won't without a
backend change first — don't build frontend UI for a notification type nothing creates yet without
checking the backend first.

**Polling contract** (no WebSocket/SSE layer exists — this is intentionally a short-polling
design): poll `GET /notifications/unread-count` on an interval (15–30s suggested; this app uses
20s, see `store/notifications.js`), pausing while the tab is backgrounded
(`visibilitychange`/`document.hidden`), and only fetch the heavier `GET /notifications/mine` when
that count goes *up* — never re-fetch full notification bodies on every tick. A `429` from the
unread-count endpoint means the client (or another tab) polled too aggressively — it's swallowed,
not surfaced as an error to the fan.

## 7. Cart & checkout

- A **guest or non-fan** cart lives entirely in `localStorage` (`cart.js`'s `isServerBacked`
  getter is false). A **logged-in fan**'s cart is server-backed — added the moment they're logged
  in, cleared (not merged into a server cart) on logout.
- Checkout is a **mock payment gateway** — `simulate_succ` is a flag the fan explicitly picks on
  the mock payment step (`CheckoutPage.vue`/`TicketPurchasePage.vue` both have a
  "simulate success"/"simulate failure" radio choice), not a real card processor integration. This
  is deliberate for the demo, not a stub waiting to be replaced imminently.
- A resale cap can restrict how many of one product a single order can include — the qty stepper
  on `ProductDetailPage.vue` is resale-cap-aware; check `orders.js`'s usage there before assuming a
  fan can always buy unlimited quantity of something.

## 8. Catalog relationships

- **Idol → Group**: an idol optionally belongs to one group (`group_id`); a solo idol has none.
  Group membership can lapse (`is_active` on both idols and groups) — an inactive idol/group still
  exists for historical data (past concert lineups, past products) but is excluded from
  current-roster displays.
- **Concert → Performers**: a concert's lineup is built from `ConcertPerformer` rows, each
  crediting either a whole group (expands to that group's *current* members) or a single solo
  idol — deduplicated so an idol credited both via their group and individually only appears once.
- **Product → Album/Merch details**: a product is either an album/single/EP (`AlbumDetail`) or
  merch (`MerchDetail`) — mutually exclusive, enforced backend-side. The frontend's category
  filter (`Album`/`Single`/`EP`/`Merch`) on `StorePage.vue` reads off whichever detail record is
  attached.
