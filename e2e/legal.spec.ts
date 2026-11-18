import { expect, test, type Page } from "@playwright/test";

async function signInExisting(page: Page, baseURL: string) {
  await page
    .context()
    .addCookies([{ name: "volontyorlar_locale", value: "en", url: baseURL }]);
  await page.goto("/api/auth/telegram/start?locale=en");
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("sign-up starts with one consent box", async ({ page }) => {
  await page.goto("/en/signup");
  await expect(page).toHaveURL(/\/consent$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Before you start");
  const required = page.locator('input[name="accepted"]');
  await expect(
    page.getByText(
      /agree to the processing described and to my profile being visible to others/,
    ),
  ).toBeVisible();
  await expect(required).not.toBeChecked();
  await expect(page.getByLabel("What do you need?", { exact: true })).toHaveCount(0);
  await expect(
    page.locator('input[name="leaderboard"], input[name="publicProfile"]'),
  ).toHaveCount(0);
  await expect(page.locator('input[name="ageBand"], input[type="date"]')).toHaveCount(
    0,
  );

  const submit = page.getByRole("button", { name: "Agree and continue" });
  await submit.click();
  await expect(page).toHaveURL(/\/consent$/);

  await required.check();
  await submit.click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.locator('input[name="fullName"]')).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
});

test("the consent step keeps the safe return path through sign-up", async ({
  page,
}) => {
  const next = "/opportunities/book-drive";
  await page.goto(`/en/signup?next=${encodeURIComponent(next)}`);
  expect(new URL(page.url()).searchParams.get("next")).toBe(next);
  await page.locator('input[name="accepted"]').check();
  await page.getByRole("button", { name: "Agree and continue" }).click();
  await expect(page).toHaveURL(/\/signup\?next=/);
  expect(new URL(page.url()).searchParams.get("next")).toBe(next);
  const provider = await page
    .getByRole("link", { name: "Continue with Telegram" })
    .getAttribute("href");
  expect(new URL(provider!, page.url()).searchParams.get("next")).toBe(next);
});

test("a guest can change the language on the consent page without losing the return path", async ({
  page,
}) => {
  const next = "/opportunities/book-drive";
  await page.goto(`/en/consent?next=${encodeURIComponent(next)}`);
  for (const [locale, name] of [
    ["ru", "Русский"],
    ["uz", "O‘zbekcha"],
    ["en", "English"],
  ] as const) {
    await page.getByRole("banner").locator('button[aria-haspopup="menu"]').click();
    await page.getByRole("menuitem", { name: new RegExp(`^${name}`) }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    expect(new URL(page.url()).searchParams.get("next")).toBe(next);
    await expect(page.locator('input[name="accepted"]')).not.toBeChecked();
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
