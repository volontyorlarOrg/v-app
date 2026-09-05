import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  preferenceCookie,
  readPreferenceCookie,
  sharedCookieDomain,
} from "@/lib/preferences";
import { THEME_BOOT_SCRIPT, THEME_COOKIE_NAME, applyTheme } from "@/lib/theme";

function stubMatchMedia(matching: Record<string, boolean>) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: matching[query] ?? false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
}

function runBootScript() {
  new Function(THEME_BOOT_SCRIPT)();
}

describe("sharedCookieDomain", () => {
  it("covers a site and its app subdomain", () => {
    expect(sharedCookieDomain(["volontyorlar.uz", "app.volontyorlar.uz"])).toBe(
      ".volontyorlar.uz",
    );
  });

  it("does not scope a cookie when both origins are the same host", () => {
    expect(sharedCookieDomain(["localhost", "localhost"])).toBeUndefined();
  });

  it("ignores an origin that is not configured", () => {
    expect(sharedCookieDomain(["volontyorlar.uz", null])).toBeUndefined();
  });

  it("refuses a public suffix when the origins share no registrable domain", () => {
    expect(
      sharedCookieDomain(["volontyorlar.uz", "volontyorlar-app.uz"]),
    ).toBeUndefined();
  });

  it("matches only on whole labels", () => {
    expect(
      sharedCookieDomain(["notvolontyorlar.uz", "app.volontyorlar.uz"]),
    ).toBeUndefined();
  });

  it("finds the domain shared by more than two origins", () => {
    expect(
      sharedCookieDomain([
        "volontyorlar.uz",
        "app.volontyorlar.uz",
        "admin.volontyorlar.uz",
      ]),
    ).toBe(".volontyorlar.uz");
  });
});

describe("shared preference cookies", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${THEME_COOKIE_NAME}=; path=/; max-age=0`;
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.motion;
    stubMatchMedia({});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("writes a root-path cookie that a sibling origin can read", () => {
    const cookie = preferenceCookie(THEME_COOKIE_NAME, "dark");
    expect(cookie).toContain(`${THEME_COOKIE_NAME}=dark`);
    expect(cookie).toContain("path=/");
    expect(cookie).toContain("samesite=lax");
  });

  it("round-trips a theme choice through the cookie", () => {
    applyTheme("dark");
    expect(readPreferenceCookie(THEME_COOKIE_NAME)).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("boots from the cookie before paint", () => {
    document.cookie = `${THEME_COOKIE_NAME}=dark; path=/`;
    runBootScript();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("adopts an existing localStorage choice once and writes it to the cookie", () => {
    localStorage.setItem(THEME_COOKIE_NAME, "dark");
    runBootScript();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(readPreferenceCookie(THEME_COOKIE_NAME)).toBe("dark");
  });

  it("prefers the cookie over a stale localStorage value", () => {
    localStorage.setItem(THEME_COOKIE_NAME, "dark");
    document.cookie = `${THEME_COOKIE_NAME}=light; path=/`;
    runBootScript();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("falls back to the system preference when nothing is stored", () => {
    stubMatchMedia({ "(prefers-color-scheme: dark)": true });
    runBootScript();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
