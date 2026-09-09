import type { NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { endBackendSession } from "@/lib/api/account.server";
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session.server";
import { localePath } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const requested = form?.get("locale");
  const locale = isLocale(requested) ? requested : defaultLocale;

  const session = await getSession();
  if (session) {
    try {
      await endBackendSession(session.accessToken, session.refreshToken);
    } catch (error) {
      console.error(
        "[account-connect] backend sign-out failed; clearing the local session anyway",
        error,
      );
    }
  }

  const response = relativeRedirect(
    withQuery(localePath(locale, "login"), {
      next: localePath(locale, "settings"),
    }),
  );
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
