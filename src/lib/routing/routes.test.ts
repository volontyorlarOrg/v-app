import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { locales } from "@/i18n/routing";
import {
  ENTRY_ROUTE,
  HOME_ROUTE,
  ONBOARDING_ROUTE,
  accountRoutes,
  appRoutes,
  applicationHref,
  authRoutes,
  getRoute,
  guardFor,
  historyHref,
  isActivePath,
  isSectionActive,
  localePath,
  navHref,
  navRoutes,
  onboardingRoutes,
  opportunityHref,
  sectionKeyFor,
  tabBarRoutes,
  volunteerRoutes,
} from "@/lib/routing/routes";

describe("app route registry", () => {
  it("has unique keys and paths", () => {
    const keys = appRoutes.map((route) => route.key);
    const paths = appRoutes.map((route) => route.path);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("gives every route a leading slash and no trailing slash", () => {
    for (const route of appRoutes) {
      expect(route.path.startsWith("/")).toBe(true);
      expect(route.path.endsWith("/")).toBe(false);
    }
  });

  it("keeps navigation inside the volunteer area", () => {
    for (const route of [...navRoutes, ...tabBarRoutes, ...accountRoutes]) {
      expect(volunteerRoutes).toContain(route);
      expect(authRoutes).not.toContain(route);
    }
  });

  it("keeps utility routes out of primary and account navigation", () => {
    expect(accountRoutes.map((route) => route.key)).toEqual(["profile", "settings"]);
    expect([...navRoutes, ...accountRoutes].map((route) => route.key)).not.toContain(
      "saved",
    );
  });

  it("puts the leaderboard in the sidebar and the phone tab bar, never the account menu", () => {
    const leaderboard = getRoute("leaderboard");
    expect(leaderboard.area).toBe("volunteer");
    expect(leaderboard.guard).toBe("session");
    expect(leaderboard.inNav).toBe(true);
    expect(leaderboard.inTabBar).toBe(true);
    expect(leaderboard.inAccountMenu).toBe(false);
    expect(navRoutes).toContain(leaderboard);
    expect(tabBarRoutes).toContain(leaderboard);
    expect(accountRoutes).not.toContain(leaderboard);
    expect(navHref("leaderboard")).toBe("/leaderboard");
    for (const locale of locales) {
      expect(guardFor(`/${locale}/leaderboard`)).toBe("session");
    }
  });

  it("keeps the sidebar to three sections", () => {
    expect(navRoutes.map((route) => route.key)).toEqual([
      "dashboard",
      "opportunities",
      "leaderboard",
    ]);
  });

  it("folds applications and saved items into the opportunities section", () => {
    for (const key of ["applications", "saved"] as const) {
      const route = getRoute(key);
      expect(route.inNav).toBe(false);
      expect(route.inTabBar).toBe(false);
      expect(route.section).toBe("opportunities");
    }
    expect(sectionKeyFor("/applications")).toBe("opportunities");
    expect(sectionKeyFor("/en/applications/app-1")).toBe("opportunities");
    expect(sectionKeyFor("/saved")).toBe("opportunities");
    expect(isSectionActive("/applications/app-1", "opportunities")).toBe(true);
    expect(isSectionActive("/applications/app-1", "dashboard")).toBe(false);
    expect(sectionKeyFor("/opportunities/winter-book-drive")).toBe("opportunities");
  });

  it("keeps the profile editor under the profile", () => {
    const editor = getRoute("profileEdit");
    expect(editor.path).toBe("/profile/edit");
    expect(editor.guard).toBe("session");
    expect(editor.section).toBe("profile");
    expect(editor.inNav).toBe(false);
    expect(editor.inTabBar).toBe(false);
    expect(editor.inAccountMenu).toBe(false);
    expect(sectionKeyFor("/profile/edit")).toBe("profile");
    expect(guardFor("/uz/profile/edit")).toBe("session");
  });

  it("keeps the record reachable by URL but out of every navigation surface", () => {
    const record = getRoute("record");
    expect(record.area).toBe("volunteer");
    expect(record.guard).toBe("session");
    expect(record.inNav).toBe(false);
    expect(record.inTabBar).toBe(false);
    expect(record.inAccountMenu).toBe(false);
    expect(record.section).toBe("dashboard");
    expect(sectionKeyFor("/record")).toBe("dashboard");
    expect(historyHref()).toBe("/dashboard#history");
  });

  it("keeps the mobile tab bar to four essential destinations", () => {
    expect(tabBarRoutes.map((route) => route.key)).toEqual([
      "dashboard",
      "opportunities",
      "leaderboard",
      "profile",
    ]);
  });

  it("names no section for a path outside the registry", () => {
    expect(sectionKeyFor("/en")).toBeNull();
    expect(sectionKeyFor("/en/unknown")).toBeNull();
    expect(isSectionActive("/en/unknown", "dashboard")).toBe(false);
  });

  it("enters through sign-in and lands on the dashboard", () => {
    expect(getRoute(ENTRY_ROUTE).area).toBe("auth");
    expect(getRoute(HOME_ROUTE).area).toBe("volunteer");
  });

  it("keeps the welcome flow behind sign-in and out of every navigation surface", () => {
    const welcome = getRoute(ONBOARDING_ROUTE);
    expect(welcome.area).toBe("onboarding");
    expect(welcome.guard).toBe("session");
    expect(onboardingRoutes).toEqual([welcome]);
    expect(volunteerRoutes).not.toContain(welcome);
    for (const route of [...navRoutes, ...tabBarRoutes, ...accountRoutes]) {
      expect(route).not.toBe(welcome);
    }
    expect(guardFor("/uz/welcome")).toBe("session");
  });

  it("reaches account connections from the account menu alone", () => {
    const settings = getRoute("settings");
    expect(settings.inAccountMenu).toBe(true);
    expect(settings.inNav).toBe(false);
    expect(settings.inTabBar).toBe(false);
    expect(navHref("settings")).toBe("/settings");
  });

  it("labels every volunteer route in every catalog", () => {
    for (const locale of locales) {
      const nav = JSON.parse(
        readFileSync(join(process.cwd(), `src/i18n/messages/${locale}.json`), "utf8"),
      ).nav as Record<string, string>;
      for (const route of volunteerRoutes) {
        expect(nav[route.key], `${locale}: nav.${route.key}`).toBeTruthy();
      }
    }
  });

  it("throws on an unknown key", () => {
    // @ts-expect-error deliberately outside the union
    expect(() => getRoute("nope")).toThrow(/Unknown app route/);
  });
});

describe("locale-aware paths", () => {
  it("gives next-intl an unprefixed href", () => {
    expect(navHref("dashboard")).toBe("/dashboard");
    expect(opportunityHref("winter-book-drive")).toBe(
      "/opportunities/winter-book-drive",
    );
    expect(applicationHref("app-1")).toBe("/applications/app-1");
  });

  it("prefixes every locale", () => {
    expect(localePath("uz", "login")).toBe("/uz/login");
    expect(localePath("en", "dashboard")).toBe("/en/dashboard");
  });

  it("marks a section active for its own path and its children only", () => {
    expect(isActivePath("/applications", "/applications")).toBe(true);
    expect(isActivePath("/applications/app-1", "/applications")).toBe(true);
    expect(isActivePath("/applications-archive", "/applications")).toBe(false);
    expect(isActivePath("/dashboard", "/applications")).toBe(false);
  });
});

describe("route guards", () => {
  it("guards every volunteer route with a session and every auth route as guest-only", () => {
    for (const route of volunteerRoutes) expect(route.guard).toBe("session");
    for (const route of authRoutes) expect(route.guard).toBe("guest");
  });

  it("reads the guard through the locale prefix", () => {
    for (const locale of locales) {
      expect(guardFor(`/${locale}/dashboard`)).toBe("session");
      expect(guardFor(`/${locale}/login`)).toBe("guest");
    }
  });

  it("reads the guard for a detail page from its section", () => {
    expect(guardFor("/en/applications/abc123")).toBe("session");
    expect(guardFor("/en/opportunities/community-library-day")).toBe("session");
  });

  it("leaves an unregistered path unguarded rather than guessing", () => {
    expect(guardFor("/en")).toBeNull();
    expect(guardFor("/en/unknown")).toBeNull();
  });
});
