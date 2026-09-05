import type { NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session";
import { localePath } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const localeParam = new URL(request.url).searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  const response = relativeRedirect(
    withQuery(localePath(locale, "login"), { session: "expired" }),
  );
  response.cookies.set(SESSION_COOKIE_NAME, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
