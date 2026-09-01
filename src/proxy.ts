import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { locales, routing } from "@/i18n/routing";
import { decryptSession } from "@/lib/auth/session.server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import {
  isAuthPath,
  isIndexablePath,
  isProtectedPath,
  stripLocale,
} from "@/lib/routes/policy";

/**
 * `proxy.ts` is Next.js 16's replacement for `middleware.ts` — the convention
 * was renamed, and using the old filename here would silently do nothing.
 *
 * Three jobs, in order:
 *   1. next-intl resolves the locale and rewrites/redirects accordingly.
 *   2. Signed-out visitors are redirected away from private routes, and
 *      signed-in ones away from the sign-in page.
 *   3. Cache and indexing headers are stamped per route.
 *
 * What this file is *not*: an authorisation boundary. Server Functions are
 * POSTs to the route they live on and can be invoked directly, so every one of
 * them re-checks the session itself. This layer exists so a human gets a
 * redirect instead of a blank forbidden page.
 */

const handleIntl = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const path = stripLocale(request.nextUrl.pathname, locales);
  const protectedRoute = isProtectedPath(path);
  const authRoute = isAuthPath(path);

  // Only decrypt when the answer can change the outcome. Public opportunity
  // pages are the hot path and must not pay for crypto they do not use.
  const session =
    protectedRoute || authRoute
      ? await decryptSession(request.cookies.get(SESSION_COOKIE_NAME)?.value)
      : null;

  if (protectedRoute && !session) {
    const locale = localeOf(request);
    const target = new URL(`/${locale}/login`, request.url);

    // Preserve the destination so sign-in can return the user to the page
    // they actually wanted. `safeReturnPath` re-validates it on the way back.
    target.searchParams.set("next", request.nextUrl.pathname);

    return privateResponse(NextResponse.redirect(target, 307));
  }

  if (authRoute && session) {
    const locale = localeOf(request);
    return privateResponse(
      NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url), 307),
    );
  }

  const response = handleIntl(request);

  return isIndexablePath(path) && !session
    ? publicResponse(response)
    : privateResponse(response);
}

function localeOf(request: NextRequest): string {
  const first = request.nextUrl.pathname.split("/")[1];
  return first && (locales as readonly string[]).includes(first)
    ? first
    : routing.defaultLocale;
}

/**
 * Private: never indexed, never stored by a shared cache.
 *
 * `no-store` matters beyond SEO — without it an intermediary could serve one
 * volunteer's dashboard to another. Applied to signed-in responses on public
 * routes too, because those render personalised state (saved badges, "you
 * have applied") that must not be cached for anyone else.
 */
function privateResponse(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

/** Public and indexable: opportunity discovery and detail pages. */
function publicResponse(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "index, follow");
  return response;
}

export const config = {
  /**
   * Skip Next internals, the metadata files, and anything with a file
   * extension. Without this the proxy would run for every image request and
   * decrypt sessions for static assets.
   */
  matcher: [
    "/((?!api|_next/static|_next/image|icon.svg|apple-icon.png|opengraph-image.png|robots.txt|sitemap.xml|logo/|.*\\.[\\w]+$).*)",
  ],
};
