import { relativeRedirect, withQuery } from "@/lib/auth/redirect";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session";
import { ENTRY_ROUTE, navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";

export function GET() {
  const response = relativeRedirect(
    withQuery(navHref(ENTRY_ROUTE), { session: "expired" }),
  );
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
