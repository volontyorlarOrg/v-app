import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { isLocale, routing } from "@/i18n/routing";
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
import {
  ENTRY_ROUTE,
  HOME_ROUTE,
  guardFor,
  legacyLocalePrefix,
  navHref,
} from "@/lib/routing/routes";
import { LOCALE_COOKIE, MARKETING_LOCALE_COOKIE_NAME } from "@/lib/preferences";
import {
  internalMemberProfileHref,
  internalProfileUsername,
  memberProfileHref,
  publicProfileUsername,
} from "@/lib/profile/public-routing";

const intl = createMiddleware(routing);
const INTL_LOCALE_HEADER = "x-next-intl-locale";

type PrefixedPath = NonNullable<ReturnType<typeof legacyLocalePrefix>>;

function isOwnRewrite(request: NextRequest, prefixed: PrefixedPath) {
  return request.headers.get(INTL_LOCALE_HEADER) === prefixed.locale;
}

function storedLocale(request: NextRequest) {
  const value = request.cookies.get(LOCALE_COOKIE.name)?.value;
  return isLocale(value) ? value : null;
}

function marketingLocale(request: NextRequest) {
  const value = request.cookies.get(MARKETING_LOCALE_COOKIE_NAME)?.value;
  return isLocale(value) ? value : null;
}

function rememberLocale(response: NextResponse, locale: string) {
  const { name, ...options } = LOCALE_COOKIE;
  response.cookies.set(name, locale, options);
}

function withoutLegacyLocale(request: NextRequest, legacy: PrefixedPath) {
  const response = NextResponse.redirect(
    new URL(`${legacy.path}${request.nextUrl.search}`, request.url),
    307,
  );
  if (!storedLocale(request)) rememberLocale(response, legacy.locale);
  return response;
}

function asMemberProfile(request: NextRequest, username: string) {
  return new NextRequest(
    new URL(
      `${internalMemberProfileHref(username)}${request.nextUrl.search}`,
      request.url,
    ),
    { headers: request.headers },
  );
}

function isNavigation(request: NextRequest) {
  if (request.method !== "GET") return false;
  if (request.headers.get("next-router-prefetch")) return false;
  if (request.headers.get("purpose") === "prefetch") return false;
  if (request.headers.get("rsc")) return true;
  return request.headers.get("accept")?.includes("text/html") ?? false;
}

function isLegacySession(session: SessionPayload) {
  return Boolean(session.refreshToken) && isAccessTokenExpiring(session);
}

async function upgradeLegacySession(session: SessionPayload) {
  return session.refreshToken ? refreshSession(session.refreshToken) : null;
}

function expireSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export default async function proxy(request: NextRequest) {
  const { search } = request.nextUrl;
  const prefixed = legacyLocalePrefix(request.nextUrl.pathname);
  const rewritten = prefixed !== null && isOwnRewrite(request, prefixed);
  if (prefixed && !rewritten) return withoutLegacyLocale(request, prefixed);

  const pathname = prefixed ? prefixed.path : request.nextUrl.pathname;
  const internalUsername = rewritten ? null : internalProfileUsername(pathname);
  if (internalUsername) {
    return NextResponse.redirect(
      new URL(memberProfileHref(internalUsername), request.url),
      307,
    );
  }

  const rootUsername = rewritten ? null : publicProfileUsername(pathname);
  if (rootUsername && pathname !== memberProfileHref(rootUsername)) {
    return NextResponse.redirect(
      new URL(memberProfileHref(rootUsername), request.url),
      307,
    );
  }

  const guard = rootUsername ? "session" : guardFor(pathname);

  const current = await decryptSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  let session: SessionPayload | null = current;
  let upgraded: SessionPayload | null = null;

  if (current && isLegacySession(current) && isNavigation(request)) {
    upgraded = await upgradeLegacySession(current);
    if (upgraded) session = upgraded;
  }

  if (session && isAccessTokenExpired(session)) session = null;

  if (guard === "session" && !session) {
    const loginUrl = new URL(navHref(ENTRY_ROUTE), request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return expireSessionCookie(NextResponse.redirect(loginUrl, 307));
  }

  if (guard === "guest" && session) {
    return NextResponse.redirect(new URL(navHref(HOME_ROUTE), request.url), 307);
  }

  const seeded = rewritten || storedLocale(request) ? null : marketingLocale(request);
  if (seeded) request.cookies.set(LOCALE_COOKIE.name, seeded);

  const response = rewritten
    ? NextResponse.next()
    : intl(rootUsername ? asMemberProfile(request, rootUsername) : request);
  if (seeded) rememberLocale(response, seeded);

  if (upgraded) {
    const value = await encryptSession(upgraded);
    if (value) response.cookies.set(SESSION_COOKIE_NAME, value, sessionCookieOptions());
  } else if (current && !session) {
    expireSessionCookie(response);
  }

  if (session) response.headers.set("Cache-Control", "private, no-store");

  return response;
}

export const config = {
  matcher: ["/((?!api/|_next/|_vercel/|.*\\..*).*)"],
};
