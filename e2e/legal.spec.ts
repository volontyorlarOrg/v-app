import { expect, test, type Page } from "@playwright/test";

async function signInExisting(page: Page, baseURL: string) {
  await page
    .context()
    .addCookies([{ name: "volontyorlar_locale", value: "en", url: baseURL }]);
  await page.goto("/api/auth/telegram/start?locale=en");
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("sign-up begins profile setup without an early consent step", async ({ page }) => {
  await page.goto("/en/signup?next=%2Fopportunities%2Fbook-drive");
  await expect(page).toHaveURL(/\/signup\?next=/);
  await expect(page.locator('input[name="fullName"]')).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Continue with Telegram" }),
  ).toBeVisible();
});

test("dropdowns contrast with the current theme", async ({ page }) => {
  await page.goto("/en/signup");
  for (const [theme, background, foreground] of [
    ["light", "rgb(16, 35, 58)", "rgb(241, 246, 251)"],
    ["dark", "rgb(255, 255, 255)", "rgb(11, 35, 64)"],
  ] as const) {
    await page.evaluate(
      (value) => (document.documentElement.dataset.theme = value),
      theme,
    );
    await page.getByRole("banner").locator('button[aria-haspopup="menu"]').click();
    const menu = page.locator('[data-slot="dropdown-menu-content"]');
    await expect(menu).toHaveCSS("background-color", background);
    await expect(menu.getByRole("menuitem", { name: /^Русский/ })).toHaveCSS(
      "color",
      foreground,
    );
    await page.keyboard.press("Escape");
  }
});

test("withdrawing consent stops app use until the volunteer agrees again", async ({
  page,
  baseURL,
}) => {
  await signInExisting(page, baseURL!);
  await page.goto("/settings/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Requests about your data",
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  await page
    .getByLabel("What do you need?", { exact: true })
    .selectOption("withdrawal");
  await page.getByRole("button", { name: "Send request", exact: true }).click();
  await expect(
    page.getByText("Request sent. Our answer will appear below."),
  ).toBeVisible();
  await expect(
    page.getByText("Withdraw my consent · Waiting for an answer"),
  ).toBeVisible();

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/consent$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Before you start");
  await expect(page.getByLabel("What do you need?", { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Requests about your data" }).click();
  await expect(page).toHaveURL(/\/settings\/privacy$/);
  await expect(page.getByLabel("What do you need?", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Withdraw my consent · Waiting for an answer"),
  ).toBeVisible();
  await page.goto("/consent");

  await page.locator('input[name="accepted"]').check();
  await page.getByRole("button", { name: "Agree and continue" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("the leaderboard choice remains in Settings → Privacy without a public-profile switch", async ({
  page,
  baseURL,
}) => {
  await signInExisting(page, baseURL!);
  await page.goto("/settings");
  const privacy = page.locator("#privacy");
  await expect(
    privacy.getByRole("switch", { name: "Show my public profile" }),
  ).toHaveCount(0);
  const leaderboard = privacy.getByRole("switch", {
    name: "Show me on the leaderboard",
  });
  await expect(leaderboard).toBeChecked();
  await leaderboard.click();
  await expect(
    privacy.getByText("You are no longer on the leaderboard."),
  ).toBeVisible();

  await page.goto("/settings");
  await page
    .locator("#privacy")
    .getByRole("link", { name: "Your data and requests" })
    .click();
  await expect(page).toHaveURL(/\/settings\/privacy$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Requests about your data",
  );
});

test("the consent page has no data-request form for a signed-in volunteer", async ({
  page,
  baseURL,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await signInExisting(page, baseURL!);
  await page.goto("/consent");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByLabel("What do you need?", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Send request", exact: true }),
  ).toHaveCount(0);
});

test("data requests require sign-in", async ({ page }) => {
  await page.goto("/settings/privacy");
  await expect(page).toHaveURL(/\/login\?next=%2Fsettings%2Fprivacy$/);
  await expect(page.getByLabel("What do you need?", { exact: true })).toHaveCount(0);
});
