import { expect, test, type Page } from "@playwright/test";

const LOCALES = ["uz", "ru", "en"] as const;

async function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1280) < 1024;
}

async function signIn(page: Page, locale = "en") {
  await page.goto(`/api/auth/telegram/start?locale=${locale}`);
  await expect(page).toHaveURL(new RegExp(`/${locale}/dashboard$`));
}

async function startedState(page: Page) {
  const response = await page.request.get("/api/auth/telegram/start?locale=en", {
    maxRedirects: 0,
  });
  const location = response.headers()["location"] ?? "";
  return new URL(location).searchParams.get("state") ?? "";
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

test.describe("sign-in", () => {
  test("offers Telegram as the way in and keeps Google inert", async ({ page }) => {
    await page.goto("/en/login");
    await expect(page.getByRole("link", { name: "Continue with Telegram" })).toHaveAttribute(
      "href",
      "/api/auth/telegram/start?locale=en",
    );
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    await expect(page.getByText("Google sign-in isn't available yet.")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveCount(0);
    await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
  });

  test("the Telegram button hands the browser to Telegram's sign-in page with a bound state", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/telegram/start?locale=en", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(303);
    const location = response.headers()["location"] ?? "";
    expect(location).toMatch(/\/oauth\/auth\?state=e2e-state-/);
    const state = new URL(location).searchParams.get("state") ?? "";
    expect(response.headers()["set-cookie"]).toContain(`volontyorlar_auth_state=${state}`);
  });

  test("create account is the same Telegram flow", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(page).toHaveURL(/\/en\/signup$/);
    await expect(page.getByRole("link", { name: "Continue with Telegram" })).toBeVisible();
    await expect(page.getByLabel("Full name")).toHaveCount(0);
    await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
  });

  test("the password reset route no longer exists", async ({ page }) => {
    const response = await page.goto("/en/forgot-password");
    expect(response?.status()).toBe(404);
  });

  test("a callback whose state is not the one this browser started is refused", async ({
    page,
  }) => {
    await startedState(page);
    await page.goto(
      "/api/auth/telegram/callback?code=e2e-code&state=e2e-state-0000-never-minted-here",
    );
    await expect(page).toHaveURL(/\/en\/login\?telegram=expired$/);
    await expect(page.getByRole("status")).toContainText(/expired/i);

    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/login\?next=/);
  });

  test("a state can be redeemed only once", async ({ page }) => {
    const state = await startedState(page);
    const handoff = (await page.context().cookies()).filter(
      (cookie) => cookie.name !== "volontyorlar_session",
    );
    await page.goto(`/api/auth/telegram/callback?code=e2e-code&state=${state}`);
    await expect(page).toHaveURL(/\/en\/dashboard$/);

    await page.context().clearCookies();
    await page.context().addCookies(handoff);
    await page.goto(`/api/auth/telegram/callback?code=e2e-code&state=${state}`);
    await expect(page).toHaveURL(/\/en\/login\?telegram=expired$/);
  });

  test("a sign-in that did not share a phone number is refused with a message", async ({
    page,
  }) => {
    const state = await startedState(page);
    await page.goto(`/api/auth/telegram/callback?code=no-phone&state=${state}`);
    await expect(page).toHaveURL(/\/en\/login\?telegram=phoneRequired$/);
    await expect(page.getByRole("status")).toContainText(/phone number/i);

    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/login\?next=/);
  });

  test("declining in Telegram returns to sign-in as cancelled", async ({ page }) => {
    await startedState(page);
    await page.goto("/api/auth/telegram/callback?error=access_denied");
    await expect(page).toHaveURL(/\/en\/login\?telegram=cancelled$/);
    await expect(page.getByRole("status")).toContainText(/cancelled/i);
  });

  test("completing Telegram sign-in lands on the dashboard, which greets the volunteer", async ({
    page,
  }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Dilnoza");
    await expect(page.getByText("Sample data")).toHaveCount(0);
  });

  test("sign-in returns to the page that required it", async ({ page }) => {
    await page.goto("/en/record");
    await expect(page).toHaveURL(/\/en\/login\?next=%2Fen%2Frecord$/);
    await page.getByRole("link", { name: "Continue with Telegram" }).click();
    await expect(page).toHaveURL(/\/en\/record$/);
  });

  test("the panel is not reachable without a session", async ({ page }) => {
    for (const path of ["/en/dashboard", "/en/opportunities", "/en/profile", "/en/record"]) {
      await page.goto(path);
      await expect(page, path).toHaveURL(/\/en\/login\?next=/);
    }
  });

  test("a signed-in volunteer is sent from sign-in to the dashboard", async ({ page }) => {
    await signIn(page);
    await page.goto("/en/login");
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });

  test("an ended session returns to sign-in with a message", async ({ page }) => {
    await signIn(page);
    await page.goto("/api/auth/session/expired?locale=en");
    await expect(page).toHaveURL(/\/en\/login\?session=expired$/);
    await expect(page.getByRole("status")).toContainText(/session ended/i);
    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/login\?next=/);
  });
});

test.describe("the panel", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("shows the three dashboard decisions on the volunteer's own data", async ({
    page,
  }) => {
    for (const name of ["Next up", "Your applications", "Your progress"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
    await expect(
      page.getByRole("link", { name: "Riverbank clean-up" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("progressbar", { name: "Profile completeness" }),
    ).toHaveAttribute("aria-valuenow", "83");
  });

  test("reaches every section from the shell, with an h1 on each", async ({ page }) => {
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

  test("the notifications menu shows the backend's messages and marks them read", async ({
    page,
  }) => {
    const bell = page.getByRole("button", { name: "Notifications (1)" });
    await bell.click();
    await expect(page.getByText("You were accepted to Riverbank clean-up")).toBeVisible();
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await expect(
      page.getByRole("button", { name: "Notifications", exact: true }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("button", { name: "Notifications", exact: true }),
    ).toBeVisible();
  });

  test("the account menu keeps one profile destination and really signs out", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /Account menu/ }).click();
    const menu = page.getByRole("navigation", { name: "Account menu" });
    await expect(menu.getByRole("link", { name: "Profile" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Settings" })).toHaveCount(0);
    await menu.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/en\/login$/);

    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/login\?next=/);
  });

  test("the theme switch flips the document theme", async ({ page }) => {
    const toggle = page.getByRole("switch", { name: "Dark theme" });
    const before = await page.locator("html").getAttribute("data-theme");
    await toggle.click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
  });

  test("nothing overflows horizontally", async ({ page }) => {
    for (const path of [
      "/en/dashboard",
      "/en/opportunities",
      "/en/record",
      "/en/profile",
      "/en/applications/app-book-drive",
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
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

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

  test("filtering by region puts the filter in the URL and asks the backend", async ({
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

  test("saving an opportunity persists on the backend", async ({ page }) => {
    await page.goto("/en/opportunities/winter-book-drive");
    const save = page.getByRole("button", { name: /^Save$|^Saved$/ }).first();
    await expect(save).toHaveAttribute("aria-pressed", "false");
    await save.click();
    await expect(save).toHaveAttribute("aria-pressed", "true");
    await expect(save).toBeEnabled();

    await page.reload();
    await expect(
      page.getByRole("button", { name: /^Save$|^Saved$/ }).first(),
    ).toHaveAttribute("aria-pressed", "true");
    await page.goto("/en/opportunities?view=saved");
    await expect(page.getByRole("article")).toHaveCount(3);
  });

  test("opening an opportunity shows the facts, requirements and questions", async ({
    page,
  }) => {
    await page.goto("/en/opportunities/winter-book-drive");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("book drive");
    for (const name of ["At a glance", "What you need", "What you will be asked"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Continue draft" }).first()).toBeVisible();
  });

  test("applying creates a draft and submitting it needs the required answer", async ({
    page,
  }) => {
    await page.goto("/en/opportunities/remote-translation-support");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page).toHaveURL(/\/en\/applications\/app-remote-translation-support$/);

    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByRole("alert").first()).toContainText(/required/i);

    await page.locator('select[name^="answer."]').selectOption("uz-en");
    await page.getByRole("checkbox", { name: "Google Docs" }).check();
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByText("Submitted", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit application" })).toHaveCount(0);
    await expect(page.getByText("Uzbek and English")).toBeVisible();
  });

  test("a closed opportunity cannot be applied to", async ({ page }) => {
    await page.goto("/en/opportunities/read-aloud-day");
    await expect(page.getByRole("button", { name: "Applications are closed" })).toBeDisabled();
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
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("applications filter by group and a draft can be saved", async ({ page }) => {
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

    await page.getByRole("textbox", { name: /Why does this matter/ }).fill("Because books.");
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByRole("status").last()).toContainText("Draft saved.");

    await page.reload();
    await expect(page.getByRole("textbox", { name: /Why does this matter/ })).toHaveValue(
      "Because books.",
    );
  });

  test("an accepted application can be withdrawn after confirming", async ({ page }) => {
    await page.goto("/en/applications/app-riverbank");
    await page.getByRole("button", { name: "Withdraw application" }).click();
    await page.getByRole("button", { name: "Yes, withdraw" }).click();
    await expect(page.getByText("Withdrawn", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Withdraw application" })).toHaveCount(0);
  });

  test("an unknown application is a 404", async ({ page }) => {
    const response = await page.goto("/en/applications/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("the record shows a history table with the awaiting-confirmation rule", async ({
    page,
  }) => {
    await page.goto("/en/record");
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText("Photo archive digitisation")).toBeVisible();
    await expect(page.getByText("They never count against you.").first()).toBeVisible();
  });

  test("the profile form saves to the backend", async ({ page }) => {
    await page.goto("/en/profile");
    await page.getByLabel("Short introduction").fill("Second-year student.");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByRole("status").last()).toContainText("Profile saved.");

    await page.reload();
    await expect(page.getByLabel("Short introduction")).toHaveValue("Second-year student.");
    await expect(
      page.getByRole("progressbar", { name: "Profile completeness" }),
    ).toHaveAttribute("aria-valuenow", "100");
  });

  test("legacy settings redirects to profile where preferences persist", async ({
    page,
  }) => {
    await page.goto("/en/settings");
    await expect(page).toHaveURL(/\/en\/profile$/);
    const telegram = page.getByRole("switch", { name: "Telegram messages" });
    await expect(telegram).toHaveAttribute("aria-checked", "true");
    await telegram.click();
    await expect(telegram).toHaveAttribute("aria-checked", "false");
    await expect(telegram).toBeEnabled();

    await page.reload();
    await expect(page.getByRole("switch", { name: "Telegram messages" })).toHaveAttribute(
      "aria-checked",
      "false",
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
