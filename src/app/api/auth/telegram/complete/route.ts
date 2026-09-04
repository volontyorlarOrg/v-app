import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { api } from "@/lib/api/client.server";
import { isAuthConfigured } from "@/lib/auth/config";
import {
  LOCALE_HINT_COOKIE_NAME,
  RETURN_TO_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  encryptSession,
  issuedSessionSchema,
  safeReturnPath,
  sessionCookieOptions,
  toSessionPayload,
} from "@/lib/auth/session";
import { HOME_ROUTE, localePath } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const requestedLocale = url.searchParams.get("locale");
  const hintedLocale = request.cookies.get(LOCALE_HINT_COOKIE_NAME)?.value;
  const locale = isLocale(requestedLocale)
    ? requestedLocale
    : isLocale(hintedLocale)
      ? hintedLocale
      : defaultLocale;

  const loginUrl = new URL(localePath(locale, "login"), request.url);
  const token = url.searchParams.get("token");

  if (!token || !isAuthConfigured()) {
    loginUrl.searchParams.set("telegram", token ? "unavailable" : "expired");
    return NextResponse.redirect(loginUrl, 303);
  }

  let session;

  try {
    session = await api("/auth/telegram/complete", {
      method: "POST",
      body: { loginToken: token },
      schema: issuedSessionSchema,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[telegram-auth] token redemption failed:", error);
    loginUrl.searchParams.set("telegram", "expired");
    return NextResponse.redirect(loginUrl, 303);
  }

  const cookieValue = await encryptSession(toSessionPayload(session));

  if (!cookieValue) {
    loginUrl.searchParams.set("telegram", "unavailable");
    return NextResponse.redirect(loginUrl, 303);
  }

  const returnTo = safeReturnPath(request.cookies.get(RETURN_TO_COOKIE_NAME)?.value);
  const destination = new URL(returnTo ?? localePath(locale, HOME_ROUTE), request.url);

  const response = NextResponse.redirect(destination, 303);
  response.cookies.set(SESSION_COOKIE_NAME, cookieValue, sessionCookieOptions());
  response.cookies.delete(RETURN_TO_COOKIE_NAME);
  response.cookies.delete(LOCALE_HINT_COOKIE_NAME);

  return response;
}
