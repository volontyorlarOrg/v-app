import { expect, test, type Page } from "@playwright/test";

import { PASSWORD_MIN_LENGTH } from "@/lib/auth/credentials";

const LOCALES = ["uz", "ru", "en"] as const;

async function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1280) < 1024;
}

async function signIn(page: Page, locale = "en") {
  await page.goto(`/api/auth/telegram/start?locale=${locale}`);
  await expect(page).toHaveURL(new RegExp(`/${locale}/dashboard$`));
}

const PASSPHRASE = "seven purple lanterns";

async function postGoogleAnswer(page: Page, state: string) {
  await page.goto("/en/login");
  await page.evaluate(
    (posted) => {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/api/auth/google/callback";
      for (const [name, value] of Object.entries(posted)) {
        const field = document.createElement("input");
        field.type = "hidden";
        field.name = name;
        field.value = value;
        form.append(field);
      }
      document.body.append(form);
      form.submit();
    },
    { id_token: "e2e-google-id-token", state },
  );
}

async function googleState(page: Page) {
  const response = await page.request.get("/api/auth/google/start?locale=en", {
    maxRedirects: 0,
  });
  const location = response.headers()["location"] ?? "";
  return new URL(location).searchParams.get("state") ?? "";
}

async function startedState(page: Page) {
  const response = await page.request.get("/api/auth/telegram/start?locale=en", {
    maxRedirects: 0,
  });
  const location = response.headers()["location"] ?? "";
  return new URL(location).searchParams.get("state") ?? "";
}

async function submitPasswordLogin(page: Page, destination: RegExp) {
  await page.getByRole("button", { name: "Show password" }).click();
  await page.getByRole("button", { name: "Hide password" }).click();

  await page.getByLabel("Email").fill("dilnoza@example.org");
  await page.getByLabel("Password", { exact: true }).fill(PASSPHRASE);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(destination);
}

async function signInWithPassword(page: Page, locale = "en") {
  await page.goto(`/${locale}/login`);
  await submitPasswordLogin(page, new RegExp(`/${locale}/dashboard$`));
}

async function connectState(
  page: Page,
  provider: "telegram" | "google",
  locale = "en",
) {
  const response = await page.request.get(
    `/api/auth/connect/${provider}/start?locale=${locale}`,
    { maxRedirects: 0 },
  );
  const location = response.headers()["location"] ?? "";
  return new URL(location).searchParams.get("state") ?? "";
}

async function completeTelegramConnection(page: Page, code: string, state?: string) {
  const bound = state ?? (await connectState(page, "telegram"));
  await page.goto(
    `/api/auth/connect/telegram/callback?code=${code}&state=${encodeURIComponent(bound)}`,
  );
}

async function postGoogleConnection(page: Page, state: string, credential: string) {
  await page.goto("/en/settings");
  await page.evaluate(
    (posted) => {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/api/auth/connect/google/callback";
      for (const [name, value] of Object.entries(posted)) {
        const field = document.createElement("input");
        field.type = "hidden";
        field.name = name;
        field.value = value;
        form.append(field);
      }
      document.body.append(form);
      form.submit();
    },
    { id_token: credential, state },
  );
}

function requestRow(page: Page, panel: string, provider: string) {
  return page
    .getByRole("region", { name: panel })
    .getByRole("listitem")
    .filter({ hasText: `Through ${provider}` });
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
  test("offers Telegram, Google and the email form", async ({ page }) => {
    await page.goto("/en/login");
    await expect(
      page.getByRole("link", { name: "Continue with Telegram" }),
    ).toHaveAttribute("href", "/api/auth/telegram/start?locale=en");
    await expect(
      page.getByRole("link", { name: "Continue with Google" }),
    ).toHaveAttribute("href", "/api/auth/google/start?locale=en");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  });

  test("the Google button asks Google for an ID token bound to this browser", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/google/start?locale=en", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(303);
    const location = new URL(response.headers()["location"] ?? "");
    expect(`${location.origin}${location.pathname}`).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    expect(location.searchParams.get("response_type")).toBe("id_token");
    expect(location.searchParams.get("response_mode")).toBe("form_post");
    expect(location.searchParams.get("scope")).toBe("openid email profile");
    expect(location.searchParams.get("nonce")).toMatch(/^e2e-google-nonce-/);
    const state = location.searchParams.get("state") ?? "";
    const cookie = response.headers()["set-cookie"] ?? "";
    expect(cookie).toContain(`volontyorlar_google_state=${state}`);
    expect(cookie).toContain("Secure");
    expect(cookie.toLowerCase()).toContain("samesite=none");
  });

  test("a Google post whose state is not the one this browser started is refused", async ({
    page,
  }) => {
    await googleState(page);
    await postGoogleAnswer(page, "e2e-google-state-9999-never-minted-here");
    await expect(page).toHaveURL(/\/en\/login\?google=expired$/);

    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/login\?next=/);
  });

  test("completing Google sign-in lands on the dashboard", async ({ page }) => {
    const state = await googleState(page);
    await postGoogleAnswer(page, state);
    await expect(page).toHaveURL(/\/en\/dashboard$/);

    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });

  test("the email form names a malformed address before it reaches the backend", async ({
    page,
  }) => {
    await page.goto("/en/login");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill(PASSPHRASE);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(
      page.getByText("Enter an email address, like name@example.com."),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/en\/login$/);
  });

  test("email and password sign-in lands on the dashboard", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByLabel("Email").fill("dilnoza@example.org");
    await page.getByLabel("Password", { exact: true }).fill(PASSPHRASE);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });

  test("a wrong password is refused without naming which half was wrong", async ({
    page,
  }) => {
    await page.goto("/en/login");
    await page.getByLabel("Email").fill("dilnoza@example.org");
    await page.getByLabel("Password", { exact: true }).fill("not the passphrase");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(
      page.getByText("That email and password do not match an account.", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/en\/login$/);
  });

  test("a short password is refused in the browser, with the rule in words", async ({
    page,
  }) => {
    await page.goto("/en/signup");
    await page.getByLabel("Full name").fill("Malika Karimova");
    await page.getByLabel("Email").fill("malika@example.org");
    await page.getByLabel("Password", { exact: true }).fill("ab");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(
      page.getByText(`Use at least ${PASSWORD_MIN_LENGTH} characters.`),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/en\/signup$/);
  });

  test("an address that already has an account is named by the backend", async ({
    page,
  }) => {
    await page.goto("/en/signup");
    await page.getByLabel("Full name").fill("Dilnoza Karimova");
    await page.getByLabel("Email").fill("dilnoza@example.org");
    await page.getByLabel("Password", { exact: true }).fill(PASSPHRASE);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(
      page.getByText("An account already uses that email.", { exact: false }),
    ).toBeVisible();
  });

  test("creating an account with an email lands on the dashboard", async ({
    page,
  }, info) => {
    await page.goto("/en/signup");
    await page.getByLabel("Full name").fill("Malika Karimova");
    await page.getByLabel("Email").fill(`malika-${info.project.name}@example.org`);
    await page.getByLabel("Password", { exact: true }).fill(PASSPHRASE);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/en\/dashboard$/);
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
    expect(response.headers()["set-cookie"]).toContain(
      `volontyorlar_auth_state=${state}`,
    );
  });

  test("create account offers the same three ways in, plus a name", async ({
    page,
  }) => {
    await page.goto("/en/login");
    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(page).toHaveURL(/\/en\/signup$/);
    await expect(
      page.getByRole("link", { name: "Continue with Telegram" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Continue with Google" }),
    ).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
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
    for (const path of [
      "/en/dashboard",
      "/en/opportunities",
      "/en/profile",
      "/en/record",
    ]) {
      await page.goto(path);
      await expect(page, path).toHaveURL(/\/en\/login\?next=/);
    }
  });

  test("a signed-in volunteer is sent from sign-in to the dashboard", async ({
    page,
  }) => {
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
    await expect(
      page.getByText("You were accepted to Riverbank clean-up"),
    ).toBeVisible();
    await expect(page.getByText("An account asked to join yours")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "An account asked to join yours" }),
    ).toHaveAttribute("href", "/en/settings");
    await expect(page.getByText("bekzod@example.org")).toHaveCount(0);
    await expect(page.getByText("merge-incoming")).toHaveCount(0);
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await expect(
      page.getByRole("button", { name: "Notifications", exact: true }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("button", { name: "Notifications", exact: true }),
    ).toBeVisible();
  });

  test("the account menu reaches the profile and the account, and really signs out", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /Account menu/ }).click();
    const menu = page.getByRole("navigation", { name: "Account menu" });
    await expect(menu.getByRole("link", { name: "Profile" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/en/settings",
    );
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
      "/en/settings",
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
    await expect(
      page.getByRole("link", { name: "Continue draft" }).first(),
    ).toBeVisible();
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
    await expect(page.getByRole("button", { name: "Submit application" })).toHaveCount(
      0,
    );
    await expect(page.getByText("Uzbek and English")).toBeVisible();
  });

  test("a closed opportunity cannot be applied to", async ({ page }) => {
    await page.goto("/en/opportunities/read-aloud-day");
    await expect(
      page.getByRole("button", { name: "Applications are closed" }),
    ).toBeDisabled();
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

    await page
      .getByRole("textbox", { name: /Why does this matter/ })
      .fill("Because books.");
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByRole("status").last()).toContainText("Draft saved.");

    await page.reload();
    await expect(
      page.getByRole("textbox", { name: /Why does this matter/ }),
    ).toHaveValue("Because books.");
  });

  test("an accepted application can be withdrawn after confirming", async ({
    page,
  }) => {
    await page.goto("/en/applications/app-riverbank");
    await page.getByRole("button", { name: "Withdraw application" }).click();
    await page.getByRole("button", { name: "Yes, withdraw" }).click();
    await expect(page.getByText("Withdrawn", { exact: true }).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Withdraw application" }),
    ).toHaveCount(0);
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
    await expect(page.getByLabel("Short introduction")).toHaveValue(
      "Second-year student.",
    );
    await expect(
      page.getByRole("progressbar", { name: "Profile completeness" }),
    ).toHaveAttribute("aria-valuenow", "100");
  });

  test("the profile keeps the preferences, which persist", async ({ page }) => {
    await page.goto("/en/profile");
    const telegram = page.getByRole("switch", { name: "Telegram messages" });
    await expect(telegram).toHaveAttribute("aria-checked", "true");
    await telegram.click();
    await expect(telegram).toHaveAttribute("aria-checked", "false");
    await expect(telegram).toBeEnabled();

    await page.reload();
    await expect(
      page.getByRole("switch", { name: "Telegram messages" }),
    ).toHaveAttribute("aria-checked", "false");

    const dark = page.getByRole("switch", { name: "Dark theme" }).last();
    const before = await page.locator("html").getAttribute("data-theme");
    await dark.click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
  });
});

test.describe("account connections and merges", () => {
  test.beforeEach(async ({ page }) => {
    await signInWithPassword(page);
    await page.goto("/en/settings");
  });

  test("shows every way in and offers to connect what is missing", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Settings" }),
    ).toBeVisible();

    const connections = page.getByRole("region", { name: "Ways to sign in" });
    await expect(
      connections.getByRole("listitem").filter({ hasText: "Email" }),
    ).toContainText("dilnoza@example.org");
    await expect(
      connections.getByRole("link", { name: "Connect Telegram" }),
    ).toHaveAttribute("href", "/api/auth/connect/telegram/start?locale=en");
    await expect(
      connections.getByRole("link", { name: "Connect Google" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Change password" })).toBeVisible();
  });

  test("connecting Telegram links it directly and the page shows the new state", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Connect Telegram" }).click();

    await expect(page).toHaveURL("/en/settings?connect=linked");
    await expect(
      page.getByText("Connected. Both ways in now open this account."),
    ).toBeVisible();

    const connections = page.getByRole("region", { name: "Ways to sign in" });
    await expect(
      connections.getByRole("listitem").filter({ hasText: "Telegram" }),
    ).toContainText("@dilnoza_k");
    await expect(
      connections.getByRole("link", { name: "Connect Telegram" }),
    ).toHaveCount(0);
  });

  test("an identity already on this account says so and changes nothing", async ({
    page,
  }) => {
    await completeTelegramConnection(page, "connect-already");

    await expect(page).toHaveURL("/en/settings?connect=alreadyLinked");
    await expect(
      page.getByText("That was already connected to this account."),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Ways to sign in" }).getByRole("link", {
        name: "Connect Telegram",
      }),
    ).toBeVisible();
  });

  test("an identity owned by another account waits for that account to approve", async ({
    page,
  }) => {
    await completeTelegramConnection(page, "connect-approval");

    await expect(page).toHaveURL("/en/settings?connect=approvalRequired");
    await expect(
      page.getByText(
        "That account belongs to someone else, so it was asked to approve joining yours.",
      ),
    ).toBeVisible();
    await expect(
      requestRow(page, "Waiting for the other account", "Telegram"),
    ).toHaveCount(1);
  });

  test("an outgoing request can be cancelled from the page that raised it", async ({
    page,
  }) => {
    await completeTelegramConnection(page, "connect-approval");
    const row = requestRow(page, "Waiting for the other account", "Telegram");
    await expect(row).toHaveCount(1);

    await row.getByRole("button", { name: "Cancel the request" }).click();

    await expect(row).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Waiting for the other account" }),
    ).toContainText("Nothing is waiting.");
  });

  test("a callback whose state is not the one this browser started is refused", async ({
    page,
  }) => {
    await connectState(page, "telegram");
    await page.goto(
      "/api/auth/connect/telegram/callback?code=connect-link&state=not-the-state-this-browser-started",
    );

    await expect(page).toHaveURL("/en/settings?connect=expired");
    await expect(
      page.getByRole("region", { name: "Ways to sign in" }).getByRole("link", {
        name: "Connect Telegram",
      }),
    ).toBeVisible();
  });

  test("a Google connection posted with another browser's state is refused", async ({
    page,
  }) => {
    await connectState(page, "google");
    await postGoogleConnection(page, "e2e-connect-google-9999-minted-by-the-stub", "x");

    await expect(page).toHaveURL(/\/(uz|en)\/settings\?connect=expired$/);

    await page.goto("/en/settings");
    await expect(
      page.getByRole("region", { name: "Ways to sign in" }).getByRole("link", {
        name: "Connect Google",
      }),
    ).toBeVisible();
  });

  test("a connection state cannot be redeemed twice", async ({ page }) => {
    const state = await connectState(page, "telegram");
    await completeTelegramConnection(page, "connect-link", state);
    await expect(page).toHaveURL("/en/settings?connect=linked");

    await completeTelegramConnection(page, "connect-link", state);
    await expect(page).toHaveURL(/\/(uz|en)\/settings\?connect=expired$/);
  });

  test("a replayed callback returns in the language the reader was reading", async ({
    page,
  }) => {
    await page.goto("/ru/settings");
    const state = await connectState(page, "telegram", "ru");

    await completeTelegramConnection(page, "connect-link", state);
    await expect(page).toHaveURL("/ru/settings?connect=linked");

    await completeTelegramConnection(page, "connect-link", state);
    await expect(page).toHaveURL("/ru/settings?connect=expired");
  });

  test("the handoff carries a bounded status and nothing about the account", async ({
    page,
  }) => {
    const statuses = [
      "linked",
      "alreadyLinked",
      "approvalRequired",
      "alreadyPending",
      "conflict",
      "expired",
      "cancelled",
      "phoneRequired",
      "disabled",
      "tooMany",
      "unavailable",
    ];

    for (const code of ["connect-link", "connect-conflict", "connect-pending"]) {
      await completeTelegramConnection(page, code);
      const url = new URL(page.url());
      expect([...url.searchParams.keys()]).toEqual(["connect"]);
      expect(statuses).toContain(url.searchParams.get("connect"));
      expect(url.href).not.toMatch(/token|state|code|@|merge-/i);
    }

    const stored = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      cookie: document.cookie,
    }));
    expect(stored.local).toEqual([]);
    expect(stored.session).toEqual([]);
    expect(stored.cookie).not.toMatch(/volontyorlar_session|volontyorlar_connect/);
  });

  test("a Google account shows its email as connected and can set its first password", async ({
    page,
  }) => {
    await requestRow(page, "Waiting for your approval", "Google")
      .getByRole("button", { name: "Approve" })
      .click();
    await expect(page).toHaveURL(/\/en\/settings$/);

    const connections = page.getByRole("region", { name: "Ways to sign in" });
    await expect(
      connections.getByRole("listitem").filter({ hasText: "Email" }),
    ).toContainText("bekzod@example.org");
    await expect(page.getByRole("heading", { name: "Set a password" })).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveCount(0);

    await page
      .getByLabel("New password", { exact: true })
      .fill("a newer purple lantern phrase");
    await page.getByLabel("Confirm new password").fill("a newer purple lantern phrase");
    await page.getByRole("button", { name: "Set password" }).click();

    await expect(
      page.getByText("Password set. You can now sign in with email and password."),
    ).toBeVisible();
  });

  test("a Telegram-only account can add an email and set its first password", async ({
    page,
  }, testInfo) => {
    await signIn(page);
    await page.goto("/en/settings");

    await page
      .getByLabel("Email")
      .fill(`telegram.${testInfo.project.name}@example.org`);
    await page
      .getByLabel("New password", { exact: true })
      .fill("a secure telegram password");
    await page.getByLabel("Confirm new password").fill("a secure telegram password");
    await page.getByRole("button", { name: "Set password" }).click();

    await expect(
      page.getByText("Password set. You can now sign in with email and password."),
    ).toBeVisible();
  });

  test("an incoming request can be rejected and leaves the list", async ({ page }) => {
    const row = requestRow(page, "Waiting for your approval", "Google");
    await expect(row).toHaveCount(1);

    await row.getByRole("button", { name: "Reject" }).click();

    await expect(row).toHaveCount(0);
    await expect(requestRow(page, "Waiting for your approval", "Telegram")).toHaveCount(
      1,
    );
  });

  test("approving replaces this browser with the account that asked", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: /Account menu: Dilnoza Karimova/ }),
    ).toBeVisible();

    await requestRow(page, "Waiting for your approval", "Google")
      .getByRole("button", { name: "Approve" })
      .click();

    await expect(page).toHaveURL(/\/en\/settings$/);
    await expect(
      page.getByRole("button", { name: /Account menu: Bekzod Rustamov/ }),
    ).toBeVisible();
    await expect(page.getByText("Dilnoza Karimova")).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Waiting for your approval" }),
    ).toContainText("Nothing is waiting.");
  });

  test("an expired request recovers by refetching the list", async ({ page }) => {
    const row = requestRow(page, "Waiting for your approval", "Email");
    await expect(row).toHaveCount(1);

    await row.getByRole("button", { name: "Approve" }).click();

    await expect(row).toHaveCount(0);
    await expect(page).toHaveURL(/\/en\/settings$/);
    await page.reload();
    await expect(requestRow(page, "Waiting for your approval", "Email")).toHaveCount(0);
  });

  test("an approval that needs a fresh sign-in returns to the account page", async ({
    page,
  }) => {
    const row = requestRow(page, "Waiting for your approval", "Telegram");
    await row.getByRole("button", { name: "Approve" }).click();

    const alert = page
      .getByRole("alert")
      .filter({ hasText: "Sign in again to approve" });
    await expect(alert).toBeVisible();

    await alert.getByRole("button", { name: "Sign in again" }).click();
    await expect(page).toHaveURL("/en/login?next=%2Fen%2Fsettings");

    await submitPasswordLogin(page, /\/en\/settings$/);
    await expect(requestRow(page, "Waiting for your approval", "Telegram")).toHaveCount(
      1,
    );
  });

  test("two clicks on approve cannot resolve the same request twice", async ({
    page,
  }) => {
    const row = requestRow(page, "Waiting for your approval", "Google");
    const approve = row.getByRole("button", { name: "Approve" });
    const reject = row.getByRole("button", { name: "Reject" });

    await approve.click();
    await expect(reject).toBeDisabled();

    await expect(page).toHaveURL(/\/en\/settings$/);
    await expect(
      page.getByRole("button", { name: /Account menu: Bekzod Rustamov/ }),
    ).toBeVisible();
  });

  test("works from the keyboard, at both themes, and with reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/settings");

    const approve = requestRow(page, "Waiting for your approval", "Google").getByRole(
      "button",
      { name: "Approve" },
    );
    await approve.focus();
    await expect(approve).toBeFocused();

    const before = await page.locator("html").getAttribute("data-theme");
    await page.getByRole("switch", { name: "Dark theme" }).first().click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
    await expect(approve).toBeVisible();
    expect(await page.locator("html").getAttribute("data-motion")).toBeNull();
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
