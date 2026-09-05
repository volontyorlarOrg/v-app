import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale, routing } from "@/i18n/routing";
import { refreshSession } from "@/lib/auth/refresh";
import {
  SESSION_COOKIE_NAME,
  decryptSession,
  encryptSession,
  isAccessTokenExpired,
  isAccessTokenExpiring,
  sessionCookieOptions,
  type SessionPayload,
} from "@/lib/auth/session";
import { ENTRY_ROUTE, HOME_ROUTE, guardFor, localePath } from "@/lib/routing/routes";

const intl = createMiddleware(routing);

function localeOf(pathname: string) {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : defaultLocale;
}

function isNavigation(request: NextRequest) {
  if (request.method !== "GET") return false;
  if (request.headers.get("next-router-prefetch")) return false;
  if (request.headers.get("purpose") === "prefetch") return false;
  if (request.headers.get("rsc")) return true;
  return request.headers.get("accept")?.includes("text/html") ?? false;
}

function expireSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const guard = guardFor(pathname);
  const locale = localeOf(pathname);

  const current = await decryptSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  let session: SessionPayload | null = current;
  let rotated: SessionPayload | null = null;
  let refreshFailed = false;

  if (current && isAccessTokenExpiring(current) && isNavigation(request)) {
    rotated = current.refreshToken ? await refreshSession(current.refreshToken) : null;
    if (rotated) {
      session = rotated;
    } else if (isAccessTokenExpired(current)) {
      refreshFailed = true;
      session = null;
    }
  }

  if (guard === "session" && !session) {
    const loginUrl = new URL(localePath(locale, ENTRY_ROUTE), request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return expireSessionCookie(NextResponse.redirect(loginUrl, 307));
  }

  if (guard === "guest" && session) {
    return NextResponse.redirect(
      new URL(localePath(locale, HOME_ROUTE), request.url),
      307,
    );
  }

  const response = intl(request);

  if (rotated) {
    const value = await encryptSession(rotated);
    if (value) response.cookies.set(SESSION_COOKIE_NAME, value, sessionCookieOptions());
  } else if (refreshFailed) {
    expireSessionCookie(response);
  }

  if (session) response.headers.set("Cache-Control", "private, no-store");

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
