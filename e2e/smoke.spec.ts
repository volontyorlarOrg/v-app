import { expect, test, type Page } from "@playwright/test";

import { PASSWORD_MIN_LENGTH } from "@/lib/auth/credentials";

const LOCALES = ["uz", "ru", "en"] as const;

async function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1280) < 1024;
}

async function shellIdentity(page: Page, name: string) {
  return (await isMobile(page))
    ? page.getByRole("button", { name: new RegExp(`Account menu: ${name}`) })
    : page.getByRole("complementary").getByText(name, { exact: true });
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

async function createAccount(page: Page, email: string) {
  await page.goto("/en/signup");
  await page.getByLabel("Full name").fill("Malika Karimova");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSPHRASE);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/en\/welcome$/);
}

test.describe("welcome flow", () => {
  test("a new volunteer's dashboard explains the first steps instead of empty panels", async ({
    page,
  }, info) => {
    await createAccount(page, `fresh-${info.project.name}@example.org`);
    await page.getByRole("button", { name: "Skip for now" }).click();
    await page
      .getByLabel("New handle")
      .fill(`fresh_${info.project.name.replaceAll("-", "_")}`);
    await page.getByRole("button", { name: "Save handle" }).click();
    await expect(page.getByRole("status")).toContainText("Your handle is saved.");
    await expect(
      page.getByText("Choose and save your Volontyorlar username to continue."),
    ).toHaveCount(0);
    await page.getByRole("link", { name: "Go to the dashboard" }).click();
    await expect(page).toHaveURL(/\/en\/dashboard$/);
    const start = page.getByRole("region", {
      name: "Start with your first opportunity",
    });
    await expect(start).toBeVisible();
    await expect(start.getByText("Apply with your profile")).toBeVisible();
    await expect(
      start.getByRole("link", { name: "Browse opportunities" }),
    ).toHaveAttribute("href", "/en/opportunities");
    for (const name of ["Next up", "Your applications", "Participation history"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toHaveCount(0);
    }
  });

  test("saves every step to the profile and ends on the first opportunity", async ({
    page,
  }, info) => {
    await createAccount(page, `flow-${info.project.name}@example.org`);
    await expect(page.getByRole("list", { name: "Setup steps" })).toBeVisible();
    await page.getByRole("button", { name: "Start" }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "About you" }),
    ).toBeVisible();
    await expect(page.getByLabel("Full name")).toHaveValue("Malika Karimova");
    await page.getByLabel("Bio").fill("I read to younger pupils on Saturdays.");
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Where you study" }),
    ).toBeVisible();
    await page
      .getByLabel("School, college, or university")
      .fill("Academic lyceum No. 1");
    await page.getByLabel("Region").selectOption("tashkent-city");
    const languages = page.getByRole("combobox", { name: "Languages you speak" });
    await languages.fill("uzb");
    await languages.press("Enter");
    await languages.fill("ingl");
    await page.getByRole("option", { name: "English" }).click();
    await languages.press("Escape");
    await expect(page.getByRole("button", { name: "Remove: Uzbek" })).toBeVisible();
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "How organisers reach you" }),
    ).toBeVisible();
    await page.getByLabel("Telegram username").fill("malika_k");
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Your pass is ready." }),
    ).toBeVisible();
    await expect(
      page.getByText("Your profile is complete.", { exact: false }),
    ).toBeVisible();
    await page.getByLabel("New handle").fill("malika_reads");
    await page.getByRole("button", { name: "Save handle" }).click();
    await expect(page.getByRole("status")).toContainText("Your handle is saved.");
    await expect(
      page.getByText("Choose and save your Volontyorlar username to continue."),
    ).toHaveCount(0);
    await page.getByRole("link", { name: "Find your first opportunity" }).click();
    await expect(page).toHaveURL(/\/en\/opportunities$/);

    await page.goto("/en/profile/edit");
    await expect(page.getByLabel("School, college, or university")).toHaveValue(
      "Academic lyceum No. 1",
    );
    await expect(page.getByLabel("Telegram username")).toHaveValue("malika_k");
    await expect(page.getByLabel("Bio")).toHaveValue(
      "I read to younger pupils on Saturdays.",
    );
    await expect(page.getByRole("button", { name: "Remove: Uzbek" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove: English" })).toBeVisible();

    await page.goto("/en/dashboard");
    await expect(page.getByRole("heading", { name: "Finish your pass" })).toHaveCount(
      0,
    );
  });

  test("a generated handle cannot bypass onboarding", async ({ page }, info) => {
    await createAccount(page, `skip-${info.project.name}@example.org`);
    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/welcome$/);
    await expect(page.getByRole("button", { name: "Skip for now" })).toBeVisible();
    await page.getByRole("button", { name: "Skip for now" }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: "Your pass is ready." }),
    ).toBeVisible();
    await expect(
      page.getByText("Choose and save your Volontyorlar username to continue."),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Find your first opportunity" }),
    ).toHaveCount(0);

    await page.getByLabel("New handle").fill("malika_skips");
    await page.getByRole("button", { name: "Save handle" }).click();
    await expect(page.getByRole("status")).toContainText("Your handle is saved.");
    await expect(
      page.getByText("Choose and save your Volontyorlar username to continue."),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Find your first opportunity" }),
    ).toBeVisible();

    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });

  test("a returning volunteer is not interrupted", async ({ page }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/en\/dashboard$/);
    await expect(page.getByRole("region", { name: "Finish your pass" })).toHaveCount(0);
  });
});

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
    await page.getByRole("menuitem", { name: "English", exact: true }).click();
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
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "WebKit drops the SameSite=None; Secure Google handoff cookie over the suite's plain-HTTP origin",
    );
    await googleState(page);
    await postGoogleAnswer(page, "e2e-google-state-9999-never-minted-here");
    await expect(page).toHaveURL(/\/en\/login\?google=expired$/);

    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/login\?next=/);
  });

  test("completing Google sign-in lands on the dashboard", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "WebKit drops the SameSite=None; Secure Google handoff cookie over the suite's plain-HTTP origin",
    );
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

  test("creating an account with an email opens the welcome flow", async ({
    page,
  }, info) => {
    await page.goto("/en/signup");
    await page.getByLabel("Full name").fill("Malika Karimova");
    await page.getByLabel("Email").fill(`malika-${info.project.name}@example.org`);
    await page.getByLabel("Password", { exact: true }).fill(PASSPHRASE);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/en\/welcome$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Malika");
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
    await page.goto("/en/profile");
    await expect(page).toHaveURL(/\/en\/login\?next=%2Fen%2Fprofile$/);
    await page.getByRole("link", { name: "Continue with Telegram" }).click();
    await expect(page).toHaveURL(/\/en\/profile$/);
  });

  test("the panel is not reachable without a session", async ({ page }) => {
    for (const path of [
      "/en/dashboard",
      "/en/opportunities",
      "/en/profile",
      "/en/record",
      "/en/leaderboard",
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

    await navigation.getByRole("link", { name: "Opportunities" }).click();
    await expect(page).toHaveURL(/\/en\/opportunities$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Opportunities" }),
    ).toBeVisible();

    const sections = page.getByRole("navigation", { name: "Opportunities sections" });
    await expect(sections.getByRole("link")).toHaveCount(3);
    await sections.getByRole("link", { name: /^Applications/ }).click();
    await expect(page).toHaveURL(/\/en\/applications$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Your applications" }),
    ).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Applications" })).toHaveCount(0);
    await expect(
      navigation.getByRole("link", { name: "Opportunities" }),
    ).toHaveAttribute("aria-current", "page");

    await navigation.getByRole("link", { name: "Leaderboard" }).click();
    await expect(page).toHaveURL(/\/en\/leaderboard$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Leaderboard" }),
    ).toBeVisible();

    for (const path of ["/en/profile", "/en/profile/edit", "/en/settings"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    }
  });

  test("the old record URL lands on the dashboard's history", async ({ page }) => {
    await page.goto("/en/record");
    await expect(page).toHaveURL(/\/en\/dashboard#history$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Participation history" }),
    ).toBeVisible();
  });

  test("the sidebar carries notifications, the identity card as the profile link, settings and sign out; the phone header its menu", async ({
    page,
  }) => {
    const mobile = await isMobile(page);
    await expect(page.getByRole("button", { name: /^Notifications/ })).toBeVisible();
    await expect(page.getByRole("switch", { name: "Dark theme" })).toHaveCount(0);
    if (mobile) {
      await expect(page.getByRole("button", { name: /Account menu/ })).toBeVisible();
      return;
    }

    const sidebar = page.getByRole("complementary");
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }).getByRole("link"),
    ).toHaveCount(3);
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Account menu/ })).toHaveCount(0);

    const account = page.getByRole("navigation", { name: "Account" });
    await expect(account.getByRole("link")).toHaveCount(2);
    const identity = account.getByRole("link", { name: "Profile: Dilnoza Karimova" });
    await expect(identity).toHaveAttribute("href", "/en/profile");
    await expect(identity).toContainText("Dilnoza Karimova");
    await expect(
      account.getByRole("link", { name: "Profile", exact: true }),
    ).toHaveCount(0);
    await expect(account.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/en/settings",
    );
    await expect(sidebar.getByRole("button", { name: "Sign out" })).toBeVisible();
  });

  test("the notifications menu shows the backend's messages and marks them read", async ({
    page,
  }) => {
    const bell = page.getByRole("button", { name: "Notifications (1)" });
    await bell.click();
    await expect(page.getByRole("link", { name: "You were accepted" })).toHaveAttribute(
      "href",
      "/en/applications/app-riverbank",
    );
    await expect(
      page.getByText("Open your application for the date and place."),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Attendance confirmed" }),
    ).toHaveAttribute("href", "/en/dashboard#history");
    await expect(page.getByText(/status is now/)).toHaveCount(0);
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

  test("the profile and the account are one click away, and sign out really signs out", async ({
    page,
  }) => {
    const mobile = await isMobile(page);
    if (mobile) {
      await page.getByRole("button", { name: /Account menu/ }).click();
      const menu = page.getByRole("navigation", { name: "Account menu" });
      await expect(menu.getByRole("link")).toHaveCount(2);
      await expect(
        menu.getByRole("link", { name: "Profile: Dilnoza Karimova" }),
      ).toHaveAttribute("href", "/en/profile");
      await expect(menu.getByRole("link", { name: "Settings" })).toHaveAttribute(
        "href",
        "/en/settings",
      );
      await menu.getByRole("button", { name: "Sign out" }).click();
    } else {
      const account = page.getByRole("navigation", { name: "Account" });
      const identity = account.getByRole("link", { name: "Profile: Dilnoza Karimova" });
      await account.getByRole("link", { name: "Settings" }).click();
      await expect(page).toHaveURL(/\/en\/settings$/);
      await expect(identity).not.toHaveAttribute("aria-current");
      await identity.click();
      await expect(page).toHaveURL(/\/en\/profile$/);
      await expect(identity).toHaveAttribute("aria-current", "page");
      await page.goto("/en/profile/edit");
      await expect(identity).toHaveAttribute("aria-current", "page");
      await page.getByRole("button", { name: "Sign out" }).click();
    }
    await expect(page).toHaveURL(/\/en\/login$/);

    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/login\?next=/);
  });

  test("the theme switch lives in settings and flips the document theme", async ({
    page,
  }) => {
    await page.goto("/en/settings");
    const appearance = page.getByRole("region", { name: "Appearance" });
    const toggle = appearance.getByRole("switch", { name: "Dark theme" });
    const before = await page.locator("html").getAttribute("data-theme");
    await toggle.click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
  });

  test.describe("on a browser that prefers dark", () => {
    test.use({ colorScheme: "dark" });

    test("the switch reads on before anyone has chosen a theme", async ({ page }) => {
      await page.context().clearCookies({ name: "theme" });
      await page.goto("/en/settings");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(
        page
          .getByRole("region", { name: "Appearance" })
          .getByRole("switch", { name: "Dark theme" }),
      ).toHaveAttribute("aria-checked", "true");
    });
  });

  test("settings carries the interface language, and switching it keeps the page", async ({
    page,
  }) => {
    await page.goto("/en/settings");
    const appearance = page.getByRole("region", { name: "Appearance" });
    await expect(
      appearance.getByRole("link", { name: "English", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await appearance.getByRole("link", { name: "O‘zbekcha", exact: true }).click();
    await expect(page).toHaveURL(/\/uz\/settings$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "uz");
  });

  test("nothing overflows horizontally", async ({ page }) => {
    for (const path of [
      "/en/dashboard",
      "/en/opportunities",
      "/en/leaderboard",
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
      name: "Opportunities sections",
    });
    await expect(views.getByRole("link", { name: /Saved/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("article")).toHaveCount(2);
  });

  test("a listing that fails to load keeps the section standing and offers a retry", async ({
    page,
  }) => {
    await page.goto("/en/opportunities?q=__fail__");
    await expect(
      page.getByRole("heading", { level: 1, name: "Opportunities" }),
    ).toBeVisible();
    const sections = page.getByRole("navigation", { name: "Opportunities sections" });
    await expect(sections.getByRole("link", { name: /^All/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const alert = page.getByRole("alert").filter({ hasText: "Something went wrong" });
    await expect(alert).toBeVisible();
    await expect(alert.getByRole("button", { name: "Try again" })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);

    await page.getByRole("link", { name: "Clear filters" }).first().click();
    await expect(page.getByRole("article").first()).toBeVisible();
    await expect(alert).toHaveCount(0);
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
    await expect(page.getByRole("link", { name: "Complete profile" })).toBeVisible();
    await page.getByRole("link", { name: "Complete profile" }).click();
    await page.getByLabel("Bio").fill("I translate community information.");
    await page.getByRole("button", { name: "Save profile" }).click();
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

  test("applying to an opportunity that accepts automatically is accepted in one step", async ({
    page,
  }) => {
    await page.goto("/en/opportunities/city-marathon-water-stations");
    await page.getByRole("link", { name: "Complete profile" }).click();
    await page.getByLabel("Bio").fill("I help at city events.");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page).toHaveURL(/\/en\/profile$/);

    await page.goto("/en/opportunities/city-marathon-water-stations");
    await expect(
      page.getByRole("heading", { level: 2, name: "What you will be asked" }),
    ).toHaveCount(0);
    const facts = page.getByRole("region", { name: "At a glance" });
    await expect(facts.getByText("Organiser")).toHaveCount(0);
    await expect(facts.getByText(/^Closes tomorrow · /)).toBeVisible();
    await expect(
      facts.getByText("Instant: you're in as soon as you apply"),
    ).toBeVisible();
    await expect(
      page.getByText(/^Your profile is your application\. While places remain/),
    ).toBeVisible();

    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page).toHaveURL(
      /\/en\/applications\/app-city-marathon-water-stations$/,
    );
    const timeline = page.getByRole("region", { name: "Progress", exact: true });
    await expect(timeline.getByText("Accepted instantly")).toBeVisible();
    await expect(timeline.getByText("Under review")).toHaveCount(0);
    await expect(page.getByText("Accepted", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit application" })).toHaveCount(
      0,
    );
    await expect(page.getByRole("button", { name: "Save draft" })).toHaveCount(0);
    await expect(
      page.getByRole("heading", { level: 2, name: "Your answers" }),
    ).toHaveCount(0);
    await expect(
      page.getByText("The profile you applied with.", { exact: false }),
    ).toBeVisible();

    await page.goto("/en/opportunities/city-marathon-water-stations");
    await expect(
      page.getByRole("link", { name: "View your application" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Apply" })).toHaveCount(0);
  });

  test("a closed opportunity cannot be applied to", async ({ page }) => {
    await page.goto("/en/opportunities/read-aloud-day");
    await expect(
      page.getByRole("button", { name: "Applications are closed" }),
    ).toBeDisabled();
  });

  test("an unknown opportunity shows the not-found panel inside the shell", async ({
    page,
  }) => {
    await page.goto("/en/opportunities/does-not-exist");
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Go to the dashboard" }),
    ).toHaveAttribute("href", "/en/dashboard");
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
    await expect(
      page.getByRole("heading", { level: 2, name: "Attendance" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Progress", exact: true }),
    ).toContainText("After the event");
    await page.getByRole("button", { name: "Withdraw application" }).click();
    await page.getByRole("button", { name: "Yes, withdraw" }).click();
    await expect(page.getByText("Withdrawn", { exact: true }).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Withdraw application" }),
    ).toHaveCount(0);
  });

  test("an unknown application shows the not-found panel", async ({ page }) => {
    await page.goto("/en/applications/does-not-exist");
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Withdraw application" }),
    ).toHaveCount(0);
  });

  test("the dashboard shows the history table with the awaiting-confirmation rule", async ({
    page,
  }) => {
    await page.goto("/en/dashboard");
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText("Photo archive digitisation")).toBeVisible();
    await expect(page.getByText("They never count against you.").first()).toBeVisible();
  });

  test("the profile opens on the volunteer's own record and hands editing to its own page", async ({
    page,
  }) => {
    await page.goto("/en/profile");
    await expect(
      page.getByRole("heading", { level: 1, name: "Dilnoza Karimova" }),
    ).toBeVisible();
    await expect(page.getByRole("list", { name: "Participation" }))
      .toMatchAriaSnapshot(`
      - list "Participation":
        - listitem: 5 events
        - listitem: 22 hours
        - listitem: 83% reliability
    `);
    await expect(
      page.getByRole("definition").filter({ hasText: "Academic lyceum No. 2" }),
    ).toBeVisible();
    await expect(
      page.getByRole("definition").filter({ hasText: "@dilnoza_k" }),
    ).toBeVisible();
    await expect(page.getByLabel("Bio")).toHaveCount(0);
    const edit = page.getByRole("link", { name: "Complete profile" });
    await expect(edit).toHaveAttribute("href", "/en/profile/edit");
    await edit.click();
    await expect(page).toHaveURL(/\/en\/profile\/edit$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Edit your profile" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save profile" })).toBeVisible();
    await page.getByRole("link", { name: "Cancel" }).click();
    await expect(page).toHaveURL(/\/en\/profile$/);
  });

  test("a profile picture can be cropped, saved and removed", async ({ page }) => {
    await signIn(page);
    await page.goto("/en/profile/edit");

    const editor = page.getByRole("region", { name: "Profile picture" });
    const chooser = page.waitForEvent("filechooser");
    await editor.getByRole("button", { name: "Choose picture" }).click();
    await (await chooser).setFiles("public/opengraph-image.png");

    await expect(
      editor.getByRole("application", {
        name: "Drag the picture or use the arrow keys to position it.",
      }),
    ).toBeVisible();
    await editor.getByRole("button", { name: "Save picture" }).click();
    await expect(editor.getByRole("status")).toContainText(
      "Your profile picture is saved.",
    );

    await page.reload();
    await editor.getByRole("button", { name: "Remove picture" }).click();
    await expect(editor.getByRole("status")).toContainText(
      "Your profile picture was removed.",
    );
  });

  test("the public profile can be hidden from settings", async ({ page }) => {
    await signIn(page);
    await page.goto("/en/settings");

    const toggle = page.getByRole("switch", {
      name: "Show my public profile",
    });
    await expect(toggle).toBeChecked();
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    await expect(page.getByRole("status")).toContainText(
      "Your public profile is hidden.",
    );
  });

  test("the profile form saves to the backend and completes the profile", async ({
    page,
  }) => {
    await page.goto("/en/profile");
    await expect(
      page.getByRole("progressbar", { name: "Profile completeness" }),
    ).toHaveAttribute("aria-valuenow", "83");

    await page.goto("/en/profile/edit");
    await page.getByLabel("Bio").fill("Second-year student.");
    await page.getByRole("button", { name: "Save profile" }).click();

    await expect(page).toHaveURL(/\/en\/profile$/);
    await expect(page.getByText("Second-year student.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Edit profile" })).toBeVisible();
    await expect(
      page.getByRole("progressbar", { name: "Profile completeness" }),
    ).toHaveCount(0);

    await page.goto("/en/profile/edit");
    await expect(page.getByLabel("Bio")).toHaveValue("Second-year student.");
  });

  test("either contact method satisfies readiness without requiring both inputs", async ({
    page,
  }) => {
    await page.goto("/en/profile/edit");
    await expect(page.getByLabel("Phone number")).not.toHaveAttribute("required", "");
    await expect(page.getByLabel("Phone number")).toHaveValue("");
    await expect(page.getByLabel("Telegram username")).not.toHaveAttribute(
      "required",
      "",
    );
    await expect(page.getByLabel("Telegram username")).toHaveValue("dilnoza_k");
    await expect(page.getByLabel("Bio")).toBeVisible();
    await expect(page.getByLabel("Skills and interests")).toHaveCount(0);
  });

  test("the profile carries no settings of its own", async ({ page }) => {
    await page.goto("/en/profile");
    await expect(page.getByRole("switch", { name: "Telegram messages" })).toHaveCount(
      0,
    );
    await expect(page.getByRole("region", { name: "Ways to sign in" })).toHaveCount(0);
  });

  test("the theme is switched from settings, not from the profile", async ({
    page,
  }) => {
    await page.goto("/en/profile");
    await expect(page.getByRole("switch", { name: "Dark theme" })).toHaveCount(0);

    await page.goto("/en/settings");
    const dark = page
      .getByRole("region", { name: "Appearance" })
      .getByRole("switch", { name: "Dark theme" });
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
    ).toHaveCount(0);
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
    await expect(await shellIdentity(page, "Dilnoza Karimova")).toBeVisible();

    await requestRow(page, "Waiting for your approval", "Google")
      .getByRole("button", { name: "Approve" })
      .click();

    await expect(page).toHaveURL(/\/en\/settings$/);
    await expect(await shellIdentity(page, "Bekzod Rustamov")).toBeVisible();
    await expect(page.getByText("Dilnoza Karimova")).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Waiting for your approval" }),
    ).toHaveCount(0);
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
    await expect(await shellIdentity(page, "Bekzod Rustamov")).toBeVisible();
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
    await page
      .getByRole("region", { name: "Appearance" })
      .getByRole("switch", { name: "Dark theme" })
      .click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
    await expect(approve).toBeVisible();
    expect(await page.locator("html").getAttribute("data-motion")).toBeNull();
  });
});

test.describe("the leaderboard", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto("/en/leaderboard");
  });

  test("ranks volunteers on the backend's own numbers", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Leaderboard" }),
    ).toBeVisible();

    const podium = page.getByRole("region", { name: "Top three" });
    await expect(podium.getByRole("listitem")).toHaveCount(3);
    const first = podium.getByRole("listitem").filter({ hasText: "@volunteer_01" });
    await expect(first).toContainText("Volunteer 01");
    await expect(first).toContainText("3,000 XP");
    await expect(first.getByLabel("Place 1")).toBeVisible();

    const fourth = page.getByRole("row").nth(1);
    await expect(fourth).toContainText("Volunteer 04");
    await expect(fourth).toContainText("@volunteer_04");
    await expect(fourth).toContainText("2,730 XP");
    await expect(page.getByRole("row")).toHaveCount(23);
    await expect(page.getByText(/^42\s*volunteers$/)).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Showing 1\u201325 of 30");
  });

  test("shows the signed-in volunteer even from a page they are not on", async ({
    page,
  }) => {
    const standing = page.getByRole("region", { name: "Dilnoza Karimova" });
    await expect(standing.getByRole("definition").first()).toHaveText("#30");
    await expect(standing).toContainText("of 30 on the leaderboard");
    await expect(standing).toContainText("@dilnoza_k");
    await expect(standing).toContainText("50 XP for every confirmed event");
    await expect(page.getByRole("cell", { name: "@dilnoza_k" })).toHaveCount(0);
  });

  test("pages through the standings from page, size and total", async ({ page }) => {
    await expect(page.getByRole("status")).toContainText("Showing 1\u201325 of 30");

    const pages = page.getByRole("navigation", { name: "Leaderboard pages" });
    await expect(
      pages.getByRole("link", { name: "Page 1, current page" }),
    ).toHaveAttribute("aria-current", "page");

    await pages.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/\/en\/leaderboard\?page=2$/);
    await expect(page.getByRole("status")).toContainText("Showing 26\u201330 of 30");
    await expect(page.getByRole("row").filter({ hasText: "@dilnoza_k" })).toContainText(
      "You",
    );
  });

  test("a page beyond the last one returns to the last page", async ({ page }) => {
    await page.goto("/en/leaderboard?page=9");
    await expect(page).toHaveURL(/\/en\/leaderboard\?page=2$/);
    await expect(page.getByRole("status")).toContainText("Showing 26\u201330 of 30");
  });

  test("nothing overflows horizontally", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("the leaderboard handle", () => {
  test("a Telegram account can replace its imported handle", async ({ page }) => {
    await signIn(page);
    await page.goto("/en/settings");

    const panel = page.getByRole("region", { name: "Your handle" });
    await expect(panel).toContainText("@dilnoza_k");
    await panel.getByLabel("New handle").fill("dilnoza_custom");
    await panel.getByRole("button", { name: "Save handle" }).click();
    await expect(panel.getByRole("status")).toContainText("Your handle is saved.");
    await expect(panel).toContainText("@dilnoza_custom");
  });

  test("an email account renames itself and the leaderboard follows", async ({
    page,
  }) => {
    await signInWithPassword(page);
    await page.goto("/en/settings");

    const panel = page.getByRole("region", { name: "Your handle" });
    await panel.getByLabel("New handle").fill("Chilonzor_Reader");
    await panel.getByRole("button", { name: "Save handle" }).click();
    await expect(panel.getByRole("status")).toContainText("Your handle is saved.");
    await expect(panel).toContainText("@chilonzor_reader");

    await page.goto("/en/leaderboard?page=2");
    await expect(
      page.getByRole("row").filter({ hasText: "@chilonzor_reader" }),
    ).toContainText("You");
  });

  test("a handle another volunteer holds is refused by name", async ({ page }) => {
    await signInWithPassword(page);
    await page.goto("/en/settings");

    const panel = page.getByRole("region", { name: "Your handle" });
    await panel.getByLabel("New handle").fill("volunteer_01");
    await panel.getByRole("button", { name: "Save handle" }).click();
    await expect(panel.getByRole("alert")).toContainText("That handle is taken.");
  });

  test("a handle that breaks the rule is named before it is sent", async ({ page }) => {
    await signInWithPassword(page);
    await page.goto("/en/settings");

    const panel = page.getByRole("region", { name: "Your handle" });
    const field = panel.getByLabel("New handle");
    await field.fill("no");
    await panel.getByRole("button", { name: "Save handle" }).click();
    await expect(
      panel.getByText("A handle needs at least 5 characters."),
    ).toBeVisible();
    await expect(field).toHaveAttribute("aria-invalid", "true");
  });

  test("a new account is offered a handle at the end of the welcome flow", async ({
    page,
  }, info) => {
    await createAccount(page, `handle-${info.project.name}@example.org`);
    await page.getByRole("button", { name: "Start" }).click();
    await page.getByRole("button", { name: "Skip this step" }).click();
    await page.getByRole("button", { name: "Skip this step" }).click();
    await page.getByRole("button", { name: "Skip this step" }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Your pass is ready." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Your leaderboard handle" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save handle" })).toBeVisible();
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
