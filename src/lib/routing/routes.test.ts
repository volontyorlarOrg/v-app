import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { locales } from "@/i18n/routing";
import {
  ENTRY_ROUTE,
  HOME_ROUTE,
  IDENTITY_ROUTE,
  ONBOARDING_ROUTE,
  accountNavRoutes,
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
  primaryNavRoutes,
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
    for (const route of [...primaryNavRoutes, ...tabBarRoutes, ...accountNavRoutes]) {
      expect(volunteerRoutes).toContain(route);
      expect(authRoutes).not.toContain(route);
    }
  });

  it("puts settings in the sidebar's account group, at the foot", () => {
    expect(accountNavRoutes.map((route) => route.key)).toEqual(["settings"]);
    expect(
      [...primaryNavRoutes, ...accountNavRoutes].map((route) => route.key),
    ).not.toContain("saved");
  });

  it("opens the profile from the identity card alone, never from a second sidebar row", () => {
    const profile = getRoute(IDENTITY_ROUTE);
    expect(profile.key).toBe("profile");
    expect(profile.area).toBe("volunteer");
    expect(profile.navGroup).toBeNull();
    expect(profile.inTabBar).toBe(true);
    expect([...primaryNavRoutes, ...accountNavRoutes]).not.toContain(profile);
    expect(isSectionActive("/profile", IDENTITY_ROUTE)).toBe(true);
    expect(isSectionActive("/en/profile/edit", IDENTITY_ROUTE)).toBe(true);
    expect(isSectionActive("/en/settings", IDENTITY_ROUTE)).toBe(false);
  });

  it("gives every navigation route one group, so nothing needs a collapsible menu", () => {
    for (const route of appRoutes) {
      if (route.navGroup === null) continue;
      expect(volunteerRoutes).toContain(route);
      expect(["primary", "account"]).toContain(route.navGroup);
    }
    expect(
      appRoutes.filter((route) => route.navGroup !== null).map((route) => route.key),
    ).toEqual(["dashboard", "opportunities", "leaderboard", "settings"]);
  });

  it("puts the leaderboard in the sidebar and the phone tab bar, never the account group", () => {
    const leaderboard = getRoute("leaderboard");
    expect(leaderboard.area).toBe("volunteer");
    expect(leaderboard.guard).toBe("session");
    expect(leaderboard.navGroup).toBe("primary");
    expect(leaderboard.inTabBar).toBe(true);
    expect(primaryNavRoutes).toContain(leaderboard);
    expect(tabBarRoutes).toContain(leaderboard);
    expect(accountNavRoutes).not.toContain(leaderboard);
    expect(navHref("leaderboard")).toBe("/leaderboard");
    for (const locale of locales) {
      expect(guardFor(`/${locale}/leaderboard`)).toBe("session");
    }
  });

  it("keeps the sidebar's primary group to three sections", () => {
    expect(primaryNavRoutes.map((route) => route.key)).toEqual([
      "dashboard",
      "opportunities",
      "leaderboard",
    ]);
  });

  it("folds applications and saved items into the opportunities section", () => {
    for (const key of ["applications", "saved"] as const) {
      const route = getRoute(key);
      expect(route.navGroup).toBeNull();
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
    expect(editor.navGroup).toBeNull();
    expect(editor.inTabBar).toBe(false);
    expect(sectionKeyFor("/profile/edit")).toBe("profile");
    expect(guardFor("/uz/profile/edit")).toBe("session");
  });

  it("keeps another volunteer's profile inside the signed-in leaderboard section", () => {
    const memberProfile = getRoute("memberProfile");
    expect(memberProfile.path).toBe("/profiles");
    expect(memberProfile.guard).toBe("session");
    expect(memberProfile.section).toBe("leaderboard");
    expect(memberProfile.navGroup).toBeNull();
    expect(memberProfile.inTabBar).toBe(false);
    expect(sectionKeyFor("/en/profiles/dilnoza_k")).toBe("leaderboard");
    expect(guardFor("/en/profiles/dilnoza_k")).toBe("session");
  });

  it("keeps the record reachable by URL but out of every navigation surface", () => {
    const record = getRoute("record");
    expect(record.area).toBe("volunteer");
    expect(record.guard).toBe("session");
    expect(record.navGroup).toBeNull();
    expect(record.inTabBar).toBe(false);
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
    for (const route of [...primaryNavRoutes, ...tabBarRoutes, ...accountNavRoutes]) {
      expect(route).not.toBe(welcome);
    }
    expect(guardFor("/uz/welcome")).toBe("session");
  });

  it("reaches the account, the theme and the language from settings at the foot of the sidebar", () => {
    const settings = getRoute("settings");
    expect(settings.navGroup).toBe("account");
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
