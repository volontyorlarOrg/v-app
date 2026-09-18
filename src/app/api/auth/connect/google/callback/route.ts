import type { NextRequest, NextResponse } from "next/server";

import {
  connectLocale,
  connectStatusForError,
  connectStatusForProviderError,
} from "@/lib/account/connections";
import {
  CONNECT_GOOGLE_STATE_COOKIE_NAME,
  CONNECT_LOCALE_COOKIE_NAME,
  type ConnectStatus,
} from "@/lib/account/types";
import { completeGoogleConnection } from "@/lib/api/account.server";
import { isAuthConfigured } from "@/lib/auth/config";
import { isAcceptableGooglePostOrigin } from "@/lib/auth/google";
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import { handoffCookieOptions } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session.server";
import { PREFERENCE_LOCALE_COOKIE } from "@/lib/preferences";
import { localePath } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function clearHandoff(response: NextResponse) {
  const expired = { ...handoffCookieOptions({ crossSite: true }), maxAge: 0 };
  response.cookies.set(CONNECT_GOOGLE_STATE_COOKIE_NAME, "", expired);
  response.cookies.set(CONNECT_LOCALE_COOKIE_NAME, "", expired);
  return response;
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

export async function POST(request: NextRequest) {
  const locale = connectLocale(
    request.cookies.get(CONNECT_LOCALE_COOKIE_NAME)?.value,
    request.cookies.get(PREFERENCE_LOCALE_COOKIE.name)?.value,
  );
  const settingsPath = localePath(locale, "settings");
  const backToSettings = (status: ConnectStatus) =>
    clearHandoff(relativeRedirect(withQuery(settingsPath, { connect: status })));

  const session = await getSession();
  if (!session) {
    return clearHandoff(relativeRedirect(localePath(locale, "login")));
  }

  if (
    !isAcceptableGooglePostOrigin({
      origin: request.headers.get("origin"),
      host: request.headers.get("host"),
      hostname: request.nextUrl.hostname,
      protocol: request.nextUrl.protocol,
    })
  ) {
    console.warn("[google-connect] refused a callback posted from an unknown origin");
    return backToSettings("expired");
  }

  const form = await request.formData().catch(() => null);
  if (!form) return backToSettings("unavailable");

  const providerError = field(form, "error");
  if (providerError) {
    console.warn("[google-connect] google declined the connection:", providerError);
    return backToSettings(connectStatusForProviderError(providerError));
  }

  const credential = field(form, "id_token");
  const state = field(form, "state");
  const expectedState = request.cookies.get(CONNECT_GOOGLE_STATE_COOKIE_NAME)?.value;

  if (!credential || !state || !expectedState || state !== expectedState) {
    return backToSettings("expired");
  }
  if (!isAuthConfigured()) return backToSettings("unavailable");

  try {
    const outcome = await completeGoogleConnection(session.accessToken, {
      state,
      credential,
    });
    return backToSettings(outcome.outcome);
  } catch (error) {
    const status = connectStatusForError(error);
    if (status === "unavailable") {
      console.error("[google-connect] completion failed:", error);
    } else {
      console.warn("[google-connect] completion rejected:", status);
    }
    return backToSettings(status);
  }
}

export async function GET(request: NextRequest) {
  const locale = connectLocale(
    request.cookies.get(CONNECT_LOCALE_COOKIE_NAME)?.value,
    request.cookies.get(PREFERENCE_LOCALE_COOKIE.name)?.value,
  );
  return clearHandoff(
    relativeRedirect(
      withQuery(localePath(locale, "settings"), {
        connect: "expired" satisfies ConnectStatus,
      }),
    ),
  );
}
