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
import { LOCALE_COOKIE_NAME } from "@/lib/preferences";
import {
  internalMemberProfileHref,
  internalProfileUsername,
  memberProfileHref,
  preferredProfileLocale,
  publicProfileUsername,
} from "@/lib/profile/public-routing";

const intl = createMiddleware(routing);
const PROFILE_REWRITE_MARKER = "_volontyorlar_app_profile";

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
  const { pathname, search } = request.nextUrl;
  const internalUsername = internalProfileUsername(pathname);
  if (
    internalUsername &&
    request.nextUrl.searchParams.get(PROFILE_REWRITE_MARKER) !== "1"
  ) {
    return NextResponse.redirect(
      new URL(memberProfileHref(internalUsername), request.url),
      307,
    );
  }

  const rootUsername = publicProfileUsername(pathname);
  if (rootUsername && pathname !== memberProfileHref(rootUsername)) {
    return NextResponse.redirect(
      new URL(memberProfileHref(rootUsername), request.url),
      307,
    );
  }

  const guard = rootUsername ? "session" : guardFor(pathname);
  const locale = rootUsername
    ? preferredProfileLocale(
        request.cookies.get(LOCALE_COOKIE_NAME)?.value,
        request.headers.get("accept-language"),
      )
    : localeOf(pathname);

  const current = await decryptSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  let session: SessionPayload | null = current;
  let upgraded: SessionPayload | null = null;

  if (current && isLegacySession(current) && isNavigation(request)) {
    upgraded = await upgradeLegacySession(current);
    if (upgraded) session = upgraded;
  }

  if (session && isAccessTokenExpired(session)) session = null;

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

  const response = rootUsername
    ? NextResponse.rewrite(
        new URL(
          `${internalMemberProfileHref(locale, rootUsername)}?${new URLSearchParams({
            ...Object.fromEntries(request.nextUrl.searchParams),
            [PROFILE_REWRITE_MARKER]: "1",
          }).toString()}`,
          request.url,
        ),
      )
    : intl(request);

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
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
