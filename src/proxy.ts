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

const handleIntl = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const path = stripLocale(request.nextUrl.pathname, locales);
  const protectedRoute = isProtectedPath(path);
  const authRoute = isAuthPath(path);

  const session =
    protectedRoute || authRoute
      ? await decryptSession(request.cookies.get(SESSION_COOKIE_NAME)?.value)
      : null;

  if (protectedRoute && !session) {
    const locale = localeOf(request);
    const target = new URL(`/${locale}/login`, request.url);

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

function privateResponse(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

function publicResponse(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "index, follow");
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|icon.svg|apple-icon.png|opengraph-image.png|robots.txt|sitemap.xml|logo/|.*\\.[\\w]+$).*)",
  ],
};
