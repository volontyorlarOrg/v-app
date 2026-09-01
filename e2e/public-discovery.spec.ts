import { expect, test } from "@playwright/test";

/**
 * The public volunteer journey.
 *
 * This is the path that actually runs today: browse, filter, open, switch
 * language, and confirm a deep link still resolves. It needs no backend
 * because opportunity reads fall back to the sample source.
 */

test.describe("opportunity discovery", () => {
  test("lists opportunities and shows the sample-data notice", async ({ page }) => {
    await page.goto("/uz/opportunities");

    await expect(
      page.getByRole("heading", { level: 1, name: /imkoniyatlar/i }),
    ).toBeVisible();

    // Sample data must always announce itself.
    await expect(page.getByRole("note")).toContainText(/namuna/i);

    await expect(page.getByRole("article").first()).toBeVisible();
  });

  test("filtering by region puts the filter in the URL and narrows the list", async ({
    page,
  }) => {
    await page.goto("/en/opportunities");

    // `count()` does not auto-wait, so the list must be on screen first.
    await expect(page.getByRole("article").first()).toBeVisible();
    const before = await page.getByRole("article").count();
    expect(before).toBeGreaterThan(1);

    await page
      .getByLabel("Region", { exact: true })
      .selectOption("samarkand");

    // The filter must be in the address, not only in React state — this is
    // what makes a filtered listing shareable.
    await expect(page).toHaveURL(/region=samarkand/);

    await expect
      .poll(async () => page.getByRole("article").count())
      .toBeLessThan(before);
  });

  test("a shared filtered URL reproduces the same listing", async ({ page }) => {
    await page.goto("/en/opportunities?region=samarkand&sort=deadline");

    await expect(page.getByLabel("Region", { exact: true })).toHaveValue(
      "samarkand",
    );
    await expect(page.getByRole("article")).toHaveCount(1);
  });

  test("an unknown filter value degrades instead of erroring", async ({ page }) => {
    const response = await page.goto("/en/opportunities?region=atlantis&page=abc");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("article").first()).toBeVisible();
  });

  test("clearing filters returns to the full list", async ({ page }) => {
    await page.goto("/en/opportunities?region=samarkand");
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.getByRole("button", { name: /clear filters/i }).click();

    await expect(page).not.toHaveURL(/region=/);
    await expect
      .poll(async () => page.getByRole("article").count())
      .toBeGreaterThan(1);
  });

  test("opening an opportunity shows the facts needed to decide", async ({
    page,
  }) => {
    await page.goto("/en/opportunities");
    await page.getByRole("article").first().getByRole("link").first().click();

    await expect(page).toHaveURL(/\/en\/opportunities\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Organiser, date, location, and deadline are the minimum set. Exact
    // matching, because "Applications close" is a prefix of the closed-state
    // badge text and would otherwise match three nodes.
    await expect(page.getByText("Organiser", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Applications close", { exact: true }),
    ).toBeVisible();
  });

  test("a deep link straight to a detail page works", async ({ page }) => {
    // The Telegram case: no navigation history, no prior page.
    const response = await page.goto("/uz/opportunities/winter-book-drive-tashkent");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("a signed-out visitor is asked to sign in before applying", async ({
    page,
  }) => {
    await page.goto("/en/opportunities/winter-book-drive-tashkent");

    const cta = page.getByRole("link", { name: /sign in to apply/i });
    await expect(cta).toBeVisible();

    // The destination must be preserved so sign-in can return them here.
    await expect(cta).toHaveAttribute("href", /next=/);
  });

  test("a removed opportunity gets its own message, not a bare 404", async ({
    page,
  }) => {
    await page.goto("/en/opportunities/this-does-not-exist");

    await expect(page.getByText(/no longer listed/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /browse opportunities/i })).toBeVisible();
  });
});

test.describe("localisation", () => {
  test("switching language keeps the page and its filters", async ({ page }) => {
    await page.goto("/en/opportunities?region=samarkand");

    await page.getByLabel("Change language").selectOption("ru");

    // Route-preserving *and* query-preserving: switching language must not
    // silently discard what the visitor was looking at.
    await expect(page).toHaveURL(/\/ru\/opportunities\?.*region=samarkand/);
    await expect(
      page.getByRole("heading", { level: 1, name: /возможности/i }),
    ).toBeVisible();
  });

  test("each locale serves its own translated listing", async ({ page }) => {
    for (const [locale, heading] of [
      ["uz", /imkoniyatlar/i],
      ["ru", /возможности/i],
      ["en", /opportunities/i],
    ] as const) {
      await page.goto(`/${locale}/opportunities`);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
  });

  test("the html lang attribute matches the locale", async ({ page }) => {
    await page.goto("/ru/opportunities");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru-RU");
  });

  test("an unprefixed path redirects to a locale", async ({ page }) => {
    await page.goto("/opportunities");
    await expect(page).toHaveURL(/\/(uz|ru|en)\/opportunities/);
  });
});

test.describe("mobile ergonomics", () => {
  test("the listing does not scroll horizontally at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/uz/opportunities");

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );

    expect(overflows).toBe(false);
  });

  test("the detail page does not scroll horizontally at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/uz/opportunities/winter-book-drive-tashkent");

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );

    expect(overflows).toBe(false);
  });

  test("the skip link is the first thing keyboard focus reaches", async ({
    page,
  }) => {
    await page.goto("/en/opportunities");
    await page.keyboard.press("Tab");

    await expect(page.locator(":focus")).toHaveText(/skip to content/i);
  });
});
