import { NextResponse, type NextRequest } from "next/server";
import { publicApi } from "@/lib/api/client.server";
import { isProduction, publicApiBaseUrl } from "@/lib/api/env.server";
import { botDeepLink, telegramTicketSchema } from "@/features/auth/telegram";
import { RETURN_TO_COOKIE_NAME, safeReturnPath } from "@/lib/auth/session";
import { defaultLocale, isLocale } from "@/i18n/routing";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  const loginUrl = new URL(`/${locale}/login`, request.url);

  if (!publicApiBaseUrl()) {
    loginUrl.searchParams.set("telegram", "unavailable");
    return NextResponse.redirect(loginUrl, 307);
  }

  let ticket;

  try {
    ticket = await publicApi("/auth/telegram/ticket", {
      method: "POST",
      schema: telegramTicketSchema,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[telegram-auth] ticket request failed:", error);
    loginUrl.searchParams.set("telegram", "unavailable");
    return NextResponse.redirect(loginUrl, 307);
  }

  const response = NextResponse.redirect(
    botDeepLink(ticket.botUsername, ticket.ticket),
    307,
  );

  const next = safeReturnPath(url.searchParams.get("next"));

  if (next) {
    response.cookies.set(RETURN_TO_COOKIE_NAME, next, {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  }

  return response;
}
