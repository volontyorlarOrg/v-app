import { mkdir } from "node:fs/promises";

import { expect, test, type Page } from "@playwright/test";

import { PASSWORD_MIN_LENGTH } from "@/lib/auth/credentials";

const LOCALES = ["uz", "ru", "en"] as const;

// A loaded HTML document can still be hydrating on the WebKit CI runner.
// Wait for React and the form hooks before filling or clicking client controls.
async function gotoReady(page: Page, url: string) {
  const response = await page.goto(url);
  if (/\/(login|signup|welcome|settings|profile\/edit)(?:[/?#]|$)/.test(page.url())) {
    await page.locator("html[data-app-hydrated='true']").waitFor();
    await page.waitForFunction(() =>
      [...document.querySelectorAll("form[data-action-form]")].every(
        (form) => form.getAttribute("data-form-hydrated") === "true",
      ),
    );
  }
  return response;
}

async function uploadProfilePhoto(page: Page) {
  const editor = page.getByRole("region", { name: "Profile picture" });
  const chooser = page.waitForEvent("filechooser");
  await editor.getByRole("button", { name: "Choose picture" }).click();
  await (await chooser).setFiles("public/opengraph-image.png");
  await editor.getByRole("button", { name: "Save picture" }).click();
  await expect(editor.getByRole("status")).toContainText(
    "Your profile picture is saved.",
  );
}

async function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1280) < 1024;
}

async function shellIdentity(page: Page, name: string) {
  return (await isMobile(page))
    ? page.getByRole("button", { name: new RegExp(`Account menu: ${name}`) })
    : page.getByRole("complementary").getByText(name, { exact: true });
}

type Language = (typeof LOCALES)[number];

async function readIn(page: Page, locale: Language) {
  const { baseURL } = test.info().project.use;
  await page
    .context()
    .addCookies([{ name: "volontyorlar_locale", value: locale, url: baseURL ?? "" }]);
}

async function signIn(page: Page, locale: Language = "en") {
  await readIn(page, locale);
  await gotoReady(page, `/api/auth/telegram/start?locale=${locale}`);
  await expect(page).toHaveURL(/\/dashboard$/);
}

const PASSPHRASE = "seven purple lanterns";

async function postGoogleAnswer(page: Page, state: string) {
  await gotoReady(page, "/login");
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

async function signInWithPassword(page: Page, locale: Language = "en") {
  await readIn(page, locale);
  await gotoReady(page, "/login");
  await submitPasswordLogin(page, /\/dashboard$/);
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
  await gotoReady(
    page,
    `/api/auth/connect/telegram/callback?code=${code}&state=${encodeURIComponent(bound)}`,
  );
}

async function postGoogleConnection(page: Page, state: string, credential: string) {
  await gotoReady(page, "/settings");
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
  await gotoReady(page, "/signup");
  await page.getByLabel("Full name").fill("Malika Karimova");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSPHRASE);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/welcome$/);
}

test.describe("welcome flow", () => {
  test("a new volunteer's dashboard explains the first steps instead of empty panels", async ({
    page,
  }, info) => {
    await createAccount(page, `fresh-${info.project.name}@example.org`);
    await page.getByRole("button", { name: "Start" }).click();
    await page
      .getByLabel("Username", { exact: true })
      .fill(`fresh_${info.project.name.replaceAll("-", "_")}`);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: "About you" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Skip for now" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    const start = page.getByRole("region", {
      name: "Start with your first opportunity",
    });
    await expect(start).toBeVisible();
    await expect(start.getByText("Apply with your profile")).toBeVisible();
    await expect(
      start.getByRole("link", { name: "Browse opportunities" }),
    ).toHaveAttribute("href", "/opportunities");
    for (const name of ["Next up", "Recent participation"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toHaveCount(0);
    }
    const hero = page.getByRole("region", { name: /^Hi/ });
    await expect(hero.getByText("Newcomer", { exact: true }).first()).toBeVisible();
    await expect(hero.getByText("Next: Volunteer")).toBeVisible();
    await expect(hero.getByText("10 verified hours to go")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /^0 h Verified volunteer hours/ }),
    ).toHaveAttribute("href", "/record");
  });

  test("saves every step to the profile and ends on the first opportunity", async ({
    page,
  }, info) => {
    await createAccount(page, `flow-${info.project.name}@example.org`);
    await expect(page.getByRole("list", { name: "Setup steps" })).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Four short steps, about two minutes.",
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Start" }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Choose your username" }),
    ).toBeVisible();
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
    const username = page.getByLabel("Username", { exact: true });
    await expect(username).toHaveValue("");
    await username.fill("Malika_Reads");
    await page.getByRole("button", { name: "Continue", exact: true }).click();

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
    await page.getByLabel("Year or grade").fill("10");
    const regionNote = page.getByRole("note", {
      name: "Two regions, two different questions",
    });
    await expect(regionNote).toContainText("Where you live now.");
    await expect(regionNote).toContainText("It is optional");
    await page.getByLabel("Current region").selectOption("tashkent-city");
    await page.getByLabel("Hometown region").selectOption("samarkand");
    await page.getByLabel("City or district").fill("Chilonzor");
    const languages = page.getByRole("combobox", { name: "Languages you speak" });
    await languages.fill("uzb");
    await languages.press("Enter");
    await languages.fill("ingl");
    await page.getByRole("option", { name: "English" }).click();
    await languages.press("Escape");
    await expect(page.getByRole("button", { name: "Remove: Uzbek" })).toBeVisible();
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Contact and public links" }),
    ).toBeVisible();
    await expect(page.getByLabel("Instagram username")).toBeVisible();
    await page.getByLabel("Phone number").fill("+998 90 123 45 67");
    await page.getByLabel("Telegram username").fill("malika_k");
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Your pass is ready." }),
    ).toBeVisible();
    await expect(
      page.getByText("Your profile is complete.", { exact: false }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Find your first opportunity" }).click();
    await expect(page).toHaveURL(/\/opportunities$/);

    await gotoReady(page, "/profile/edit");
    await expect(page.getByLabel("School, college, or university")).toHaveValue(
      "Academic lyceum No. 1",
    );
    await expect(page.getByRole("textbox", { name: "Year or grade" })).toHaveValue(
      "10",
    );
    await expect(page.getByLabel("City or district")).toHaveValue("Chilonzor");
    await expect(page.getByLabel("Current region")).toHaveValue("tashkent-city");
    await expect(page.getByRole("combobox", { name: "Hometown region" })).toHaveValue(
      "samarkand",
    );
    await expect(page.getByRole("switch", { name: "Hometown region" })).toBeChecked();
    await expect(
      page.getByRole("note", { name: "Two regions, two different questions" }),
    ).toBeVisible();
    await expect(page.getByLabel("Phone number")).toHaveValue("+998901234567");
    await expect(page.getByLabel("Telegram username")).toHaveValue("malika_k");
    await expect(page.getByLabel("Bio")).toHaveValue(
      "I read to younger pupils on Saturdays.",
    );
    await expect(page.getByRole("button", { name: "Remove: Uzbek" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove: English" })).toBeVisible();

    await gotoReady(page, "/settings");
    await expect(page.getByRole("region", { name: "Your username" })).toContainText(
      "@malika_reads",
    );

    await gotoReady(page, "/dashboard");
    await expect(page.getByRole("heading", { name: "Finish your pass" })).toHaveCount(
      0,
    );
  });

  test("a generated username cannot bypass onboarding", async ({ page }, info) => {
    await createAccount(page, `skip-${info.project.name}@example.org`);
    await gotoReady(page, "/dashboard");
    await expect(page).toHaveURL(/\/welcome$/);
    await expect(page.getByRole("link", { name: "Skip for now" })).toHaveCount(0);
    await page.getByRole("button", { name: "Start" }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Choose your username" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Skip for now" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Skip this step" })).toHaveCount(0);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByText("Choose a username.")).toBeVisible();

    await page.context().addCookies([
      {
        name: "volontyorlar_onboarding",
        value: "skipped:contact",
        url: page.url(),
      },
    ]);
    await page.evaluate(() =>
      window.localStorage.setItem("volontyorlar_onboarding", "skipped:contact"),
    );
    await gotoReady(page, "/welcome");
    await expect(
      page.getByRole("heading", { level: 2, name: "Choose your username" }),
    ).toBeVisible();

    await page.getByLabel("Username", { exact: true }).fill("malika_skips");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: "About you" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Skip for now" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("a Telegram username is kept with one tap", async ({ page }) => {
    await signIn(page);
    await gotoReady(page, "/welcome");
    await page.getByRole("button", { name: "Start" }).click();

    const username = page.getByLabel("Username", { exact: true });
    await expect(username).toHaveValue("dilnoza_k");
    await expect(
      page.getByText("This is your Telegram username.", { exact: false }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: "About you" }),
    ).toBeVisible();

    await gotoReady(page, "/settings");
    await expect(page.getByRole("region", { name: "Your username" })).toContainText(
      "@dilnoza_k",
    );
  });

  test("a returning volunteer is not interrupted", async ({ page }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("region", { name: "Finish your pass" })).toHaveCount(0);
  });
});

test.describe("language", () => {
  for (const locale of LOCALES) {
    test(`the sign-in page renders in ${locale} at the same address`, async ({
      page,
    }) => {
      await readIn(page, locale);
      await gotoReady(page, "/login");
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });
  }

  test("the root lands on sign-in, and on the dashboard once signed in", async ({
    page,
  }) => {
    await gotoReady(page, "/");
    const destination = new URL(page.url());
    expect(destination.pathname).toBe("/login");
    expect(destination.searchParams.get("next")).toBeNull();

    await signIn(page);
    await gotoReady(page, "/");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("an address from before the language left it moves to the plain one", async ({
    page,
  }) => {
    await gotoReady(page, "/ru/login?telegram=expired");
    await expect(page).toHaveURL(/\/login\?telegram=expired$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  });

  test("an old address never undoes a chosen language", async ({ page }) => {
    await readIn(page, "en");
    await gotoReady(page, "/uz/login");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("switching language keeps the same page and address", async ({ page }) => {
    await readIn(page, "uz");
    await gotoReady(page, "/login");
    await page.getByRole("button", { name: /Til: O‘zbekcha/ }).click();
    await page.getByRole("menuitem", { name: "English", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveURL(/\/login$/);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("going back after a change keeps the language that was chosen", async ({
    page,
  }) => {
    await signIn(page);
    await gotoReady(page, "/opportunities");
    await page.locator("html[data-app-hydrated='true']").waitFor();
    await page.locator('a[href="/leaderboard"]:visible').first().click();
    await expect(page).toHaveURL(/\/leaderboard$/);
    if (await isMobile(page)) {
      await page.getByRole("button", { name: /Account menu/ }).click();
    }
    await page.locator('a[href="/settings"]:visible').first().click();
    await expect(page).toHaveURL(/\/settings$/);

    await page
      .getByRole("region", { name: "Appearance" })
      .getByRole("button", { name: "Русский", exact: true })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Настройки");

    await page.goBack();
    await expect(page).toHaveURL(/\/leaderboard$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Рейтинг");

    await page.goBack();
    await expect(page).toHaveURL(/\/opportunities$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Возможности");

    await page.locator('a[href="/leaderboard"]:visible').first().click();
    await expect(page).toHaveURL(/\/leaderboard$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Рейтинг");
  });

  test("going back across a full page load keeps the chosen language too", async ({
    page,
  }) => {
    await signIn(page);
    await gotoReady(page, "/opportunities");
    await gotoReady(page, "/settings");
    await page
      .getByRole("region", { name: "Appearance" })
      .getByRole("button", { name: "Русский", exact: true })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");

    await page.goBack();
    await expect(page).toHaveURL(/\/opportunities$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Возможности");
  });

  test("the marketing site's language starts the app but never overrides its choice", async ({
    page,
  }) => {
    const { baseURL } = test.info().project.use;
    const marketing = (value: Language) =>
      page.context().addCookies([{ name: "NEXT_LOCALE", value, url: baseURL ?? "" }]);

    await marketing("ru");
    await gotoReady(page, "/login");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");

    await page.getByRole("button", { name: /Язык: Русский/ }).click();
    await page.getByRole("menuitem", { name: "English", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await marketing("uz");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(
      await page.evaluate(() => window.localStorage.getItem("volontyorlar_locale")),
    ).toBe("en");
  });

  test("a page the browser restores from memory follows a language chosen since", async ({
    page,
  }) => {
    await gotoReady(page, "/login");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await readIn(page, "ru");
    await page.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })),
    );
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("sign-in", () => {
  test("offers Telegram, Google and the email form", async ({ page }) => {
    await gotoReady(page, "/login");
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
    await expect(page).toHaveURL(/\/login\?google=expired$/);

    await gotoReady(page, "/dashboard");
    await expect(page).toHaveURL(/\/login\?next=/);
  });

  test("a write made after the session ended goes to sign-in, not an error in place", async ({
    page,
  }) => {
    const state = await startedState(page);
    await gotoReady(
      page,
      `/api/auth/telegram/callback?code=e2e-session-ends-on-write&state=${encodeURIComponent(state)}`,
    );
    await expect(page).toHaveURL(/\/dashboard$/);
    await gotoReady(page, "/opportunities");
    await page.locator("html[data-app-hydrated='true']").waitFor();
    await page.locator("button[aria-pressed='false']").first().click();
    await expect(page).toHaveURL(/\/login\?session=expired$/);
  });

  test("sign-in never returns to an address off this site", async ({ page }) => {
    await gotoReady(
      page,
      "/api/auth/telegram/start?locale=en&next=/%09/evil.example/landing",
    );
    await expect(page).toHaveURL(/\/dashboard$/);
    expect(new URL(page.url()).origin).toBe(test.info().project.use.baseURL);
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
    await expect(page).toHaveURL(/\/dashboard$/);

    await gotoReady(page, "/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("the email form names a malformed address before it reaches the backend", async ({
    page,
  }) => {
    await gotoReady(page, "/login");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill(PASSPHRASE);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(
      page.getByText("Enter an email address, like name@example.com."),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("email and password sign-in lands on the dashboard", async ({ page }) => {
    await gotoReady(page, "/login");
    await page.getByLabel("Email").fill("dilnoza@example.org");
    await page.getByLabel("Password", { exact: true }).fill(PASSPHRASE);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("a wrong password is refused without naming which half was wrong", async ({
    page,
  }) => {
    await gotoReady(page, "/login");
    await page.getByLabel("Email").fill("dilnoza@example.org");
    await page.getByLabel("Password", { exact: true }).fill("not the passphrase");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(
      page.getByText("That email and password do not match an account.", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("a short password is refused in the browser, with the rule in words", async ({
    page,
  }) => {
    await gotoReady(page, "/signup");
    await page.getByLabel("Full name").fill("Malika Karimova");
    await page.getByLabel("Email").fill("malika@example.org");
    await page.getByLabel("Password", { exact: true }).fill("ab");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(
      page.getByText(`Use at least ${PASSWORD_MIN_LENGTH} characters.`),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("an address that already has an account is named by the backend", async ({
    page,
  }) => {
    await gotoReady(page, "/signup");
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
    await gotoReady(page, "/signup");
    await page.getByLabel("Full name").fill("Malika Karimova");
    await page.getByLabel("Email").fill(`malika-${info.project.name}@example.org`);
    await page.getByLabel("Password", { exact: true }).fill(PASSPHRASE);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/welcome$/);
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
    await gotoReady(page, "/login");
    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(page).toHaveURL(/\/signup$/);
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
    const response = await gotoReady(page, "/forgot-password");
    expect(response?.status()).toBe(404);
  });

  test("a callback whose state is not the one this browser started is refused", async ({
    page,
  }) => {
    await startedState(page);
    await gotoReady(
      page,
      "/api/auth/telegram/callback?code=e2e-code&state=e2e-state-0000-never-minted-here",
    );
    await expect(page).toHaveURL(/\/login\?telegram=expired$/);
    await expect(page.getByRole("status")).toContainText(/expired/i);

    await gotoReady(page, "/dashboard");
    await expect(page).toHaveURL(/\/login\?next=/);
  });

  test("a state can be redeemed only once", async ({ page }) => {
    const state = await startedState(page);
    const handoff = (await page.context().cookies()).filter(
      (cookie) => cookie.name !== "volontyorlar_session",
    );
    await gotoReady(page, `/api/auth/telegram/callback?code=e2e-code&state=${state}`);
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.context().clearCookies();
    await page.context().addCookies(handoff);
    await gotoReady(page, `/api/auth/telegram/callback?code=e2e-code&state=${state}`);
    await expect(page).toHaveURL(/\/login\?telegram=expired$/);
  });

  test("a sign-in that did not share a phone number is refused with a message", async ({
    page,
  }) => {
    const state = await startedState(page);
    await gotoReady(page, `/api/auth/telegram/callback?code=no-phone&state=${state}`);
    await expect(page).toHaveURL(/\/login\?telegram=phoneRequired$/);
    await expect(page.getByRole("status")).toContainText(/phone number/i);

    await gotoReady(page, "/dashboard");
    await expect(page).toHaveURL(/\/login\?next=/);
  });

  test("declining in Telegram returns to sign-in as cancelled", async ({ page }) => {
    await startedState(page);
    await gotoReady(page, "/api/auth/telegram/callback?error=access_denied");
    await expect(page).toHaveURL(/\/login\?telegram=cancelled$/);
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
    await gotoReady(page, "/profile");
    await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
    await page.getByRole("link", { name: "Continue with Telegram" }).click();
    await expect(page).toHaveURL(/\/profile$/);
  });

  test("the panel is not reachable without a session", async ({ page }) => {
    for (const path of [
      "/dashboard",
      "/opportunities",
      "/profile",
      "/record",
      "/leaderboard",
    ]) {
      await gotoReady(page, path);
      await expect(page, path).toHaveURL(/\/login\?next=/);
    }
  });

  test("a signed-in volunteer is sent from sign-in to the dashboard", async ({
    page,
  }) => {
    await signIn(page);
    await gotoReady(page, "/login");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("an ended session returns to sign-in with a message", async ({ page }) => {
    await signIn(page);
    await gotoReady(page, "/api/auth/session/expired");
    await expect(page).toHaveURL(/\/login\?session=expired$/);
    await expect(page.getByRole("status")).toContainText(/session ended/i);
    await gotoReady(page, "/dashboard");
    await expect(page).toHaveURL(/\/login\?next=/);
  });
});

test.describe("profile reward availability", () => {
  test("the profile task shows a sold-out state once all 1,000 rewards are claimed", async ({
    page,
  }, testInfo) => {
    const state = await startedState(page);
    await gotoReady(
      page,
      `/api/auth/telegram/callback?code=e2e-profile-exhausted&state=${encodeURIComponent(state)}`,
    );
    await expect(page).toHaveURL(/\/dashboard$/);
    await readIn(page, "ru");
    await gotoReady(page, "/checkpoints");
    const reward = page.locator("#task-profile");
    await expect(reward.getByText(/Все 1.000 наград уже получены/)).toBeVisible();
    await expect(reward.getByText(/Получено наград: 1.000 из 1.000/)).toBeVisible();
    await expect(reward.getByRole("button")).toHaveCount(0);
    await expect(reward.getByRole("link")).toHaveCount(0);
    await gotoReady(page, "/dashboard");
    await expect(page.getByRole("region", { name: "Задания" })).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath("sold-out.png"),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
});

test.describe("the panel", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("leads with the volunteer's level, the next step and the hours it needs", async ({
    page,
  }) => {
    const hero = page.getByRole("region", { name: "Hi, Dilnoza." });
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Hi, Dilnoza.");
    await expect(hero.getByText("Volunteer", { exact: true }).first()).toBeVisible();
    await expect(hero.getByText("Next: Supervisor")).toBeVisible();
    await expect(hero.getByText("28 verified hours to go")).toBeVisible();
    const meter = hero.getByRole("progressbar", { name: "Progress to Supervisor" });
    await expect(meter).toHaveAttribute("aria-valuenow", "12");
    await expect(meter).toHaveAttribute("aria-valuemax", "40");
    await expect(
      page.getByRole("heading", { level: 2, name: "Your applications" }),
    ).toHaveCount(0);
  });

  test("links each figure to where it comes from, the rank to the volunteer's own row", async ({
    page,
  }) => {
    const figures = page.getByRole("region", { name: "Your progress in numbers" });
    await expect(
      figures.getByRole("link", { name: /^22 h Verified volunteer hours/ }),
    ).toHaveAttribute("href", "/record");
    await expect(figures.getByRole("link", { name: /^320 XP/ })).toHaveAttribute(
      "href",
      "/leaderboard",
    );
    await expect(
      figures.getByRole("link", { name: /^#30 Overall XP rank/ }),
    ).toHaveAttribute("href", "/leaderboard?page=2#you");
  });

  test("shows recent participation that has ended, while the event ahead stays in Next up", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: "Riverbank clean-up" }).first(),
    ).toBeVisible();
    const recent = page.getByRole("table", { name: "Recent participation" });
    const rows = recent.getByRole("rowgroup").nth(1).getByRole("row");
    await expect(rows).toHaveCount(4);
    await expect(rows.first()).toContainText("Read-aloud day");
    await expect(rows.first()).toContainText("Awaiting verification");
    await expect(rows.first()).toContainText("Pending");
    await expect(recent.getByText("Riverbank clean-up")).toHaveCount(0);
    await expect(rows.nth(1)).toContainText("Verified");
    await expect(rows.nth(1)).toContainText("Volunteering");
    await expect(rows.nth(1)).toContainText("+40");
    await expect(rows.nth(2)).toContainText("Contributor");
    await expect(rows.nth(2)).toContainText("+30");
    await recent
      .getByRole("link", { name: "Open Winter clothing sorting day" })
      .click();
    await expect(page).toHaveURL(/\/applications\/app-book-drive$/);
  });

  test("opens the levels with the volunteer's place on the ladder and closes again", async ({
    page,
  }) => {
    const open = page.getByRole("button", { name: "View levels" });
    await open.click();
    const dialog = page.getByRole("dialog", { name: "Volunteer levels" });
    await expect(dialog).toBeVisible();
    const steps = dialog.getByRole("list", {
      name: "Levels and the hours each one starts at",
    });
    await expect(steps.getByRole("listitem")).toHaveCount(5);
    await expect(steps.getByRole("listitem").nth(0)).toContainText("Reached");
    const current = steps.locator("[aria-current='step']");
    await expect(current).toContainText("Volunteer");
    await expect(current).toContainText("Starts at 10 h");
    await expect(current).toContainText("Current level");
    await expect(steps.getByRole("listitem").nth(2)).toContainText("28 h to go");
    await expect(steps.getByRole("listitem").nth(4)).toContainText("Starts at 250 h");
    await expect(dialog.getByText("Next: Supervisor")).toBeVisible();
    await expect(
      dialog.getByText("Organisation roles are assigned separately.", { exact: false }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(open).toBeFocused();
  });

  test("reaches every section from the shell, with an h1 on each", async ({ page }) => {
    const mobile = await isMobile(page);
    const navigation = page.getByRole("navigation", {
      name: mobile ? "App sections" : "Main navigation",
    });

    await navigation.getByRole("link", { name: "Opportunities" }).click();
    await expect(page).toHaveURL(/\/opportunities$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Opportunities" }),
    ).toBeVisible();

    await expect(
      page.getByRole("navigation", { name: "Opportunity type" }).getByRole("link"),
    ).toHaveCount(3);
    await expect(page.getByRole("switch", { name: "Saved only" })).toBeVisible();
    await page.getByRole("link", { name: /^Applications/ }).click();
    await expect(page).toHaveURL(/\/applications$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Your applications" }),
    ).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Applications" })).toHaveCount(0);
    await expect(
      navigation.getByRole("link", { name: "Opportunities" }),
    ).toHaveAttribute("aria-current", "page");

    await navigation.getByRole("link", { name: "Tasks" }).click();
    await expect(page).toHaveURL(/\/checkpoints$/);
    await expect(navigation.getByRole("link", { name: "Tasks" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("heading", { level: 1, name: "Tasks" })).toBeVisible();

    if (mobile) {
      await gotoReady(page, "/record");
    } else {
      await navigation.getByRole("link", { name: "My activity" }).click();
    }
    await expect(page).toHaveURL(/\/record$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "My activity" }),
    ).toBeVisible();
    if (mobile) {
      await expect(navigation.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    } else {
      await expect(
        navigation.getByRole("link", { name: "My activity" }),
      ).toHaveAttribute("aria-current", "page");
    }

    await navigation.getByRole("link", { name: "Leaderboard" }).click();
    await expect(page).toHaveURL(/\/leaderboard$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Leaderboard" }),
    ).toBeVisible();

    for (const path of ["/profile", "/profile/edit", "/settings"]) {
      await gotoReady(page, path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    }
  });

  test("the profile task unlocks with the profile and pays 50 XP only once claimed", async ({
    page,
  }, testInfo) => {
    await gotoReady(page, "/checkpoints");
    await expect(page.getByRole("heading", { level: 1, name: "Tasks" })).toBeVisible();
    const task = page.locator("#task-profile");
    await expect(
      task.getByRole("heading", { level: 2, name: "Complete your profile" }),
    ).toBeVisible();
    await expect(task.getByText("+50 XP", { exact: true })).toBeVisible();
    await expect(task.getByText("Your profile: 6 of 8 complete")).toBeVisible();
    await expect(task.getByText("700 of 1,000 rewards claimed")).toBeVisible();
    await expect(
      task.getByText("Still missing: Profile photo and Short introduction"),
    ).toBeVisible();
    await expect(task.getByText("Claim once while rewards remain.")).toBeVisible();
    await expect(task.getByRole("button")).toHaveCount(0);
    await expect(task.getByRole("link", { name: "Add profile photo" })).toHaveAttribute(
      "href",
      "/profile/edit",
    );

    await gotoReady(page, "/profile/edit");
    await page.getByLabel("Bio").fill("I volunteer at community events.");
    await page.getByLabel("Phone number").fill("+998901234567");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page).toHaveURL(/\/profile$/);

    await gotoReady(page, "/checkpoints");
    await expect(task.getByText("Your profile: 7 of 8 complete")).toBeVisible();
    await expect(task.getByText("Still missing: Profile photo")).toBeVisible();
    await expect(task.getByRole("button")).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath("tasks-photo-required.png"),
      fullPage: true,
    });
    await mkdir(".impeccable/review", { recursive: true });
    const device = testInfo.project.name.includes("mobile") ? "mobile" : "desktop";
    for (const theme of ["dark", "light"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(task.getByText("Still missing: Profile photo")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `.impeccable/review/tasks-${testInfo.project.name}-${device}-${theme}.png`,
        fullPage: true,
        animations: "disabled",
      });
    }

    await gotoReady(page, "/profile/edit");
    await uploadProfilePhoto(page);
    await gotoReady(page, "/checkpoints");
    await expect(
      task.getByRole("button", { name: "Claim 50 XP for Complete your profile" }),
    ).toBeVisible();

    await gotoReady(page, "/profile/edit");
    const photo = page.getByRole("region", { name: "Profile picture" });
    await photo.getByRole("button", { name: "Remove picture" }).click();
    await expect(photo.getByRole("status")).toContainText(
      "Your profile picture was removed.",
    );
    await gotoReady(page, "/checkpoints");
    await expect(task.getByText("Still missing: Profile photo")).toBeVisible();
    await expect(task.getByRole("button")).toHaveCount(0);
    await task.getByRole("link", { name: "Add profile photo" }).click();
    await expect(page).toHaveURL(/\/profile\/edit$/);
    await uploadProfilePhoto(page);

    await gotoReady(page, "/dashboard");
    const panel = page.getByRole("region", { name: "Tasks" });
    await expect(panel.getByText(/^Your reward is ready\./)).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Claim 50 XP for Complete your profile" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: /^Notifications/ })
      .first()
      .click();
    await expect(
      page.getByRole("link", { name: /^Reward ready to claim/ }),
    ).toHaveAttribute("href", "/checkpoints#task-profile");
    await expect(
      page.getByText("Complete your profile: claim 50 XP in Tasks."),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await panel.getByRole("link", { name: "Open tasks" }).click();
    await expect(page).toHaveURL(/\/checkpoints#task-profile$/);
    await expect(task.getByText("Your profile: 8 of 8 complete")).toBeVisible();
    await expect(task.getByText("100%", { exact: true })).toBeVisible();
    await expect(task.getByText("Every required detail is filled in.")).toBeVisible();
    await expect(task.getByText("Claim once while rewards remain.")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("tasks.png"), fullPage: true });

    const claim = task.getByRole("button", {
      name: "Claim 50 XP for Complete your profile",
      exact: true,
    });
    await claim.click();
    await expect(task.getByText(/^You claimed 50 XP on /)).toBeVisible();
    await expect(task.getByText("701 of 1,000 rewards claimed")).toBeVisible();
    await expect(claim).toHaveCount(0);
    await page.reload();
    await expect(task.getByText(/^You claimed 50 XP on /)).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath("tasks-claimed.png"),
      fullPage: true,
    });

    await gotoReady(page, "/dashboard");
    await expect(page.getByRole("region", { name: "Tasks" })).toHaveCount(0);
    await page
      .getByRole("button", { name: /^Notifications/ })
      .first()
      .click();
    await expect(page.getByRole("link", { name: /^Reward claimed/ })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

  test("opening a notification marks it read and closes the tray", async ({ page }) => {
    await page.getByRole("button", { name: "Notifications (1)" }).click();
    await page.getByRole("link", { name: /^You were accepted/ }).click();
    await expect(page).toHaveURL(/\/applications\/app-riverbank$/);
    await expect(
      page.getByRole("button", { name: "Notifications", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Close notifications" })).toHaveCount(
      0,
    );
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Notifications", exact: true }),
    ).toBeVisible();
  });

  test("My activity holds every event, the upcoming one and the awaiting rule included", async ({
    page,
  }) => {
    await page
      .getByRole("region", { name: "Recent participation" })
      .getByRole("link", { name: "View all" })
      .click();
    await expect(page).toHaveURL(/\/record$/);
    const table = page.getByRole("table", { name: "My activity" });
    const rows = table.getByRole("rowgroup").nth(1).getByRole("row");
    await expect(rows).toHaveCount(6);
    await expect(rows.first()).toContainText("Riverbank clean-up");
    await expect(rows.first()).toContainText("Upcoming");
    await expect(rows.last()).toContainText("Neighborhood reading day");
    await expect(rows.last()).toContainText("History only");
    await expect(
      page.getByText("Events waiting for verification never count against you."),
    ).toBeVisible();
  });

  test("a level reached arrives in the bell in the volunteer's language", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /^Notifications/ }).click();
    const reached = page.getByRole("link", { name: /^New level: Volunteer/ });
    await expect(reached).toHaveAttribute("href", "/dashboard");
    await expect(reached).toContainText("You have 10 verified volunteer hours.");
  });

  test("the sidebar carries notifications, the identity card as the profile link and settings, with no sign out; the phone header its menu", async ({
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
    ).toHaveCount(5);
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Account menu/ })).toHaveCount(0);

    const account = page.getByRole("navigation", { name: "Account" });
    await expect(account.getByRole("link")).toHaveCount(2);
    const identity = account.getByRole("link", { name: "Profile: Dilnoza Karimova" });
    await expect(identity).toHaveAttribute("href", "/profile");
    await expect(identity).toContainText("Dilnoza Karimova");
    await expect(
      account.getByRole("link", { name: "Profile", exact: true }),
    ).toHaveCount(0);
    await expect(account.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
    await expect(sidebar.getByRole("button", { name: "Sign out" })).toHaveCount(0);
  });

  test("the notifications menu shows the backend's messages and marks them read", async ({
    page,
  }, testInfo) => {
    const bell = page.getByRole("button", { name: "Notifications (1)" });
    await bell.click();
    await expect(
      page.getByRole("link", { name: /^You were accepted/ }),
    ).toHaveAttribute("href", "/applications/app-riverbank");
    await expect(
      page.getByText("Open your application for the date and place."),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /^Attendance confirmed/ }),
    ).toHaveAttribute("href", "/record");
    await expect(page.getByText(/status is now/)).toHaveCount(0);
    await expect(page.getByText("An account asked to join yours")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /^An account asked to join yours/ }),
    ).toHaveAttribute("href", "/settings");
    await expect(page.getByText("bekzod@example.org")).toHaveCount(0);
    await expect(page.getByText("merge-incoming")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /^Reward ready to claim/ }),
    ).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("notifications.png") });
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await expect(
      page.getByRole("button", { name: "Notifications", exact: true }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("button", { name: "Notifications", exact: true }),
    ).toBeVisible();
  });

  test("the profile and the account are one click away, and sign out on settings really signs out", async ({
    page,
  }) => {
    const mobile = await isMobile(page);
    if (mobile) {
      await page.getByRole("button", { name: /Account menu/ }).click();
      const menu = page.getByRole("navigation", { name: "Account menu" });
      await expect(menu.getByRole("link")).toHaveCount(2);
      await expect(
        menu.getByRole("link", { name: "Profile: Dilnoza Karimova" }),
      ).toHaveAttribute("href", "/profile");
      await expect(menu.getByRole("link", { name: "Settings" })).toHaveAttribute(
        "href",
        "/settings",
      );
      await expect(menu.getByRole("button", { name: "Sign out" })).toHaveCount(0);
      await menu.getByRole("link", { name: "Settings" }).click();
      await expect(page).toHaveURL(/\/settings$/);
    } else {
      const account = page.getByRole("navigation", { name: "Account" });
      const identity = account.getByRole("link", { name: "Profile: Dilnoza Karimova" });
      await account.getByRole("link", { name: "Settings" }).click();
      await expect(page).toHaveURL(/\/settings$/);
      await expect(identity).not.toHaveAttribute("aria-current");
      await identity.click();
      await expect(page).toHaveURL(/\/profile$/);
      await expect(identity).toHaveAttribute("aria-current", "page");
      await gotoReady(page, "/profile/edit");
      await expect(identity).toHaveAttribute("aria-current", "page");
      await gotoReady(page, "/settings");
    }
    await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(1);
    await expect(page.getByRole("region", { name: "Session" })).toHaveCount(0);
    const signOut = page
      .getByRole("region", { name: "Your account" })
      .getByRole("button", { name: "Sign out" });
    await expect(signOut).toHaveCSS("color", "rgb(143, 30, 24)");
    await signOut.click();
    await expect(page).toHaveURL(/\/login$/);

    await gotoReady(page, "/dashboard");
    await expect(page).toHaveURL(/\/login\?next=/);
  });

  test("the theme switch lives in settings and flips the document theme", async ({
    page,
  }) => {
    await gotoReady(page, "/settings");
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
      await gotoReady(page, "/settings");
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
    await gotoReady(page, "/settings");
    const appearance = page.getByRole("region", { name: "Appearance" });
    await expect(
      appearance.getByRole("button", { name: "English", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await appearance.getByRole("button", { name: "O‘zbekcha", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "uz");
    await expect(page).toHaveURL(/\/settings$/);
    await expect(
      page.getByRole("button", { name: "O‘zbekcha", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("nothing overflows horizontally", async ({ page }) => {
    for (const path of [
      "/dashboard",
      "/record",
      "/opportunities",
      "/leaderboard",
      "/profile",
      "/settings",
      "/applications/app-book-drive",
    ]) {
      await gotoReady(page, path);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test("renders complete with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, "/dashboard");
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

  test("separates current and expired vacancies and orders current posts newest first", async ({
    page,
  }) => {
    await gotoReady(page, "/opportunities");
    const current = page.getByRole("region", { name: "Current vacancies" });
    const expired = page.getByRole("region", { name: "Expired vacancies" });
    await expect(page.getByText("Newest posts first", { exact: true })).toBeVisible();
    await expect(current.getByRole("heading", { level: 3 })).toHaveText([
      "City youth debate",
      "Winter book drive",
      "Riverbank clean-up",
      "Remote translation support",
      "City marathon water stations",
    ]);
    await expect(current.getByText(/^Posted /)).toHaveCount(5);
    await expect(expired.getByRole("heading", { level: 3 })).toHaveText([
      "Read-aloud day",
    ]);
    await expect(
      expired.getByText("Applications have closed. You can still view the details."),
    ).toBeVisible();

    await gotoReady(page, "/opportunities?view=saved");
    await expect(
      page
        .getByRole("region", { name: "Current vacancies" })
        .getByRole("heading", { level: 3 }),
    ).toHaveText(["Riverbank clean-up", "Remote translation support"]);
    await expect(page.getByRole("region", { name: "Expired vacancies" })).toHaveCount(
      0,
    );

    await gotoReady(page, "/opportunities?q=read-aloud");
    await expect(page.getByRole("region", { name: "Current vacancies" })).toContainText(
      "No current vacancies match these filters.",
    );
    await expect(
      page.getByRole("region", { name: "Expired vacancies" }).getByRole("article"),
    ).toHaveCount(1);
  });

  test("shows approved organization events and three illustrated past events only in the unfiltered listing", async ({
    page,
  }, testInfo) => {
    await gotoReady(page, "/opportunities");
    const archive = page.getByRole("region", { name: "Past opportunities" });

    const recorded = archive.getByRole("list", {
      name: "Past events organizations recorded",
    });
    await expect(recorded.getByRole("article")).toHaveCount(1);
    await expect(
      recorded.getByRole("heading", { level: 3, name: "Neighborhood reading day" }),
    ).toBeVisible();
    await expect(recorded).toContainText("Chilonzor Reading Corners");
    await expect(recorded).toContainText("12 volunteers · 30.5 h");
    await expect(archive.getByRole("article")).toHaveCount(4);
    for (const title of [
      "Best in the Profession 2026",
      "Amirsoy Paradiso — Open Air",
      "International football match at Paxtakor Stadium",
    ]) {
      await expect(
        archive.getByRole("heading", { level: 3, name: title }),
      ).toBeVisible();
    }

    await page.getByRole("link", { name: "See past opportunities" }).click();
    await expect(page).toHaveURL(/#past-opportunities-title$/);

    if (["chromium-desktop", "chromium-mobile"].includes(testInfo.project.name)) {
      await page.waitForFunction(() =>
        [...document.querySelectorAll(".enter-rise")].every(
          (element) => getComputedStyle(element).opacity === "1",
        ),
      );
      await page.screenshot({
        path: testInfo.outputPath("past-opportunities-light.png"),
        fullPage: true,
      });
    }

    await gotoReady(page, "/settings");
    await page
      .getByRole("region", { name: "Appearance" })
      .getByRole("switch", { name: "Dark theme" })
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await gotoReady(page, "/opportunities");

    if (["chromium-desktop", "chromium-mobile"].includes(testInfo.project.name)) {
      await page.waitForFunction(() =>
        [...document.querySelectorAll(".enter-rise")].every(
          (element) => getComputedStyle(element).opacity === "1",
        ),
      );
      await page.screenshot({
        path: testInfo.outputPath("past-opportunities-dark.png"),
        fullPage: true,
      });
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, "/opportunities");
    await expect(page.locator("#past-opportunities-title")).toBeVisible();
    expect(await page.locator("html").getAttribute("data-motion")).toBeNull();

    await gotoReady(page, "/opportunities?kind=competition");
    await expect(page.getByRole("region", { name: "Past opportunities" })).toHaveCount(
      0,
    );
  });

  test("competition type filters the catalogue and opens an individual application", async ({
    page,
  }) => {
    await gotoReady(page, "/opportunities?kind=competition");
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "City youth debate" })).toBeVisible();
    await expect(page.getByText("Riverbank clean-up")).toHaveCount(0);

    await page.getByRole("link", { name: "City youth debate" }).click();
    await expect(page.getByText("Competitions", { exact: true }).first()).toBeVisible();
    await page.getByRole("link", { name: "Complete profile" }).click();
    await page.getByLabel("Bio").fill("I enjoy debating community questions.");
    await page.getByLabel("Phone number").fill("+998 90 123 45 67");
    await page.getByRole("button", { name: "Save profile" }).click();

    await gotoReady(page, "/opportunities/city-youth-debate");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page).toHaveURL(/\/applications\/app-city-youth-debate$/);
    await expect(page.getByText("Submitted", { exact: true }).first()).toBeVisible();
  });

  test("shows a vacancy photo on its card and detail while keeping other cards text-only", async ({
    page,
  }) => {
    await gotoReady(page, "/opportunities");
    const photographed = page.getByRole("article").filter({
      has: page.getByRole("link", { name: "Winter book drive" }),
    });
    await expect(photographed.locator("img")).toBeVisible();
    const textOnly = page.getByRole("article").filter({
      has: page.getByRole("link", { name: "Riverbank clean-up" }),
    });
    await expect(textOnly.locator("img")).toHaveCount(0);

    await gotoReady(page, "/opportunities/winter-book-drive");
    await expect(
      page.locator('main img[src="/logo/social/og-image-1200x630.png"]'),
    ).toBeVisible();
  });

  test("saved opportunities are a view and the old route redirects to it", async ({
    page,
  }) => {
    await gotoReady(page, "/saved");
    await expect(page).toHaveURL(/\/opportunities\?view=saved$/);
    const savedOnly = page.getByRole("switch", { name: "Saved only" });
    await expect(savedOnly).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("article")).toHaveCount(2);

    await page.locator("html[data-app-hydrated='true']").waitFor();
    await savedOnly.click();
    await expect(page).toHaveURL(/\/opportunities$/);
    await expect(savedOnly).toHaveAttribute("aria-checked", "false");
    await expect.poll(() => page.getByRole("article").count()).toBeGreaterThan(2);
  });

  test("a listing that fails to load keeps the section standing and offers a retry", async ({
    page,
  }) => {
    await gotoReady(page, "/opportunities?q=__fail__");
    await expect(
      page.getByRole("heading", { level: 1, name: "Opportunities" }),
    ).toBeVisible();
    const kinds = page.getByRole("navigation", { name: "Opportunity type" });
    await expect(kinds.getByRole("link", { name: "All", exact: true })).toHaveAttribute(
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
    await gotoReady(page, "/opportunities");
    await expect.poll(() => page.getByRole("article").count()).toBeGreaterThan(3);

    await page.getByLabel("Region").selectOption("samarkand");
    await expect(page).toHaveURL(/region=samarkand/);
    await expect(page.getByRole("article")).toHaveCount(1);

    await page.getByRole("link", { name: "Clear filters" }).first().click();
    await expect(page).not.toHaveURL(/region=/);
  });

  test("the search and the saved-only switch both round-trip through the URL", async ({
    page,
  }) => {
    await gotoReady(page, "/opportunities?open=1&q=book");
    await expect(page.getByLabel("Search", { exact: true })).toHaveValue("book");
    await expect(page.getByRole("article")).toHaveCount(1);

    await gotoReady(page, "/opportunities?view=saved&q=river");
    await expect(page.getByRole("switch", { name: "Saved only" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(page.getByLabel("Search", { exact: true })).toHaveValue("river");
    await expect(page.getByRole("article")).toHaveCount(1);
  });

  test("an unknown filter value degrades instead of erroring", async ({ page }) => {
    const response = await gotoReady(page, "/opportunities?region=atlantis&sort=abc");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("article").first()).toBeVisible();
  });

  test("saving an opportunity persists on the backend", async ({ page }) => {
    await gotoReady(page, "/opportunities/winter-book-drive");
    const save = page.getByRole("button", { name: /^Save$|^Saved$/ }).first();
    await expect(save).toHaveAttribute("aria-pressed", "false");
    await save.click();
    await expect(save).toHaveAttribute("aria-pressed", "true");
    await expect(save).toBeEnabled();

    await page.reload();
    await expect(
      page.getByRole("button", { name: /^Save$|^Saved$/ }).first(),
    ).toHaveAttribute("aria-pressed", "true");
    await gotoReady(page, "/opportunities?view=saved");
    await expect(page.getByRole("article")).toHaveCount(3);
  });

  test("opening an opportunity shows the facts, requirements and questions", async ({
    page,
  }) => {
    await gotoReady(page, "/opportunities/winter-book-drive");
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
    await gotoReady(page, "/opportunities/remote-translation-support");
    await expect(
      page.getByText("Complete your profile before applying. Still missing: Bio."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Apply" })).toHaveCount(0);
    await page.getByRole("link", { name: "Complete profile" }).click();
    await page.getByLabel("Bio").fill("I translate community information.");
    await page.getByRole("button", { name: "Save profile" }).click();
    await gotoReady(page, "/opportunities/remote-translation-support");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page).toHaveURL(/\/applications\/app-remote-translation-support$/);

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
    await gotoReady(page, "/opportunities/city-marathon-water-stations");
    await page.getByRole("link", { name: "Complete profile" }).click();
    await page.getByLabel("Bio").fill("I help at city events.");
    await page.getByLabel("Phone number").fill("+998 90 123 45 67");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page).toHaveURL(/\/profile$/);

    await gotoReady(page, "/opportunities/city-marathon-water-stations");
    await expect(
      page.getByRole("heading", { level: 2, name: "What you will be asked" }),
    ).toHaveCount(0);
    const facts = page.getByRole("region", { name: "At a glance" });
    await expect(facts.getByText("Organiser")).toHaveCount(0);
    await expect(facts.getByText(/^Closes (today|tomorrow) · /)).toBeVisible();
    await expect(
      facts.getByText("Instant: you're in as soon as you apply"),
    ).toBeVisible();
    await expect(
      page.getByText(/^Your profile is your application\. While places remain/),
    ).toBeVisible();

    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page).toHaveURL(/\/applications\/app-city-marathon-water-stations$/);
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

    await gotoReady(page, "/opportunities/city-marathon-water-stations");
    await expect(
      page.getByRole("link", { name: "View your application" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Apply" })).toHaveCount(0);
  });

  test("a closed opportunity cannot be applied to", async ({ page }) => {
    await gotoReady(page, "/opportunities/read-aloud-day");
    await expect(
      page.getByRole("button", { name: "Applications are closed" }),
    ).toBeDisabled();
  });

  test("an unknown opportunity shows the not-found panel inside the shell", async ({
    page,
  }) => {
    await gotoReady(page, "/opportunities/does-not-exist");
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Go to the dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });
});

test.describe("applications, record, profile and settings", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("applications filter by group and a draft can be saved", async ({ page }) => {
    await gotoReady(page, "/applications?group=drafts");
    await expect(page.getByRole("link", { name: /Drafts/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await page
      .getByRole("link", { name: /book drive/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/applications\/app-book-drive$/);
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
    await gotoReady(page, "/applications/app-riverbank");
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
    await gotoReady(page, "/applications/does-not-exist");
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Withdraw application" }),
    ).toHaveCount(0);
  });

  test("the old record URL is My activity, with every outcome and the awaiting rule", async ({
    page,
  }) => {
    await gotoReady(page, "/record");
    await expect(page).toHaveURL(/\/record$/);
    await expect(page.getByRole("table", { name: "My activity" })).toBeVisible();
    await expect(page.getByText("Photo archive digitisation")).toBeVisible();
    await expect(page.getByText("Neighborhood reading day")).toBeVisible();
    await expect(
      page.getByText("Events waiting for verification never count against you."),
    ).toBeVisible();
  });

  test("the profile opens on the volunteer's own record and hands editing to its own page", async ({
    page,
  }) => {
    await gotoReady(page, "/profile");
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
    await expect(page.getByText("Neighborhood reading day")).toBeVisible();
    const edit = page.getByRole("link", { name: "Complete profile" });
    await expect(edit).toHaveAttribute("href", "/profile/edit");
    await edit.click();
    await expect(page).toHaveURL(/\/profile\/edit$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Edit your profile" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save profile" })).toBeVisible();
    await page.getByRole("link", { name: "Cancel" }).click();
    await expect(page).toHaveURL(/\/profile$/);
  });

  test("the profile lists my activity, and each optional part can be kept off it", async ({
    page,
  }) => {
    await gotoReady(page, "/profile");
    const activity = page.getByRole("region", { name: "My activity" });
    await expect(activity.getByRole("listitem")).toHaveCount(4);
    await expect(activity.getByText("Winter clothing sorting day")).toBeVisible();
    await expect(activity.getByText("Youth Ideas Competition")).toBeVisible();
    await expect(activity.getByText("Neighborhood reading day")).toBeVisible();
    await expect(activity.getByText("Read-aloud day")).toHaveCount(0);
    await expect(
      page.getByRole("definition").filter({ hasText: "Academic lyceum No. 2" }),
    ).toBeVisible();

    await gotoReady(page, "/profile/edit");
    const school = page.getByRole("switch", { name: "School", exact: true });
    await expect(school).toBeChecked();
    await school.click();
    await page.getByRole("switch", { name: "Activity", exact: true }).click();
    await page.getByRole("switch", { name: "Instagram", exact: true }).click();
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page).toHaveURL(/\/profile$/);

    await expect(
      page.getByRole("heading", { level: 1, name: "Dilnoza Karimova" }),
    ).toBeVisible();
    await expect(page.getByRole("list", { name: "Participation" })).toBeVisible();
    await expect(page.getByText("Academic lyceum No. 2")).toHaveCount(0);
    await expect(page.getByRole("region", { name: "My activity" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Instagram/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /LinkedIn/ })).toBeVisible();
    await expect(
      page.getByText("Not shown on your profile: School, Instagram, Activity."),
    ).toBeVisible();

    await gotoReady(page, "/profiles/dilnoza_k");
    await expect(
      page.getByRole("heading", { level: 1, name: "Dilnoza Karimova" }),
    ).toBeVisible();
    await expect(page.getByText("Academic lyceum No. 2")).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Activity" })).toHaveCount(0);
    await expect(
      page.getByRole("definition").filter({ hasText: "Tashkent City" }),
    ).toBeVisible();

    await page.goto("/profile");
    await page.getByRole("link", { name: "Change" }).click();
    await expect(page).toHaveURL(/\/profile\/edit#visibility$/);
    await expect(
      page.getByRole("switch", { name: "School", exact: true }),
    ).not.toBeChecked();
    await expect(
      page.getByRole("switch", { name: "Phone", exact: true }),
    ).toBeChecked();
  });

  test("a profile picture can be cropped, saved and removed", async ({ page }) => {
    await signIn(page);
    await gotoReady(page, "/profile/edit");

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
    await gotoReady(page, "/settings");

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
    await gotoReady(page, "/profile");
    await expect(
      page.getByRole("progressbar", { name: "Profile completeness" }),
    ).toHaveAttribute("aria-valuenow", "88");

    await gotoReady(page, "/profile/edit");
    await page.getByLabel("Bio").fill("Second-year student.");
    await page.getByLabel("Phone number").fill("+998 90 123 45 67");
    await page.getByRole("button", { name: "Save profile" }).click();

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByText("Second-year student.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Edit profile" })).toBeVisible();
    await expect(
      page.getByRole("progressbar", { name: "Profile completeness" }),
    ).toHaveCount(0);

    await gotoReady(page, "/profile/edit");
    await expect(page.getByLabel("Bio")).toHaveValue("Second-year student.");
  });

  test("applying needs Telegram but allows an empty phone number", async ({ page }) => {
    await gotoReady(page, "/profile/edit");
    const phone = page.getByLabel("Phone number");
    await expect(phone).not.toHaveAttribute("required", "");
    await expect(phone).toHaveValue("");
    await expect(page.getByText("Phone number", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Telegram username")).toHaveValue("dilnoza_k");
    await expect(page.getByText("Optional", { exact: true })).toHaveCount(4);
    await expect(page.getByLabel("Skills and interests")).toHaveCount(0);

    await page.getByLabel("Bio").fill("Second-year student.");
    await phone.fill("90 123 45 67");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(phone).toHaveAttribute("aria-invalid", "true");
    await expect(page).toHaveURL(/\/profile\/edit$/);

    await phone.fill("");
    await page.getByLabel("Telegram username").fill("");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(
      page.getByText("Still missing: Telegram", { exact: false }),
    ).toBeVisible();
    await gotoReady(page, "/profile/edit");
    await page.getByLabel("Telegram username").fill("dilnoza_k");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByText("Still missing:", { exact: false })).toHaveCount(0);
  });

  test("the profile carries no settings of its own", async ({ page }) => {
    await gotoReady(page, "/profile");
    await expect(page.getByRole("switch", { name: "Telegram messages" })).toHaveCount(
      0,
    );
    await expect(page.getByRole("region", { name: "Ways to sign in" })).toHaveCount(0);
  });

  test("the theme is switched from settings, not from the profile", async ({
    page,
  }) => {
    await gotoReady(page, "/profile");
    await expect(page.getByRole("switch", { name: "Dark theme" })).toHaveCount(0);

    await gotoReady(page, "/settings");
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
    await gotoReady(page, "/settings");
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

    await expect(page).toHaveURL("/settings?connect=linked");
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

    await expect(page).toHaveURL("/settings?connect=alreadyLinked");
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

    await expect(page).toHaveURL("/settings?connect=approvalRequired");
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
    await gotoReady(
      page,
      "/api/auth/connect/telegram/callback?code=connect-link&state=not-the-state-this-browser-started",
    );

    await expect(page).toHaveURL("/settings?connect=expired");
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

    await expect(page).toHaveURL(/\/settings\?connect=expired$/);

    await gotoReady(page, "/settings");
    await expect(
      page.getByRole("region", { name: "Ways to sign in" }).getByRole("link", {
        name: "Connect Google",
      }),
    ).toBeVisible();
  });

  test("a connection state cannot be redeemed twice", async ({ page }) => {
    const state = await connectState(page, "telegram");
    await completeTelegramConnection(page, "connect-link", state);
    await expect(page).toHaveURL("/settings?connect=linked");

    await completeTelegramConnection(page, "connect-link", state);
    await expect(page).toHaveURL(/\/settings\?connect=expired$/);
  });

  test("a replayed callback returns in the language the reader was reading", async ({
    page,
  }) => {
    await readIn(page, "ru");
    await gotoReady(page, "/settings");
    const state = await connectState(page, "telegram", "ru");

    await completeTelegramConnection(page, "connect-link", state);
    await expect(page).toHaveURL("/settings?connect=linked");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");

    await completeTelegramConnection(page, "connect-link", state);
    await expect(page).toHaveURL("/settings?connect=expired");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
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
    await expect(page).toHaveURL(/\/settings$/);

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
    await gotoReady(page, "/settings");

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

    await expect(page).toHaveURL(/\/settings$/);
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
    await expect(page).toHaveURL(/\/settings$/);
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
    await expect(page).toHaveURL("/login?next=%2Fsettings");

    await submitPasswordLogin(page, /\/settings$/);
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

    await expect(page).toHaveURL(/\/settings$/);
    await expect(await shellIdentity(page, "Bekzod Rustamov")).toBeVisible();
  });

  test("works from the keyboard, at both themes, and with reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, "/settings");

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
    await gotoReady(page, "/leaderboard");
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

  test("opens another volunteer in the same app tab with their full public details", async ({
    page,
    context,
  }) => {
    const profileLink = page.getByRole("link", { name: "Volunteer 01" });
    await expect(profileLink).toHaveAttribute("href", "/volunteer_01");
    await expect(profileLink).not.toHaveAttribute("target", "_blank");

    await profileLink.click();

    await expect(page).toHaveURL(/\/volunteer_01$/);
    await expect(context.pages()).toHaveLength(1);
    await expect(
      page.getByRole("heading", { level: 1, name: "Volunteer 01" }),
    ).toBeVisible();
    await expect(page.getByText("+998 90 123 45 67")).toBeVisible();
    await expect(page.getByText("Academic lyceum No. 2")).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Instagram username: @volontyorlar.uz",
      }),
    ).toHaveAttribute("href", "https://www.instagram.com/volontyorlar.uz/");
    await expect(
      page.getByRole("link", { name: "portfolio.example/volunteer" }),
    ).toBeVisible();
    await expect(page.getByRole("list", { name: "Participation" }))
      .toMatchAriaSnapshot(`
      - list "Participation":
        - listitem: 5 events
        - listitem: 18 hours
        - listitem: 3,000 XP
    `);
  });

  test("shows the signed-in volunteer their place in one row, even from a page they are not on", async ({
    page,
  }) => {
    const standing = page.getByRole("region", { name: "Your place" });
    await expect(standing).toContainText("#30");
    await expect(standing).toContainText("of 30 on the leaderboard");
    await expect(standing).toContainText("160 XP behind place 29");
    await expect(standing).toContainText("320 XP");
    await expect(standing).not.toContainText("@dilnoza_k");
    await expect(page.getByRole("link", { name: "Change your username" })).toHaveCount(
      0,
    );
    await expect(page.getByRole("cell", { name: "@dilnoza_k" })).toHaveCount(0);
    await expect(
      page.getByText("Usually 10 XP for every verified volunteer hour"),
    ).toBeVisible();

    const box = await standing.boundingBox();
    expect(box?.height ?? 0).toBeLessThan(120);
  });

  test("the place row jumps to the volunteer's own row", async ({ page }) => {
    const jump = page
      .getByRole("region", { name: "Your place" })
      .getByRole("link", { name: /Show my place in the standings/ });
    await expect(jump).toHaveAttribute("href", "/leaderboard?page=2#you");

    await jump.click();
    await expect(page).toHaveURL(/\/leaderboard\?page=2#you$/);
    const own = page.getByRole("row").filter({ hasText: "@dilnoza_k" });
    await expect(own).toHaveAttribute("id", "you");
    await expect(own).toHaveAttribute("aria-current", "true");
    await expect(own).toBeInViewport();
    await expect(page.getByRole("region", { name: "Your place" })).toContainText(
      "160 XP behind place 29",
    );
  });

  test("pages through the standings from page, size and total", async ({ page }) => {
    await expect(page.getByRole("status")).toContainText("Showing 1\u201325 of 30");

    const pages = page.getByRole("navigation", { name: "Leaderboard pages" });
    await expect(
      pages.getByRole("link", { name: "Page 1, current page" }),
    ).toHaveAttribute("aria-current", "page");

    await pages.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/\/leaderboard\?page=2$/);
    await expect(page.getByRole("status")).toContainText("Showing 26\u201330 of 30");
    await expect(page.getByRole("row").filter({ hasText: "@dilnoza_k" })).toContainText(
      "You",
    );
  });

  test("a page beyond the last one returns to the last page", async ({ page }) => {
    await gotoReady(page, "/leaderboard?page=9");
    await expect(page).toHaveURL(/\/leaderboard\?page=2$/);
    await expect(page.getByRole("status")).toContainText("Showing 26\u201330 of 30");
  });

  test("nothing overflows horizontally", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("the leaderboard username", () => {
  test("a Telegram account can replace its imported username", async ({ page }) => {
    await signIn(page);
    await gotoReady(page, "/settings");

    await expect(
      page.getByRole("navigation", { name: "Settings sections" }),
    ).toHaveCount(0);

    const panel = page.getByRole("region", { name: "Your username" });
    await expect(panel).toContainText("@dilnoza_k");
    await expect(panel).toContainText(
      "appears on the leaderboard and in your public profile address",
    );
    await panel.getByLabel("New username").fill("dilnoza_custom");
    await panel.getByRole("button", { name: "Save username" }).click();
    await expect(panel.getByRole("status")).toContainText("Your username is saved.");
    await expect(panel).toContainText("@dilnoza_custom");
  });

  test("an email account renames itself and the leaderboard follows", async ({
    page,
  }) => {
    await signInWithPassword(page);
    await gotoReady(page, "/settings");

    const panel = page.getByRole("region", { name: "Your username" });
    await panel.getByLabel("New username").fill("Chilonzor_Reader");
    await panel.getByRole("button", { name: "Save username" }).click();
    await expect(panel.getByRole("status")).toContainText("Your username is saved.");
    await expect(panel).toContainText("@chilonzor_reader");

    await gotoReady(page, "/leaderboard?page=2");
    await expect(
      page.getByRole("row").filter({ hasText: "@chilonzor_reader" }),
    ).toContainText("You");
  });

  test("a username another volunteer holds is refused by name", async ({ page }) => {
    await signInWithPassword(page);
    await gotoReady(page, "/settings");

    const panel = page.getByRole("region", { name: "Your username" });
    await panel.getByLabel("New username").fill("volunteer_01");
    await panel.getByRole("button", { name: "Save username" }).click();
    await expect(panel.getByRole("alert")).toContainText("That username is taken.");
  });

  test("a username that breaks the rule is named before it is sent", async ({
    page,
  }) => {
    await signInWithPassword(page);
    await gotoReady(page, "/settings");

    const panel = page.getByRole("region", { name: "Your username" });
    const field = panel.getByLabel("New username");
    await field.fill("no");
    await panel.getByRole("button", { name: "Save username" }).click();
    await expect(
      panel.getByText("A username needs at least 5 characters."),
    ).toBeVisible();
    await expect(field).toHaveAttribute("aria-invalid", "true");
  });

  test("a new account chooses its username first in the welcome flow", async ({
    page,
  }, info) => {
    await createAccount(page, `handle-${info.project.name}@example.org`);
    await page.getByRole("button", { name: "Start" }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Choose your username" }),
    ).toBeVisible();
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
    await expect(page.getByText("handle", { exact: false })).toHaveCount(0);
  });

  test("a generated-looking username is refused, so the gate stays closed", async ({
    page,
  }, info) => {
    await createAccount(page, `random-${info.project.name}@example.org`);
    await page.getByRole("button", { name: "Start" }).click();

    await page
      .getByLabel("Username", { exact: true })
      .fill("user_8fec48d1f08341c6a779");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "Choose your username" }).getByRole("alert"),
    ).toContainText("That username is reserved by Volontyorlar.");
    await expect(
      page.getByRole("heading", { level: 2, name: "Choose your username" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "About you" }),
    ).toHaveCount(0);
  });
});

test.describe("a member's address", () => {
  test("opens inside the panel under the plain username", async ({ page }) => {
    await signIn(page);
    await gotoReady(page, "/profiles/dilnoza_k");
    await expect(page).toHaveURL(/\/dilnoza_k$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Dilnoza Karimova" }),
    ).toBeVisible();
  });

  test("reaches the panel for a username that starts like a system path", async ({
    page,
  }) => {
    await signIn(page);
    for (const path of ["/apiuser1", "/_next_volunteer"]) {
      const response = await gotoReady(page, path);
      expect(response?.status(), path).toBe(200);
      await expect(
        page.getByRole("heading", { level: 1, name: "Page not found" }),
        path,
      ).toBeVisible();
    }
  });

  test("says a missing member is missing in the reader's language", async ({
    page,
  }) => {
    await signIn(page, "ru");
    await gotoReady(page, "/nobody_here_1");
    await expect(
      page.getByRole("heading", { level: 1, name: "Страница не найдена" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "На главную панель" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });
});

test.describe("privacy and hardening", () => {
  test("every page is kept out of search engines", async ({ request }) => {
    for (const path of ["/login", "/dashboard", "/robots.txt"]) {
      const response = await request.get(path);
      expect(response.headers()["x-robots-tag"]).toContain("noindex");
    }
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /");
  });

  test("security headers are present and the framework is not advertised", async ({
    request,
  }) => {
    const headers = (await request.get("/login")).headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["content-security-policy"]).not.toContain(
      "upgrade-insecure-requests",
    );
    expect(headers["strict-transport-security"]).toBeUndefined();
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("an unknown URL returns a 404 page", async ({ page }) => {
    const response = await gotoReady(page, "/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
});
