import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests.
 *
 * The server is started with `YVC_ENABLE_SAMPLE_DATA=true` and no API origin,
 * which is the only configuration in which the public journeys are runnable
 * today — there is no YVC backend (see docs/api/API_CONTRACT.md). The
 * consequence is stated plainly in the specs: public discovery and the
 * privacy/indexing guarantees are genuinely covered; the signed-in journeys
 * are declared and skipped with the blocker named, rather than deleted or
 * quietly passing.
 *
 * The mobile project is not decoration. Most volunteers arrive from a Telegram
 * link on a phone, so a 390px viewport is a first-class target.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run build && npm run start -- --port 3100",
    url: "http://127.0.0.1:3100/uz/opportunities",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      YVC_ENABLE_SAMPLE_DATA: "true",
      NEXT_PUBLIC_SITE_ORIGIN: "http://127.0.0.1:3100",
    },
  },
});
