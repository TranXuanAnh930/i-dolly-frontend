import { defineConfig, devices } from '@playwright/test'

// End-to-end tests against a REAL backend (unlike playwright.config.js,
// which mocks the API). See e2e/live/README.md for how to bring up the
// isolated backend stack these expect; `make e2e-live` runs them in Docker.
//
// Serial on purpose: every test shares one database and one client IP, and
// the backend rate-limits per IP.
const API_URL = process.env.LIVE_API_URL || 'http://localhost:8001'

export default defineConfig({
  testDir: './e2e/live',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-live' }]],
  globalSetup: './e2e/live/support/global-setup.js',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `VITE_API_URL=${API_URL} npx vite --port 8080 --strictPort`,
    url: 'http://localhost:8080',
    reuseExistingServer: false,
    timeout: 120000
  }
})
