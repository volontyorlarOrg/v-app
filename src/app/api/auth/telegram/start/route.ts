import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { api } from "@/lib/api/client.server";
import { isAuthConfigured } from "@/lib/auth/config";
import {
  LOCALE_HINT_COOKIE_NAME,
  RETURN_TO_COOKIE_NAME,
  handoffCookieOptions,
  safeReturnPath,
} from "@/lib/auth/session";
import { botDeepLink, telegramTicketSchema } from "@/lib/auth/telegram";
import { localePath } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const loginUrl = new URL(localePath(locale, "login"), request.url);

  if (!isAuthConfigured()) {
    loginUrl.searchParams.set("telegram", "unavailable");
    return NextResponse.redirect(loginUrl, 303);
  }

  let ticket;

  try {
    ticket = await api("/auth/telegram/ticket", {
      method: "POST",
      body: { locale },
      schema: telegramTicketSchema,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[telegram-auth] ticket request failed:", error);
    loginUrl.searchParams.set("telegram", "unavailable");
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(
    botDeepLink(ticket.botUsername, ticket.ticket),
    303,
  );

  response.cookies.set(LOCALE_HINT_COOKIE_NAME, locale, handoffCookieOptions());

  const next = safeReturnPath(url.searchParams.get("next"));
  if (next) {
    response.cookies.set(RETURN_TO_COOKIE_NAME, next, handoffCookieOptions());
  }

  return response;
}
