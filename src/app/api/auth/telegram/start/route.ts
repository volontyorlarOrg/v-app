import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { api } from "@/lib/api/client.server";
import { apiBaseUrl, isAuthConfigured } from "@/lib/auth/config";
import {
  LOCALE_HINT_COOKIE_NAME,
  RETURN_TO_COOKIE_NAME,
  handoffCookieOptions,
  safeReturnPath,
} from "@/lib/auth/session";
import {
  AUTH_STATE_COOKIE_NAME,
  isTrustedAuthorizationUrl,
  telegramAuthorizationSchema,
} from "@/lib/auth/telegram";
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import { localePath } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const loginPath = localePath(locale, "login");
  const unavailable = () =>
    relativeRedirect(withQuery(loginPath, { telegram: "unavailable" }));

  if (!isAuthConfigured()) return unavailable();

  let login;

  try {
    login = await api("/auth/telegram/authorize", {
      method: "POST",
      body: { locale },
      schema: telegramAuthorizationSchema,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[telegram-auth] authorize request failed:", error);
    return unavailable();
  }

  if (!isTrustedAuthorizationUrl(login.authorizationUrl, apiBaseUrl())) {
    console.error("[telegram-auth] refused an authorization URL off Telegram");
    return unavailable();
  }

  const response = NextResponse.redirect(login.authorizationUrl, 303);
  response.cookies.set(AUTH_STATE_COOKIE_NAME, login.state, handoffCookieOptions());
  response.cookies.set(LOCALE_HINT_COOKIE_NAME, locale, handoffCookieOptions());

  const next = safeReturnPath(url.searchParams.get("next"));
  if (next) {
    response.cookies.set(RETURN_TO_COOKIE_NAME, next, handoffCookieOptions());
  }

  return response;
}
