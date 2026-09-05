import { defineConfig, devices } from "@playwright/test";

const PORT = 3211;
const STUB_PORT = 3212;
const baseURL = `http://127.0.0.1:${PORT}`;
const stubURL = `http://127.0.0.1:${STUB_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/stub-backend.mjs"],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-mobile", use: { ...devices["iPhone 15"] } },
  ],
  webServer: [
    {
      command: "node e2e/stub-backend.mjs",
      url: `${stubURL}/health/live`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { STUB_PORT: String(STUB_PORT) },
    },
    {
      command: `npm run build && npx next start -p ${PORT}`,
      url: `${baseURL}/uz/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        NEXT_PUBLIC_SITE_URL: baseURL,
        NEXT_PUBLIC_MARKETING_URL: "",
        VOLONTYORLAR_API_URL: stubURL,
        VOLONTYORLAR_SESSION_SECRET: "e2e-only-session-secret-that-is-long-enough-0123456789",
      },
    },
  ],
});
