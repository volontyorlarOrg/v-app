import type { NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { api } from "@/lib/api/client.server";
import { isApiError } from "@/lib/api/errors";
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
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
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

  const loginPath = localePath(locale, "login");
  const token = url.searchParams.get("token");

  if (!token || !isAuthConfigured()) {
    return relativeRedirect(
      withQuery(loginPath, { telegram: token ? "unavailable" : "expired" }),
    );
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
    if (isApiError(error) && (error.code === "unauthenticated" || error.code === "validation")) {
      console.warn("[telegram-auth] login token rejected:", error.code);
    } else {
      console.error("[telegram-auth] token redemption failed:", error);
    }
    return relativeRedirect(withQuery(loginPath, { telegram: "expired" }));
  }

  const cookieValue = await encryptSession(toSessionPayload(session));

  if (!cookieValue) {
    return relativeRedirect(withQuery(loginPath, { telegram: "unavailable" }));
  }

  const returnTo = safeReturnPath(request.cookies.get(RETURN_TO_COOKIE_NAME)?.value);
  const response = relativeRedirect(returnTo ?? localePath(locale, HOME_ROUTE));
  response.cookies.set(SESSION_COOKIE_NAME, cookieValue, sessionCookieOptions());
  response.cookies.delete(RETURN_TO_COOKIE_NAME);
  response.cookies.delete(LOCALE_HINT_COOKIE_NAME);

  return response;
}
