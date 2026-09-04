import { expect, test, type Page } from "@playwright/test";

const LOCALES = ["uz", "ru", "en"] as const;

async function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1280) < 1024;
}

test.describe("locale routing", () => {
  for (const locale of LOCALES) {
    test(`the ${locale} sign-in page renders in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/login`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });
  }

  test("the prefix-less root lands on sign-in in a locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(uz|ru|en)\/login$/);
  });

  test("switching language keeps the same page", async ({ page }) => {
    await page.goto("/uz/login");
    await page.getByRole("button", { name: /Til: O‘zbekcha/ }).click();
    await page.getByRole("link", { name: "English", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/login$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test.describe("sign-in preview", () => {
  test("says on screen that sign-in is not connected", async ({ page }) => {
    await page.goto("/en/login");
    await expect(page.getByRole("note")).toContainText(/not connected/i);
  });

  test("the email form opens the dashboard without sending anything", async ({
    page,
  }) => {
    await page.goto("/en/login");
    await page.getByLabel("Email").fill("dilnoza@example.org");
    await page.getByLabel("Password", { exact: true }).fill("preview-only");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/en\/dashboard$/);
    expect(page.url()).not.toContain("dilnoza");
  });

  test("Google and Telegram open the dashboard", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByRole("link", { name: "Continue with Google" }).click();
    await expect(page).toHaveURL(/\/en\/dashboard$/);

    await page.goto("/en/login");
    await page.getByRole("link", { name: "Continue with Telegram" }).click();
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });

  test("sign-up has the three fields and also opens the dashboard", async ({
    page,
  }) => {
    await page.goto("/en/login");
    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(page).toHaveURL(/\/en\/signup$/);

    await page.getByLabel("Full name").fill("Dilnoza Karimova");
    await page.getByLabel("Email").fill("dilnoza@example.org");
    await page.getByLabel("Password", { exact: true }).fill("preview-only");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });

  test("password reset returns to sign-in with a status message", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL(/\/en\/forgot-password$/);

    await page.getByLabel("Email").fill("dilnoza@example.org");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page).toHaveURL(/\/en\/login\?reset=sent$/);
    await expect(page.getByRole("status")).toContainText(/reset link/i);
  });
});

test.describe("the panel", () => {
  test("greets the sample volunteer and labels the data as a sample", async ({
    page,
  }) => {
    await page.goto("/en/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Dilnoza");
    await expect(page.getByText("Sample data").first()).toBeVisible();
  });

  test("shows the three dashboard decisions without hiding later content", async ({
    page,
  }) => {
    await page.goto("/en/dashboard");
    for (const name of ["Next up", "Your applications", "Your progress"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
    const progress = page.getByRole("heading", { level: 2, name: "Your progress" });
    await progress.scrollIntoViewIfNeeded();
    await expect(progress).toBeVisible();
    await expect(
      page.getByRole("progressbar", { name: "Profile completeness" }),
    ).toHaveAttribute("aria-valuenow", "83");
  });

  test("reaches every section from the shell, with an h1 on each", async ({ page }) => {
    await page.goto("/en/dashboard");
    const mobile = await isMobile(page);
    const navigation = page.getByRole("navigation", {
      name: mobile ? "App sections" : "Main navigation",
    });

    await navigation.getByRole("link", { name: "Applications" }).click();
    await expect(page).toHaveURL(/\/en\/applications$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Your applications" }),
    ).toBeVisible();

    await navigation.getByRole("link", { name: "Opportunities" }).click();
    await expect(page).toHaveURL(/\/en\/opportunities$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Opportunities" }),
    ).toBeVisible();

    for (const path of ["/en/record", "/en/profile", "/en/settings"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    }
  });

  test("the notifications menu opens, counts unread and marks them read", async ({
    page,
  }) => {
    await page.goto("/en/dashboard");
    const bell = page.getByRole("button", { name: /Notifications \(\d+\)/ });
    await bell.click();
    await expect(page.getByText("Notifications", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await expect(
      page.getByRole("button", { name: "Notifications", exact: true }),
    ).toBeVisible();
  });

  test("the account menu keeps one profile destination and sign out", async ({ page }) => {
    await page.goto("/en/dashboard");
    await page.getByRole("button", { name: /Account menu/ }).click();
    const menu = page.getByRole("navigation", { name: "Account menu" });
    await expect(menu.getByRole("link", { name: "Profile" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Settings" })).toHaveCount(0);
    await menu.getByRole("link", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/en\/login$/);
  });

  test("the theme switch flips the document theme", async ({ page }) => {
    await page.goto("/en/dashboard");
    const toggle = page.getByRole("switch", { name: "Dark theme" });
    const before = await page.locator("html").getAttribute("data-theme");
    await toggle.click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
  });

  test("nothing overflows horizontally", async ({ page }) => {
    for (const path of [
      "/uz/dashboard",
      "/ru/opportunities",
      "/uz/record",
      "/ru/settings",
    ]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test("renders complete with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/dashboard");
    const hidden = await page.evaluate(
      () =>
        [...document.querySelectorAll<HTMLElement>("[data-scene]")].filter(
          (element) => getComputedStyle(element).opacity === "0",
        ).length,
    );
    expect(hidden).toBe(0);
    expect(await page.locator("html").getAttribute("data-motion")).toBeNull();
  });
});

test.describe("opportunities", () => {
  test("saved opportunities are a view and the old route redirects to it", async ({
    page,
  }) => {
    await page.goto("/en/saved");
    await expect(page).toHaveURL(/\/en\/opportunities\?view=saved$/);
    const views = page.getByRole("navigation", {
      name: "Choose which opportunities to show",
    });
    await expect(views.getByRole("link", { name: /Saved/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("article")).toHaveCount(2);
  });

  test("filtering by region puts the filter in the URL and narrows the list", async ({
    page,
  }) => {
    await page.goto("/en/opportunities");
    const before = await page.getByRole("article").count();
    expect(before).toBeGreaterThan(3);

    await page.getByLabel("Region").selectOption("samarkand");
    await expect(page).toHaveURL(/region=samarkand/);
    await expect(page.getByRole("article")).toHaveCount(1);

    await page.getByRole("link", { name: "Clear filters" }).first().click();
    await expect(page).not.toHaveURL(/region=/);
  });

  test("the open-only switch and the search both round-trip through the URL", async ({
    page,
  }) => {
    await page.goto("/en/opportunities?open=1&q=book");
    await expect(page.getByRole("switch", { name: "Open only" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(page.getByLabel("Search", { exact: true })).toHaveValue("book");
    await expect(page.getByRole("article")).toHaveCount(1);
  });

  test("an unknown filter value degrades instead of erroring", async ({ page }) => {
    const response = await page.goto("/en/opportunities?region=atlantis&sort=abc");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("article").first()).toBeVisible();
  });

  test("opening an opportunity shows the facts, requirements and questions", async ({
    page,
  }) => {
    await page.goto("/en/opportunities/winter-book-drive");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("book drive");
    for (const name of ["At a glance", "What you need", "What you will be asked"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Apply" })).toBeDisabled();
    const save = page.getByRole("button", { name: /^Save$|^Saved$/ }).first();
    await save.click();
    await expect(save).toHaveAttribute("aria-pressed", "true");
  });

  test("an unknown opportunity is a 404 inside the panel", async ({ page }) => {
    const response = await page.goto("/en/opportunities/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
  });
});

test.describe("applications, record, profile and settings", () => {
  test("applications filter by group and open a detail with a timeline", async ({
    page,
  }) => {
    await page.goto("/en/applications?group=drafts");
    await expect(page.getByRole("link", { name: /Drafts/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await page
      .getByRole("link", { name: /book drive/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/en\/applications\/app-book-drive$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Progress" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue draft" })).toBeDisabled();
  });

  test("the record shows a history table with the awaiting-confirmation rule", async ({
    page,
  }) => {
    await page.goto("/en/record");
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText("They never count against you.").first()).toBeVisible();
  });

  test("the profile form saves only in the preview and says so", async ({ page }) => {
    await page.goto("/en/profile");
    await page.getByLabel("Short introduction").fill("Second-year student.");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByRole("status")).toContainText(/preview/i);
  });

  test("legacy settings redirects to profile where preferences still work", async ({
    page,
  }) => {
    await page.goto("/en/settings");
    await expect(page).toHaveURL(/\/en\/profile$/);
    const telegram = page.getByRole("switch", { name: "Telegram messages" });
    const telegramBefore = await telegram.getAttribute("aria-checked");
    await telegram.click();
    await expect(telegram).not.toHaveAttribute(
      "aria-checked",
      telegramBefore ?? "false",
    );

    const dark = page.getByRole("switch", { name: "Dark theme" }).last();
    const before = await page.locator("html").getAttribute("data-theme");
    await dark.click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
  });
});

test.describe("privacy and hardening", () => {
  test("every page is kept out of search engines", async ({ request }) => {
    for (const path of ["/uz/login", "/uz/dashboard", "/robots.txt"]) {
      const response = await request.get(path);
      expect(response.headers()["x-robots-tag"]).toContain("noindex");
    }
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /");
  });

  test("security headers are present and the framework is not advertised", async ({
    request,
  }) => {
    const headers = (await request.get("/en/login")).headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["content-security-policy"]).not.toContain(
      "upgrade-insecure-requests",
    );
    expect(headers["strict-transport-security"]).toBeUndefined();
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("an unknown URL returns a 404 page", async ({ page }) => {
    const response = await page.goto("/uz/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
});
