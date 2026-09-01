import { NextResponse, type NextRequest } from "next/server";
import { publicApi } from "@/lib/api/client.server";
import { isProduction, publicApiBaseUrl } from "@/lib/api/env.server";
import {
  botDeepLink,
  telegramTicketSchema,
} from "@/features/auth/telegram";
import { RETURN_TO_COOKIE_NAME, safeReturnPath } from "@/lib/auth/session";
import { defaultLocale, isLocale } from "@/i18n/routing";

/**
 * Starts Telegram sign-in.
 *
 * Same-origin route handler rather than a Server Action because the response
 * is a redirect to `t.me`, and because the browser must never see the ticket
 * request itself.
 *
 * Depends on the **assumed** backend contract in `features/auth/telegram.ts`.
 * With no backend configured it returns the user to `/login` with an
 * `unavailable` notice rather than failing silently.
 */
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
    // The real reason stays in the server log. The browser learns only that
    // sign-in is unavailable — a misconfigured bot is not the user's problem
    // and its details are not theirs to see.
    console.error("[telegram-auth] ticket request failed:", error);
    loginUrl.searchParams.set("telegram", "unavailable");
    return NextResponse.redirect(loginUrl, 307);
  }

  const response = NextResponse.redirect(
    botDeepLink(ticket.botUsername, ticket.ticket),
    307,
  );

  // Remember where to land afterwards. Short-lived and httpOnly: it is a
  // navigation hint, not something client script has any reason to read.
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
