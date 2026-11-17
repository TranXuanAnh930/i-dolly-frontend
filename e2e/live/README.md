# Live e2e tests (real backend)

`e2e/live/` runs the frontend against a real `i-dolly-backend` instead of
mocks. They expect an **isolated** backend stack (own containers, ports
5434/6380/8001 and DB volume) so they never touch your dev database.

## Run

From a backend checkout of the branch you want to test (e.g. `develop`),
with its `.env` in place:

```sh
cp ../i-dolly-frontend/e2e/live/backend-compose.e2e.yaml compose.e2e.yaml
docker compose -p idolly-e2e --env-file .env -f docker-compose.yaml -f compose.e2e.yaml up -d --build
docker exec idolly-e2e-backend python scripts/seed.py
```

Then from the frontend:

```sh
make e2e-live
```

Stop the stack with `docker compose -p idolly-e2e down` (add `-v` to drop its DB).

## How it works

- The override turns on `DEBUG` (emails are logged, not sent; the reset-link
  tests read them from the logs) and allows CORS from `http://localhost:8080`.
- The Playwright container joins the stack's network and forwards
  `localhost:8001` to the API (`LIVE_API_PROXY_TARGET`), because the refresh
  cookie is `Secure; SameSite=None`, which Chromium accepts over http only on
  `localhost`.
- Through the Docker socket the tests read logs, run SQL (e.g. turn an order
  back to unpaid) and clear Redis rate-limit counters between tests, since
  every request comes from one IP.
- Each test registers its own fan; shared seed products are reactivated in
  `finally` blocks.

## Known gaps

- The PayPal sandbox test skips unless `PAYPAL_CLIENT_ID`/`SECRET` are valid
  sandbox credentials. A successful or failed *capture* needs a person to
  approve on PayPal, so it isn't covered here (the mocked suite covers the UI).
- A deactivated product's line in a fan's order details shows "Unknown
  product": the fan order API returns only `product_id/quantity/price`, and
  the page resolves names from the store catalog. Needs the backend to return
  the product name on order items.
