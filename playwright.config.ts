import { defineConfig, devices } from "@playwright/test";

const PORT = 3211;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
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
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `${baseURL}/uz/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_SITE_URL: "",
      NEXT_PUBLIC_MARKETING_URL: "",
      VOLONTYORLAR_API_URL: "",
      VOLONTYORLAR_SESSION_SECRET: "",
    },
  },
});
