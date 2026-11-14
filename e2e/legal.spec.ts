import { expect, test, type Page } from "@playwright/test";

async function signInExisting(page: Page, baseURL: string) {
  await page
    .context()
    .addCookies([{ name: "volontyorlar_locale", value: "en", url: baseURL }]);
  await page.goto("/api/auth/telegram/start?locale=en");
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("sign-up starts with one consent and leaves the optional choices unticked", async ({
  page,
}) => {
  await page.goto("/en/signup");
  await expect(page).toHaveURL(/\/consent$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Before you start");
  const required = page.locator('input[name="accepted"]');
  await expect(required).not.toBeChecked();
  await expect(page.locator('input[name="leaderboard"]')).not.toBeChecked();
  await expect(page.locator('input[name="publicProfile"]')).not.toBeChecked();
  await expect(page.locator('input[name="ageBand"], input[type="date"]')).toHaveCount(0);

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

test("the consent step keeps the safe return path through sign-up", async ({ page }) => {
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
  await page.goto("/consent");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your data");
  await page
    .getByLabel("What do you need?", { exact: true })
    .selectOption("withdrawal");
  await page.getByRole("button", { name: "Send request", exact: true }).click();
  await expect(page.getByText("Request sent. Our answer will appear below.")).toBeVisible();
  await expect(page.getByText("Withdraw my consent · Waiting for an answer")).toBeVisible();

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/consent$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Before you start");
  await expect(page.getByLabel("What do you need?", { exact: true })).toBeVisible();

  await page.locator('input[name="accepted"]').check();
  await page.locator('input[name="leaderboard"]').check();
  await page.getByRole("button", { name: "Agree and continue" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("the leaderboard and public profile are switched in Settings → Privacy", async ({
  page,
  baseURL,
}) => {
  await signInExisting(page, baseURL!);
  await page.goto("/settings");
  const privacy = page.locator("#privacy");
  const leaderboard = privacy.getByRole("switch", { name: "Show me on the leaderboard" });
  await expect(leaderboard).toBeChecked();
  await leaderboard.click();
  await expect(privacy.getByText("You are no longer on the leaderboard.")).toBeVisible();

  await page.goto("/settings");
  await page.locator("#privacy").getByRole("link", { name: "Your data and requests" }).click();
  await expect(page).toHaveURL(/\/consent$/);
});
