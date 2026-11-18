# Backend task: findings from the live e2e run against `develop`

English | [日本語](live-e2e-findings_JP.md)

**Found by:** the frontend's live Playwright suite (`e2e/live/`, branch `test/e2e-suite`), run on
2026-11-17 against backend `develop` at `a11f24a` in an isolated Docker stack with `DEBUG=true` and
the English seed data. Backend `pytest` on the same commit: 1,124 passed.
**Context:** this is the reply to the five `docs/frontend-tasks/` notes (#2, #7, #12/#27, #14/#26,
#18/#19, #31/#33). All five frontend tasks are merged into frontend `develop` and behave as those
notes describe, with the one exception in item 1 below.
**Suggested numbering:** items 1–3 could become `docs/bugs.md` #34–#36.
**Status (2026-11-19):** all three answered on backend `develop` `a0fe813` as `docs/bugs.md` #34–#36
(`docs/frontend-tasks/order-item-name-and-gateway-error.md`). Frontend follow-ups: order details
use `items[].product_name`, `payment_gateway_unavailable` has its own message, and the live tests
assert the name and no longer clear `rate:ip:*` between forgot-password requests.

## Summary

| # | Finding | Severity | Frontend impact today |
|---|---|---|---|
| 1 | Fan order items carry no product name, so a deactivated product shows as "Unknown product" in the fan's order details | 🟡 Medium | Visible to fans; contradicts `product-soft-delete.md` §1a |
| 2 | Forgot-password per-IP limit (3/min) fires before the per-email limit (3/hour) | 🔵 Low | The new `too_many_reset_requests` message is rarely shown |
| 3 | A PayPal API failure at checkout is an unhandled `500` | 🔵 Low | Fan sees a generic "Something went wrong" |

Everything else in the five handover checklists passed against the real backend. That includes
the session after a password change, single-use reset links, the per-email login lockout,
`order_not_paid` on unpaid and stale rows, the PayPal cancel 404, and deactivate/reactivate
(store, detail, carts, admin view, and the 403 for another company's manager).

## 1. Fan order items have no product name (🟡 Medium)

`product-soft-delete.md` §1a says a deactivated product "still appears in past orders, with its
name and price". The row is kept, but the fan-facing order API doesn't return the name:

- `GET /order/fetch_placed_order` and `GET /order/single_placed_order/{id}` return `Order.items` as
  `OrderItem` (`app/schema/marketplace/order.py:15`): `order_id`, `product_id`, `quantity`,
  `price`. There is no name.
- So the frontend's order details page resolves names from `GET /products/store-page`
  (`src/pages/account/OrderDetailsPage.vue:115`). A deactivated product isn't in that list, and its
  `GET /products/{id}/detail` is a `404`. The fan has no endpoint that can name it.

**Observed:** a fan buys "Kaede Shirogane Solo Penlight", the manager deactivates it, and the fan's
order details line reads **"Unknown product"**. Quantity and price are correct.
`GET /order/manager-orders-page` already has `product_name` on its items, so managers are fine.

**Suggested fix:** add `product_name: str` to `OrderItem`, read from the joined product whatever
its `is_active`, on both fan order endpoints and on the `Order` that `POST /order/checkout`
returns. It's an additive field, so it isn't breaking. If it's cheap, `product_image_url` alongside
it would let the frontend show the cover for past orders too.

**Frontend follow-up (ours, one line):** use `item.product_name`, falling back to the catalog
lookup. We'll ship it as soon as the field exists; it's harmless to ship first.

**Acceptance:** buy a product as a fan, deactivate it, then call
`GET /order/single_placed_order/{id}`. The item has the product's name.

## 2. Forgot-password: the per-IP limit shadows the per-email one (🔵 Low)

`POST /profile/forgot-password` has `rate_limit(3, 60, ip_key)` (`app/router/identity/user.py:42`)
and then the new per-email check, `FORGOT_PASSWORD_LIMIT = 3` per hour
(`app/cache/rate_limit.py`). The per-IP dependency runs first. So from one network, a 4th request
within a minute gets the per-IP `429` (no `code`, "try again after N seconds") rather than
`too_many_reset_requests`. The per-email limit only ever applies to someone who spaces their
requests more than a minute apart, or switches IPs.

That's safe, since both refuse. But the per-email message that `auth-limits-and-unpaid-orders.md`
asked the frontend to add is close to unreachable for a normal user. Our live test only reaches it
by clearing the `rate:ip:*` keys between requests.

**Options, if you want the per-email message to show:** raise the per-IP limit on this route (for
example 5–10/min, which still blocks scripting), or run the per-email check before the per-IP
dependency. If the current order is intended, nothing to do; just say so and we'll leave it.

## 3. PayPal API failure at checkout returns an unhandled 500 (🔵 Low)

With PayPal rejecting the credentials (`401` from
`https://api-m.sandbox.paypal.com/v1/oauth2/token`), `POST /order/checkout` with
`gateway: "paypal"` logs `Unhandled error on POST /order/checkout` and answers
`500 Internal Server Error` with no `code`.

**Good news:** the transaction rolls back cleanly. After the failure there is no order and no
payment row, and the cart rows are still there, checked in the DB for three attempts.

**Suggested fix:** catch the PayPal client's HTTP and network errors around order creation and
answer `502` (or `503`) with a code such as `payment_gateway_unavailable`. The frontend would add a
message like "PayPal isn't responding right now. Your cart is unchanged; please try again." The
same probably applies to `POST /tickets/checkout` and the lottery payment path, which use the same
client; we only exercised the order checkout.

**Side note (not a code bug):** the PayPal sandbox credentials in the local `.env` used for this
run are rejected by PayPal, so the real sandbox cancel flow couldn't be exercised. If the team has
working sandbox keys, our test `paypal.live.spec.js` › "backing out of a real PayPal sandbox
checkout" runs automatically once they're set.

## How to reproduce

From a backend checkout of `develop`, following `e2e/live/README.md` in `i-dolly-frontend`:

```sh
docker compose -p idolly-e2e --env-file .env -f docker-compose.yaml -f compose.e2e.yaml up -d --build
docker exec idolly-e2e-backend python scripts/seed.py
# in i-dolly-frontend, branch test/e2e-suite:
make e2e-live
```

Item 1 prints `[known-gap] deactivated product's order line shows "Unknown product" ...` and the
test passes with that annotation. Once item 1 is fixed, we'll make the test assert the name.
