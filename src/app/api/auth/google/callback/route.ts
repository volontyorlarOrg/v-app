import type { NextRequest, NextResponse } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { api } from "@/lib/api/client.server";
import { AUTH_REQUEST_TIMEOUT_MS, isAuthConfigured } from "@/lib/auth/config";
import {
  GOOGLE_STATE_COOKIE_NAME,
  googleStatusForError,
  googleStatusForProviderError,
  type GoogleStatus,
} from "@/lib/auth/google";
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
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

const GOOGLE_POST_ORIGIN = "https://accounts.google.com";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function clearHandoff(response: NextResponse) {
  response.cookies.delete(GOOGLE_STATE_COOKIE_NAME);
  response.cookies.delete(RETURN_TO_COOKIE_NAME);
  response.cookies.delete(LOCALE_HINT_COOKIE_NAME);
  return response;
}

function isAcceptableOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  if (origin === GOOGLE_POST_ORIGIN) return true;

  const host = request.headers.get("host");
  return host !== null && (origin === `https://${host}` || origin === `http://${host}`);
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

export async function POST(request: NextRequest) {
  const hintedLocale = request.cookies.get(LOCALE_HINT_COOKIE_NAME)?.value;
  const locale = isLocale(hintedLocale) ? hintedLocale : defaultLocale;
  const loginPath = localePath(locale, "login");
  const backToLogin = (status: GoogleStatus) =>
    clearHandoff(relativeRedirect(withQuery(loginPath, { google: status })));

  if (!isAcceptableOrigin(request)) {
    console.warn("[google-auth] refused a callback posted from an unknown origin");
    return backToLogin("expired");
  }

  const form = await request.formData().catch(() => null);
  if (!form) return backToLogin("unavailable");

  const providerError = field(form, "error");
  if (providerError) {
    console.warn("[google-auth] google declined the sign-in:", providerError);
    return backToLogin(googleStatusForProviderError(providerError));
  }

  const credential = field(form, "id_token");
  const state = field(form, "state");
  const expectedState = request.cookies.get(GOOGLE_STATE_COOKIE_NAME)?.value;

  if (!credential || !state || !expectedState || state !== expectedState) {
    return backToLogin("expired");
  }
  if (!isAuthConfigured()) return backToLogin("unavailable");

  let session;

  try {
    session = await api("/auth/google/complete", {
      method: "POST",
      body: { state, credential },
      schema: issuedSessionSchema,
      cache: "no-store",
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
    });
  } catch (error) {
    const status = googleStatusForError(error);
    if (status === "unavailable") {
      console.error("[google-auth] callback redemption failed:", error);
    } else {
      console.warn("[google-auth] callback rejected:", status);
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

export async function GET(request: NextRequest) {
  const hintedLocale = request.cookies.get(LOCALE_HINT_COOKIE_NAME)?.value;
  const locale = isLocale(hintedLocale) ? hintedLocale : defaultLocale;
  return clearHandoff(
    relativeRedirect(
      withQuery(localePath(locale, "login"), {
        google: "expired" satisfies GoogleStatus,
      }),
    ),
  );
}
