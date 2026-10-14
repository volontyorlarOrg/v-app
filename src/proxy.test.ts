import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SESSION_COOKIE_NAME, encryptSession } from "@/lib/auth/session";
import proxy, { config } from "@/proxy";

const ORIGIN = "http://localhost:3001";
const SECRET = "test-session-secret-of-at-least-32-characters";

type Sent = { cookie?: string; headers?: Record<string, string> };

function send(path: string, { cookie, headers = {} }: Sent = {}) {
  return proxy(
    new NextRequest(`${ORIGIN}${path}`, {
      headers: { ...headers, ...(cookie ? { cookie } : {}) },
    }),
  );
}

async function sessionCookie() {
  const value = await encryptSession({
    userId: "00000000-0000-4000-8000-000000000001",
    roles: ["volunteer"],
    accessToken: "access-token",
    accessTokenExpiresAt: 4_102_444_800,
  });
  return `${SESSION_COOKIE_NAME}=${value}`;
}

function rewriteOf(response: Response) {
  const target = response.headers.get("x-middleware-rewrite");
  return target ? new URL(target).pathname : null;
}

function locationOf(response: Response) {
  const target = response.headers.get("location");
  return target ? target.replace(ORIGIN, "") : null;
}

describe("proxy", () => {
  beforeEach(() => {
    vi.stubEnv("VOLONTYORLAR_SESSION_SECRET", SECRET);
    vi.stubEnv("VOLONTYORLAR_API_URL", "http://localhost:4000");
  });

  it("serves one address in the language the cookie names", async () => {
    expect(rewriteOf(await send("/login"))).toBe("/uz/login");
    expect(rewriteOf(await send("/login", { cookie: "volontyorlar_locale=ru" }))).toBe(
      "/ru/login",
    );
    expect(
      rewriteOf(await send("/login", { headers: { "accept-language": "en-US,en" } })),
    ).toBe("/en/login");
  });

  it("moves an address that still carries a language to the plain one", async () => {
    const response = await send("/ru/opportunities?q=books");
    expect(response.status).toBe(307);
    expect(locationOf(response)).toBe("/opportunities?q=books");
    expect(response.headers.get("set-cookie")).toContain("volontyorlar_locale=ru");

    expect(locationOf(await send("/uz"))).toBe("/");
  });

  it("never lets an old address replace a chosen language", async () => {
    const response = await send("/uz/login", { cookie: "volontyorlar_locale=en" });
    expect(locationOf(response)).toBe("/login");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("starts from the marketing site's language until the app has one of its own", async () => {
    const first = await send("/login", { cookie: "NEXT_LOCALE=ru" });
    expect(rewriteOf(first)).toBe("/ru/login");
    expect(first.headers.get("set-cookie")).toContain("volontyorlar_locale=ru");

    const chosen = await send("/login", {
      cookie: "volontyorlar_locale=en; NEXT_LOCALE=ru",
    });
    expect(rewriteOf(chosen)).toBe("/en/login");
    expect(chosen.headers.get("set-cookie")).toBeNull();
  });

  it("lets its own rewrite through when the server hands it back", async () => {
    const response = await send("/ru/login", {
      headers: { "x-next-intl-locale": "ru" },
    });
    expect(response.status).toBe(200);
    expect(locationOf(response)).toBeNull();
    expect(rewriteOf(response)).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("still guards a rewrite that came back", async () => {
    const response = await send("/ru/dashboard", {
      headers: { "x-next-intl-locale": "ru" },
    });
    expect(locationOf(response)).toBe("/login?next=%2Fdashboard");
  });

  it("sends a signed-out visitor to sign-in and a signed-in one past it", async () => {
    expect(locationOf(await send("/dashboard"))).toBe("/login?next=%2Fdashboard");

    const cookie = await sessionCookie();
    expect(locationOf(await send("/login", { cookie }))).toBe("/dashboard");
    const page = await send("/dashboard", { cookie });
    expect(rewriteOf(page)).toBe("/uz/dashboard");
    expect(page.headers.get("cache-control")).toBe("private, no-store");
  });

  it("serves a member under the plain username, whatever it starts with", async () => {
    const cookie = await sessionCookie();
    for (const username of ["dilnoza_k", "apiuser1", "_next_volunteer"]) {
      expect(rewriteOf(await send(`/${username}`, { cookie })), username).toBe(
        `/uz/profiles/${username}`,
      );
      expect(new RegExp(`^${config.matcher[0]}$`).test(`/${username}`), username).toBe(
        true,
      );
    }
    expect(locationOf(await send("/Dilnoza_K", { cookie }))).toBe("/dilnoza_k");
    expect(locationOf(await send("/profiles/dilnoza_k", { cookie }))).toBe(
      "/dilnoza_k",
    );
    expect(locationOf(await send("/dilnoza_k"))).toBe("/login?next=%2Fdilnoza_k");
  });

  it("does not bounce a member page the server hands back", async () => {
    const cookie = await sessionCookie();
    const response = await send("/en/profiles/dilnoza_k", {
      cookie,
      headers: { "x-next-intl-locale": "en" },
    });
    expect(locationOf(response)).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("keeps a language or a short word from being read as a username", async () => {
    const cookie = await sessionCookie();
    expect(rewriteOf(await send("/", { cookie }))).toBe("/uz");
    expect(rewriteOf(await send("/four", { cookie }))).toBe("/uz/four");
  });

  it("leaves the API, the framework and files to the server", () => {
    const matcher = new RegExp(`^${config.matcher[0]}$`);
    for (const path of [
      "/api/auth/telegram/start",
      "/_next/static/a.js",
      "/icon.svg",
    ]) {
      expect(matcher.test(path), path).toBe(false);
    }
  });
});
