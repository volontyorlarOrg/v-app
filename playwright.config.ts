import { defineConfig, devices } from "@playwright/test";

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
