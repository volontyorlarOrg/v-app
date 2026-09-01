import { expect, test } from "@playwright/test";

const PRIVATE_PATHS = [
  "/uz/dashboard",
  "/uz/profile",
  "/uz/saved",
  "/uz/applications",
  "/uz/record",
  "/uz/settings",
];

test.describe("private routes", () => {
  for (const path of PRIVATE_PATHS) {
    test(`${path} redirects a signed-out visitor to sign-in`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/uz\/login/);

      await expect(page).toHaveURL(/next=/);
    });
  }

  test("private routes are marked noindex", async ({ request }) => {
    for (const path of PRIVATE_PATHS) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(
        response.headers()["x-robots-tag"],
        `${path} must not be indexable`,
      ).toContain("noindex");
    }
  });

  test("private routes are not stored by a shared cache", async ({ request }) => {
    const response = await request.get("/uz/dashboard", { maxRedirects: 0 });
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("the sign-in page is never indexable", async ({ request }) => {
    const response = await request.get("/uz/login");
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
  });
});

test.describe("public routes stay indexable", () => {
  test("the opportunity listing is indexable", async ({ request }) => {
    const response = await request.get("/uz/opportunities");

    expect(response.status()).toBe(200);

    expect(response.headers()["x-robots-tag"]).toContain("index");
    expect(response.headers()["x-robots-tag"]).not.toContain("noindex");
  });

  test("an opportunity detail page is indexable and canonical", async ({ page }) => {
    await page.goto("/uz/opportunities/winter-book-drive-tashkent");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/uz\/opportunities\/winter-book-drive-tashkent$/,
    );

    for (const locale of ["uz", "ru", "en"]) {
      await expect(
        page.locator(`link[rel="alternate"][hreflang="${locale}"]`),
      ).toHaveCount(1);
    }
  });

  test("robots.txt allows discovery and disallows the account area", async ({
    request,
  }) => {
    const body = await (await request.get("/robots.txt")).text();

    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /uz/dashboard");
    expect(body).toContain("Disallow: /uz/applications");
    expect(body).toContain("Disallow: /uz/profile");
    expect(body).toContain("Sitemap:");
  });

  test("the sitemap lists only public routes", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();

    expect(body).toContain("/opportunities");
    for (const path of ["/dashboard", "/profile", "/applications", "/settings"]) {
      expect(body, `${path} must not be in the sitemap`).not.toContain(path);
    }
  });
});

test.describe("response hardening", () => {
  test("security headers are present", async ({ request }) => {
    const headers = (await request.get("/uz/opportunities")).headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("the framework version is not advertised", async ({ request }) => {
    const headers = (await request.get("/uz/opportunities")).headers();
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("no session cookie is issued to an anonymous visitor", async ({
    page,
    context,
  }) => {
    await page.goto("/uz/opportunities");

    const cookies = await context.cookies();
    expect(cookies.find((cookie) => cookie.name === "yvc_session")).toBeUndefined();
  });

  test("no token is reachable from client JavaScript", async ({ page }) => {
    await page.goto("/uz/opportunities");

    const leaked = await page.evaluate(() => ({
      cookie: document.cookie,
      local: JSON.stringify(Object.entries(localStorage)),
      session: JSON.stringify(Object.entries(sessionStorage)),
    }));

    expect(leaked.cookie).not.toContain("yvc_session");
    expect(leaked.local).not.toMatch(/token/i);
    expect(leaked.session).not.toMatch(/token/i);
  });

  test("the private API origin is not present in the client bundle", async ({
    page,
  }) => {
    const scriptBodies: string[] = [];

    page.on("response", async (response) => {
      if (response.url().endsWith(".js") && response.status() === 200) {
        scriptBodies.push(await response.text().catch(() => ""));
      }
    });

    await page.goto("/uz/opportunities", { waitUntil: "networkidle" });

    for (const body of scriptBodies) {
      expect(body).not.toContain("YVC_API_BASE_URL");
      expect(body).not.toContain("YVC_SESSION_SECRET");
    }
  });

  test("filter state carries no personal data into the URL", async ({ page }) => {
    await page.goto("/en/opportunities");
    await page.getByLabel("Search", { exact: true }).fill("books");

    await expect(page).toHaveURL(/q=books/);

    const params = new URL(page.url()).searchParams;
    for (const key of params.keys()) {
      expect(["q", "region", "format", "open", "sort", "page"]).toContain(key);
    }
  });
});
