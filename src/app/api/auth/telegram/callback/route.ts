import type { NextRequest, NextResponse } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { api } from "@/lib/api/client.server";
import {
  AUTH_REQUEST_TIMEOUT_MS,
  isAuthConfigured,
} from "@/lib/auth/config";
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
import {
  AUTH_STATE_COOKIE_NAME,
  telegramStatusForError,
  telegramStatusForProviderError,
  type TelegramStatus,
} from "@/lib/auth/telegram";
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import { HOME_ROUTE, localePath } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function clearHandoff(response: NextResponse) {
  response.cookies.delete(AUTH_STATE_COOKIE_NAME);
  response.cookies.delete(RETURN_TO_COOKIE_NAME);
  response.cookies.delete(LOCALE_HINT_COOKIE_NAME);
  return response;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const hintedLocale = request.cookies.get(LOCALE_HINT_COOKIE_NAME)?.value;
  const locale = isLocale(hintedLocale) ? hintedLocale : defaultLocale;
  const loginPath = localePath(locale, "login");
  const backToLogin = (status: TelegramStatus) =>
    clearHandoff(relativeRedirect(withQuery(loginPath, { telegram: status })));

  const providerError = url.searchParams.get("error");
  if (providerError) {
    console.warn("[telegram-auth] telegram declined the sign-in:", providerError);
    return backToLogin(telegramStatusForProviderError(providerError));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(AUTH_STATE_COOKIE_NAME)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return backToLogin("expired");
  }
  if (!isAuthConfigured()) return backToLogin("unavailable");

  let session;

  try {
    session = await api("/auth/telegram/callback", {
      method: "POST",
      body: { state, code },
      schema: issuedSessionSchema,
      cache: "no-store",
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
    });
  } catch (error) {
    const status = telegramStatusForError(error);
    if (status === "unavailable") {
      console.error("[telegram-auth] callback redemption failed:", error);
    } else {
      console.warn("[telegram-auth] callback rejected:", status);
    }
    return backToLogin(status);
  }

  const cookieValue = await encryptSession(toSessionPayload(session));
  if (!cookieValue) return backToLogin("unavailable");

  const returnTo = safeReturnPath(request.cookies.get(RETURN_TO_COOKIE_NAME)?.value);
  const response = relativeRedirect(returnTo ?? localePath(locale, HOME_ROUTE));
  response.cookies.set(SESSION_COOKIE_NAME, cookieValue, sessionCookieOptions());
  return clearHandoff(response);
}
