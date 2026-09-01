import { NextResponse, type NextRequest } from "next/server";
import { publicApi } from "@/lib/api/client.server";
import { publicApiBaseUrl } from "@/lib/api/env.server";
import { telegramSessionSchema } from "@/features/auth/telegram";
import { RETURN_TO_COOKIE_NAME, safeReturnPath } from "@/lib/auth/session";
import { writeSession } from "@/lib/auth/session.server";
import { defaultLocale, isLocale } from "@/i18n/routing";

/**
 * Completes Telegram sign-in by redeeming the one-time login token the bot
 * delivered into the user's own chat.
 *
 * This is the tab the *user* opens from Telegram, which is the whole point of
 * the design: the login page never polls and never signs itself in. If pressing
 * Start signed in whichever browser minted the ticket, anyone could mint one,
 * forward the link, and be signed in as whoever pressed Start. Delivering the
 * credential through the chat means it reaches whoever actually controls the
 * Telegram account.
 *
 * Depends on the **assumed** contract in `features/auth/telegram.ts`.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  const loginUrl = new URL(`/${locale}/login`, request.url);
  const token = url.searchParams.get("token");

  if (!token || !publicApiBaseUrl()) {
    loginUrl.searchParams.set("telegram", token ? "unavailable" : "expired");
    return NextResponse.redirect(loginUrl, 307);
  }

  let session;

  try {
    session = await publicApi("/auth/telegram/complete", {
      method: "POST",
      body: { token },
      schema: telegramSessionSchema,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[telegram-auth] token redemption failed:", error);
    // Expired, already used, and forged tokens are deliberately
    // indistinguishable here — telling them apart would let someone probe
    // which tokens exist.
    loginUrl.searchParams.set("telegram", "expired");
    return NextResponse.redirect(loginUrl, 307);
  }

  // A Route Handler is a valid cookie-write boundary; a Server Component
  // render is not.
  await writeSession({
    userId: session.userId,
    accessToken: session.accessToken,
    roles: session.roles ?? ["volunteer"],
    ...(session.refreshToken !== undefined
      ? { refreshToken: session.refreshToken }
      : {}),
    ...(session.accessTokenExpiresAt !== undefined
      ? { accessTokenExpiresAt: session.accessTokenExpiresAt }
      : {}),
    ...(session.displayName !== undefined
      ? { displayName: session.displayName }
      : {}),
  });

  const returnTo = safeReturnPath(
    request.cookies.get(RETURN_TO_COOKIE_NAME)?.value,
  );

  const destination = new URL(
    returnTo ?? `/${locale}/dashboard`,
    request.url,
  );

  const response = NextResponse.redirect(destination, 307);
  response.cookies.delete(RETURN_TO_COOKIE_NAME);

  return response;
}
