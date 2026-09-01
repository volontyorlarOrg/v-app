import type { Locale } from "@/i18n/routing";

/**
 * One table deciding, for every route, whether it is public and whether search
 * engines may index it.
 *
 * This is the deliberate divergence from the Dwelve reference architecture.
 * Dwelve stamps `X-Robots-Tag: noindex` on every response because its entire
 * product is private. Copying that here would make YVC's opportunity pages
 * invisible — and those pages *are* the acquisition funnel: they get shared
 * into Telegram channels and are the reason someone creates an account at all.
 *
 * So indexing is decided per route instead, with two rules that never bend:
 *
 *   - Anything that renders a specific person's data is private and noindex.
 *   - Anything indexable must render identically for a signed-out visitor.
 *
 * @see docs/architecture/DOMAINS_AND_INDEXING.md
 */

/** Locale-stripped path prefixes that require a session. */
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

/** Sign-in surfaces: reachable signed-out, pointless signed-in. */
export const AUTH_PREFIXES = ["/login", "/auth"] as const;

/**
 * Prefixes that may be indexed. Everything not listed is noindex, so a new
 * route is private by default and becomes public only by a deliberate edit.
 */
export const INDEXABLE_PREFIXES = ["/opportunities", "/organizations"] as const;

/** Strips a leading `/uz`, `/ru`, or `/en` so policy is written once. */
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
  return prefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function isProtectedPath(pathWithoutLocale: string): boolean {
  return matchesPrefix(pathWithoutLocale, PROTECTED_PREFIXES);
}

export function isAuthPath(pathWithoutLocale: string): boolean {
  return matchesPrefix(pathWithoutLocale, AUTH_PREFIXES);
}

/**
 * Indexable only when the path is on the allowlist *and* is not protected.
 * The second condition is redundant today; it stays so that adding a
 * `/opportunities/…/applicants` style route cannot silently become public.
 */
export function isIndexablePath(pathWithoutLocale: string): boolean {
  if (isProtectedPath(pathWithoutLocale)) return false;
  if (isAuthPath(pathWithoutLocale)) return false;
  return matchesPrefix(pathWithoutLocale, INDEXABLE_PREFIXES);
}

/** The `robots` metadata for a route, for use in `generateMetadata`. */
export function robotsFor(pathWithoutLocale: string) {
  return isIndexablePath(pathWithoutLocale)
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true };
}

/** Absolute `hreflang` alternates for an indexable page. */
export function localeAlternates(
  origin: string,
  pathWithoutLocale: string,
  locales: readonly Locale[],
): Record<string, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, `${origin}/${locale}${pathWithoutLocale}`]),
  );
}
