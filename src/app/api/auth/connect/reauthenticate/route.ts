import { endBackendSession } from "@/lib/api/account.server";
import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session.server";
import { ENTRY_ROUTE, navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const session = await getSession();
  if (session) {
    try {
      await endBackendSession(session.accessToken);
    } catch (error) {
      console.error(
        "[account-connect] backend sign-out failed; clearing the local session anyway",
        error,
      );
    }
  }

  const response = relativeRedirect(
    withQuery(navHref(ENTRY_ROUTE), { next: navHref("settings") }),
  );
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
