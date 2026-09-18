import type { Locale } from "@/i18n/routing";

export type RouteKey =
  | "login"
  | "signup"
  | "dashboard"
  | "opportunities"
  | "applications"
  | "saved"
  | "record"
  | "leaderboard"
  | "profile"
  | "profileEdit"
  | "settings"
  | "welcome";

export type RouteArea = "auth" | "volunteer" | "onboarding";

export type RouteGuard = "guest" | "session";

export type NavGroup = "primary" | "account";

export type AppRoute = {
  key: RouteKey;
  path: string;
  area: RouteArea;
  guard: RouteGuard;
  navGroup: NavGroup | null;
  inTabBar: boolean;
  section: RouteKey | null;
};

export const appRoutes: readonly AppRoute[] = [
  {
    key: "login",
    path: "/login",
    area: "auth",
    guard: "guest",
    navGroup: null,
    inTabBar: false,
    section: null,
  },
  {
    key: "signup",
    path: "/signup",
    area: "auth",
    guard: "guest",
    navGroup: null,
    inTabBar: false,
    section: null,
  },
  {
    key: "dashboard",
    path: "/dashboard",
    area: "volunteer",
    guard: "session",
    navGroup: "primary",
    inTabBar: true,
    section: null,
  },
  {
    key: "opportunities",
    path: "/opportunities",
    area: "volunteer",
    guard: "session",
    navGroup: "primary",
    inTabBar: true,
    section: null,
  },
  {
    key: "applications",
    path: "/applications",
    area: "volunteer",
    guard: "session",
    navGroup: null,
    inTabBar: false,
    section: "opportunities",
  },
  {
    key: "saved",
    path: "/saved",
    area: "volunteer",
    guard: "session",
    navGroup: null,
    inTabBar: false,
    section: "opportunities",
  },
  {
    key: "record",
    path: "/record",
    area: "volunteer",
    guard: "session",
    navGroup: null,
    inTabBar: false,
    section: "dashboard",
  },
  {
    key: "leaderboard",
    path: "/leaderboard",
    area: "volunteer",
    guard: "session",
    navGroup: "primary",
    inTabBar: true,
    section: null,
  },
  {
    key: "profile",
    path: "/profile",
    area: "volunteer",
    guard: "session",
    navGroup: null,
    inTabBar: true,
    section: null,
  },
  {
    key: "profileEdit",
    path: "/profile/edit",
    area: "volunteer",
    guard: "session",
    navGroup: null,
    inTabBar: false,
    section: "profile",
  },
  {
    key: "settings",
    path: "/settings",
    area: "volunteer",
    guard: "session",
    navGroup: "account",
    inTabBar: false,
    section: null,
  },
  {
    key: "welcome",
    path: "/welcome",
    area: "onboarding",
    guard: "session",
    navGroup: null,
    inTabBar: false,
    section: null,
  },
] as const;

export const ENTRY_ROUTE: RouteKey = "login";
export const HOME_ROUTE: RouteKey = "dashboard";
export const ONBOARDING_ROUTE: RouteKey = "welcome";
export const IDENTITY_ROUTE: RouteKey = "profile";

export const authRoutes = appRoutes.filter((route) => route.area === "auth");
export const volunteerRoutes = appRoutes.filter((route) => route.area === "volunteer");
export const onboardingRoutes = appRoutes.filter(
  (route) => route.area === "onboarding",
);
export const primaryNavRoutes = appRoutes.filter(
  (route) => route.navGroup === "primary",
);
export const accountNavRoutes = appRoutes.filter(
  (route) => route.navGroup === "account",
);
export const tabBarRoutes = appRoutes.filter((route) => route.inTabBar);

export function getRoute(key: RouteKey): AppRoute {
  const route = appRoutes.find((candidate) => candidate.key === key);
  if (!route) throw new Error(`Unknown app route: ${key}`);
  return route;
}

export function navHref(key: RouteKey): string {
  return getRoute(key).path;
}

export function opportunityHref(slug: string): string {
  return `${navHref("opportunities")}/${slug}`;
}

export function applicationHref(id: string): string {
  return `${navHref("applications")}/${id}`;
}

export const HISTORY_ANCHOR = "history";

export function historyHref(): string {
  return `${navHref("dashboard")}#${HISTORY_ANCHOR}`;
}

export function localePath(locale: Locale, key: RouteKey): string {
  return `/${locale}${getRoute(key).path}`;
}

export function isActivePath(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function withoutLocale(pathname: string): string {
  const stripped = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

export function routeFor(pathname: string): AppRoute | null {
  const path = withoutLocale(pathname);
  let match: AppRoute | null = null;
  for (const route of appRoutes) {
    if (!isActivePath(path, route.path)) continue;
    if (!match || route.path.length > match.path.length) match = route;
  }
  return match;
}

export function sectionKeyFor(pathname: string): RouteKey | null {
  const route = routeFor(pathname);
  return route ? (route.section ?? route.key) : null;
}

export function isSectionActive(pathname: string, key: RouteKey): boolean {
  return sectionKeyFor(pathname) === key;
}

export function guardFor(pathname: string): RouteGuard | null {
  return routeFor(pathname)?.guard ?? null;
}
