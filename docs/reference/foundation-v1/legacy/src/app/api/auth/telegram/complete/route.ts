import { NextResponse, type NextRequest } from "next/server";
import { publicApi } from "@/lib/api/client.server";
import { publicApiBaseUrl } from "@/lib/api/env.server";
import { telegramSessionSchema } from "@/features/auth/telegram";
import { RETURN_TO_COOKIE_NAME, safeReturnPath } from "@/lib/auth/session";
import { writeSession } from "@/lib/auth/session.server";
import { defaultLocale, isLocale } from "@/i18n/routing";

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

    loginUrl.searchParams.set("telegram", "expired");
    return NextResponse.redirect(loginUrl, 307);
  }

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
    ...(session.displayName !== undefined ? { displayName: session.displayName } : {}),
  });

  const returnTo = safeReturnPath(request.cookies.get(RETURN_TO_COOKIE_NAME)?.value);

  const destination = new URL(returnTo ?? `/${locale}/dashboard`, request.url);

  const response = NextResponse.redirect(destination, 307);
  response.cookies.delete(RETURN_TO_COOKIE_NAME);

  return response;
}
