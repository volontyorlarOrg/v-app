import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import {
  CONNECT_LOCALE_COOKIE_NAME,
  CONNECT_STATE_COOKIE_NAME,
} from "@/lib/account/types";
import { authorizeTelegramConnection } from "@/lib/api/account.server";
import { apiBaseUrl, isAuthConfigured } from "@/lib/auth/config";
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import { handoffCookieOptions } from "@/lib/auth/session";
import { applyRotation, getSession, rotatedSession } from "@/lib/auth/session.server";
import { isTrustedAuthorizationUrl } from "@/lib/auth/telegram";
import { localePath } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const settingsPath = localePath(locale, "settings");

  const session = await getSession();
  if (!session) return relativeRedirect(localePath(locale, "login"));
  if (!isAuthConfigured()) {
    return relativeRedirect(withQuery(settingsPath, { connect: "unavailable" }));
  }

  const rotated = await rotatedSession(session);
  const accessToken = (rotated ?? session).accessToken;
  const unavailable = () =>
    applyRotation(
      relativeRedirect(withQuery(settingsPath, { connect: "unavailable" })),
      rotated,
    );

  let authorization;

  try {
    authorization = await authorizeTelegramConnection(accessToken, locale);
  } catch (error) {
    console.error("[telegram-connect] authorize request failed:", error);
    return unavailable();
  }

  if (!isTrustedAuthorizationUrl(authorization.authorizationUrl, apiBaseUrl())) {
    console.error("[telegram-connect] refused an authorization URL off Telegram");
    return unavailable();
  }

  const response = NextResponse.redirect(authorization.authorizationUrl, 303);
  const handoff = handoffCookieOptions();
  response.cookies.set(CONNECT_STATE_COOKIE_NAME, authorization.state, handoff);
  response.cookies.set(CONNECT_LOCALE_COOKIE_NAME, locale, handoff);
  return applyRotation(response, rotated);
}
