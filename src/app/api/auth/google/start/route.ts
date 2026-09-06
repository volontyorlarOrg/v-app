import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { api } from "@/lib/api/client.server";
import {
  AUTH_REQUEST_TIMEOUT_MS,
  googleClientId,
  isAuthConfigured,
} from "@/lib/auth/config";
import {
  GOOGLE_STATE_COOKIE_NAME,
  googleAuthorizationUrl,
  googleChallengeSchema,
  googleRedirectUri,
} from "@/lib/auth/google";
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import {
  LOCALE_HINT_COOKIE_NAME,
  RETURN_TO_COOKIE_NAME,
  handoffCookieOptions,
  safeReturnPath,
} from "@/lib/auth/session";
import { localePath } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const loginPath = localePath(locale, "login");
  const unavailable = () =>
    relativeRedirect(withQuery(loginPath, { google: "unavailable" }));

  const clientId = googleClientId();
  if (!isAuthConfigured() || !clientId) return unavailable();

  let challenge;

  try {
    challenge = await api("/auth/google/challenge", {
      method: "POST",
      body: {},
      schema: googleChallengeSchema,
      cache: "no-store",
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
    });
  } catch (error) {
    console.error("[google-auth] challenge request failed:", error);
    return unavailable();
  }

  const response = NextResponse.redirect(
    googleAuthorizationUrl({
      clientId,
      redirectUri: googleRedirectUri(request.nextUrl.origin),
      state: challenge.state,
      nonce: challenge.nonce,
      locale,
    }),
    303,
  );

  const handoff = handoffCookieOptions({ crossSite: true });
  response.cookies.set(GOOGLE_STATE_COOKIE_NAME, challenge.state, handoff);
  response.cookies.set(LOCALE_HINT_COOKIE_NAME, locale, handoff);

  const next = safeReturnPath(url.searchParams.get("next"));
  if (next) response.cookies.set(RETURN_TO_COOKIE_NAME, next, handoff);

  return response;
}
