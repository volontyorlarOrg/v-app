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
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import { localePath } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const loginPath = localePath(locale, "login");

  if (!isAuthConfigured()) {
    return relativeRedirect(withQuery(loginPath, { telegram: "unavailable" }));
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
    return relativeRedirect(withQuery(loginPath, { telegram: "unavailable" }));
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
