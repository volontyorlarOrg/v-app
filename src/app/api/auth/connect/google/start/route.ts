import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { GOOGLE_CONNECT_CALLBACK_PATH } from "@/lib/account/connections";
import {
  CONNECT_GOOGLE_STATE_COOKIE_NAME,
  CONNECT_LOCALE_COOKIE_NAME,
} from "@/lib/account/types";
import { challengeGoogleConnection } from "@/lib/api/account.server";
import { googleClientId, isAuthConfigured } from "@/lib/auth/config";
import { googleAuthorizationUrl } from "@/lib/auth/google";
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import { handoffCookieOptions } from "@/lib/auth/session";
import { applyRotation, getSession, rotatedSession } from "@/lib/auth/session.server";
import { hasVerifiedSiteOrigin, siteOrigin } from "@/lib/seo/origin";
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

  const clientId = googleClientId();
  if (!isAuthConfigured() || !clientId) {
    return relativeRedirect(withQuery(settingsPath, { connect: "unavailable" }));
  }

  const rotated = await rotatedSession(session);
  const unavailable = () =>
    applyRotation(
      relativeRedirect(withQuery(settingsPath, { connect: "unavailable" })),
      rotated,
    );

  let challenge;

  try {
    challenge = await challengeGoogleConnection((rotated ?? session).accessToken);
  } catch (error) {
    console.error("[google-connect] challenge request failed:", error);
    return unavailable();
  }

  const origin = hasVerifiedSiteOrigin() ? siteOrigin() : request.nextUrl.origin;
  const response = NextResponse.redirect(
    googleAuthorizationUrl({
      clientId,
      redirectUri: `${origin}${GOOGLE_CONNECT_CALLBACK_PATH}`,
      state: challenge.state,
      nonce: challenge.nonce,
      locale,
    }),
    303,
  );

  const handoff = handoffCookieOptions({ crossSite: true });
  response.cookies.set(CONNECT_GOOGLE_STATE_COOKIE_NAME, challenge.state, handoff);
  response.cookies.set(CONNECT_LOCALE_COOKIE_NAME, locale, handoff);
  return applyRotation(response, rotated);
}
