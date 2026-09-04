import type { Locale } from "@/i18n/routing";

export type RouteKey =
  | "login"
  | "signup"
  | "forgotPassword"
  | "dashboard"
  | "opportunities"
  | "applications"
  | "saved"
  | "record"
  | "profile"
  | "settings";

export type RouteArea = "auth" | "volunteer";

export type RouteGuard = "guest" | "session";

export type AppRoute = {
  key: RouteKey;
  path: string;
  area: RouteArea;
  guard: RouteGuard;
  inNav: boolean;
  inTabBar: boolean;
  inAccountMenu: boolean;
};

export const appRoutes: readonly AppRoute[] = [
  {
    key: "login",
    path: "/login",
    area: "auth",
    guard: "guest",
    inNav: false,
    inTabBar: false,
    inAccountMenu: false,
  },
  {
    key: "signup",
    path: "/signup",
    area: "auth",
    guard: "guest",
    inNav: false,
    inTabBar: false,
    inAccountMenu: false,
  },
  {
    key: "forgotPassword",
    path: "/forgot-password",
    area: "auth",
    guard: "guest",
    inNav: false,
    inTabBar: false,
    inAccountMenu: false,
  },
  {
    key: "dashboard",
    path: "/dashboard",
    area: "volunteer",
    guard: "session",
    inNav: true,
    inTabBar: true,
    inAccountMenu: false,
  },
  {
    key: "opportunities",
    path: "/opportunities",
    area: "volunteer",
    guard: "session",
    inNav: true,
    inTabBar: true,
    inAccountMenu: false,
  },
  {
    key: "applications",
    path: "/applications",
    area: "volunteer",
    guard: "session",
    inNav: true,
    inTabBar: true,
    inAccountMenu: false,
  },
  {
    key: "saved",
    path: "/saved",
    area: "volunteer",
    guard: "session",
    inNav: false,
    inTabBar: false,
    inAccountMenu: false,
  },
  {
    key: "record",
    path: "/record",
    area: "volunteer",
    guard: "session",
    inNav: true,
    inTabBar: false,
    inAccountMenu: false,
  },
  {
    key: "profile",
    path: "/profile",
    area: "volunteer",
    guard: "session",
    inNav: false,
    inTabBar: true,
    inAccountMenu: true,
  },
  {
    key: "settings",
    path: "/settings",
    area: "volunteer",
    guard: "session",
    inNav: false,
    inTabBar: false,
    inAccountMenu: false,
  },
] as const;

export const ENTRY_ROUTE: RouteKey = "login";
export const HOME_ROUTE: RouteKey = "dashboard";

export const authRoutes = appRoutes.filter((route) => route.area === "auth");
export const volunteerRoutes = appRoutes.filter((route) => route.area === "volunteer");
export const navRoutes = appRoutes.filter((route) => route.inNav);
export const accountRoutes = volunteerRoutes.filter((route) => route.inAccountMenu);
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

export function localePath(locale: Locale, key: RouteKey): string {
  return `/${locale}${getRoute(key).path}`;
}

export function isActivePath(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function guardFor(pathname: string): RouteGuard | null {
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  const path = withoutLocale === "" ? "/" : withoutLocale;
  const match = appRoutes.find((route) => isActivePath(path, route.path));
  return match?.guard ?? null;
}
