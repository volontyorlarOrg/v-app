import type { NextRequest, NextResponse } from "next/server";

import {
  connectLocale,
  connectStatusForError,
  connectStatusForProviderError,
} from "@/lib/account/connections";
import {
  CONNECT_LOCALE_COOKIE_NAME,
  CONNECT_STATE_COOKIE_NAME,
  type ConnectStatus,
} from "@/lib/account/types";
import { completeTelegramConnection } from "@/lib/api/account.server";
import { isAuthConfigured } from "@/lib/auth/config";
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import { handoffCookieOptions } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session.server";
import { PREFERENCE_LOCALE_COOKIE } from "@/lib/preferences";
import { localePath } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function clearHandoff(response: NextResponse) {
  const expired = { ...handoffCookieOptions(), maxAge: 0 };
  response.cookies.set(CONNECT_STATE_COOKIE_NAME, "", expired);
  response.cookies.set(CONNECT_LOCALE_COOKIE_NAME, "", expired);
  return response;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
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

  const providerError = url.searchParams.get("error");
  if (providerError) {
    console.warn("[telegram-connect] telegram declined the connection:", providerError);
    return backToSettings(connectStatusForProviderError(providerError));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(CONNECT_STATE_COOKIE_NAME)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return backToSettings("expired");
  }
  if (!isAuthConfigured()) return backToSettings("unavailable");

  try {
    const outcome = await completeTelegramConnection(session.accessToken, {
      state,
      code,
    });
    return backToSettings(outcome.outcome);
  } catch (error) {
    const status = connectStatusForError(error);
    if (status === "unavailable") {
      console.error("[telegram-connect] completion failed:", error);
    } else {
      console.warn("[telegram-connect] completion rejected:", status);
    }
    return backToSettings(status);
  }
}
