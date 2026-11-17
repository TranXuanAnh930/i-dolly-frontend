import { defineConfig, devices } from '@playwright/test'

// End-to-end tests for the frontend against a mocked backend: every call to
// the API origin (src/env.js's default, http://localhost:8000) is answered
// by e2e/support/mockApi.js, so no backend, database or PayPal sandbox is
// needed. Run with `npm run test:e2e` (or `make e2e` to run in Docker).
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    // VITE_API_URL forced empty so a developer's .env.local can't point the
    // tests at a real backend; the app then falls back to localhost:8000,
    // which only the mocks answer.
    command: 'VITE_API_URL= npx vite --port 8080 --strictPort',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})
