import type { Locale } from "@/i18n/routing";

export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/saved",
  "/applications",
  "/record",
  "/settings",
  "/partner",
  "/admin",
] as const;

export const AUTH_PREFIXES = ["/login", "/auth"] as const;

export const INDEXABLE_PREFIXES = ["/opportunities", "/organizations"] as const;

export function stripLocale(pathname: string, locales: readonly string[]): string {
  const segments = pathname.split("/");
  const first = segments[1];

  if (first && locales.includes(first)) {
    const rest = `/${segments.slice(2).join("/")}`;
    return rest === "/" ? "/" : rest.replace(/\/$/, "");
  }

  return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
}

function matchesPrefix(path: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function isProtectedPath(pathWithoutLocale: string): boolean {
  return matchesPrefix(pathWithoutLocale, PROTECTED_PREFIXES);
}

export function isAuthPath(pathWithoutLocale: string): boolean {
  return matchesPrefix(pathWithoutLocale, AUTH_PREFIXES);
}

export function isIndexablePath(pathWithoutLocale: string): boolean {
  if (isProtectedPath(pathWithoutLocale)) return false;
  if (isAuthPath(pathWithoutLocale)) return false;
  return matchesPrefix(pathWithoutLocale, INDEXABLE_PREFIXES);
}

export function robotsFor(pathWithoutLocale: string) {
  return isIndexablePath(pathWithoutLocale)
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true };
}

export function localeAlternates(
  origin: string,
  pathWithoutLocale: string,
  locales: readonly Locale[],
): Record<string, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, `${origin}/${locale}${pathWithoutLocale}`]),
  );
}
