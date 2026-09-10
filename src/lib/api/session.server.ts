import "server-only";

import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { z } from "zod";

import { api, type ApiRequest } from "@/lib/api/client.server";
import { isApiError } from "@/lib/api/errors";
import { refreshSession } from "@/lib/auth/refresh";
import { isAccessTokenExpiring, type SessionPayload } from "@/lib/auth/session";
import { canWriteSession, getSession, writeSession } from "@/lib/auth/session.server";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { HOME_ROUTE, localePath } from "@/lib/routing/routes";

export const SESSION_EXPIRED_PATH = "/api/auth/session/expired";

export function sessionExpiredHref(locale: string): string {
  const params = new URLSearchParams({ locale });
  return `${SESSION_EXPIRED_PATH}?${params.toString()}`;
}

/** The session is genuinely over: drop the cookie and ask for a new sign-in. */
async function endSession(): Promise<never> {
  redirect(sessionExpiredHref(await getLocale()));
}

/**
 * The session may well be fine — this render simply had no way to renew it.
 *
 * Only a route handler, a server action or the proxy may write cookies, so a
 * page render that meets an expired access token cannot rotate it. Sending the
 * volunteer through the expired route here would delete a session whose refresh
 * token is still good for weeks. Bounce to a plain navigation instead and let
 * the proxy do the renewing, with the cookie left untouched.
 */
async function deferSession(): Promise<never> {
  const locale = await getLocale();
  redirect(localePath(isLocale(locale) ? locale : defaultLocale, HOME_ROUTE));
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) await endSession();
  return session as SessionPayload;
}

/**
 * One refresh per request, however many loaders ask for it.
 *
 * A refresh token is single-use: the backend revokes it as it hands out the
 * next one, and a second use looks like a stolen token, so it revokes the whole
 * family and the volunteer is signed out. A page that loads its data in
 * parallel would otherwise send the same token several times at once and sign
 * itself out roughly every time the access token came up for renewal. Keying
 * the cache on the token means every caller holding it awaits one rotation.
 */
type Rotation =
  | { status: "renewed"; session: SessionPayload }
  /** The backend refused the refresh token: the session really is over. */
  | { status: "rejected" }
  /** Nothing could be attempted here; the session is still presumed good. */
  | { status: "deferred" };

const rotateToken = cache(async function rotateToken(
  refreshToken: string,
): Promise<Rotation> {
  if (!(await canWriteSession())) return { status: "deferred" };

  const renewed = await refreshSession(refreshToken);
  if (!renewed) return { status: "rejected" };

  return (await writeSession(renewed))
    ? { status: "renewed", session: renewed }
    : { status: "deferred" };
});

async function rotate(session: SessionPayload): Promise<Rotation> {
  if (!session.refreshToken) return { status: "rejected" };
  return rotateToken(session.refreshToken);
}

type AuthedRequest<TSchema extends z.ZodType | undefined> = Omit<
  ApiRequest<TSchema>,
  "accessToken" | "cache"
>;

type AuthedResult<TSchema extends z.ZodType | undefined> = TSchema extends z.ZodType
  ? z.infer<TSchema>
  : unknown;

export async function authed<TSchema extends z.ZodType | undefined = undefined>(
  path: string,
  init: AuthedRequest<TSchema> = {},
): Promise<AuthedResult<TSchema>> {
  let session = await requireSession();

  if (isAccessTokenExpiring(session)) {
    const rotation = await rotate(session);
    if (rotation.status === "renewed") session = rotation.session;
  }

  try {
    return (await api(path, {
      ...init,
      accessToken: session.accessToken,
      cache: "no-store",
    })) as AuthedResult<TSchema>;
  } catch (error) {
    if (!isApiError(error) || error.code !== "unauthenticated") throw error;

    const rotation = await rotate(session);
    if (rotation.status === "rejected") await endSession();
    if (rotation.status === "deferred") await deferSession();

    return (await api(path, {
      ...init,
      accessToken: (rotation as { session: SessionPayload }).session.accessToken,
      cache: "no-store",
    })) as AuthedResult<TSchema>;
  }
}

export function isMissing(error: unknown): boolean {
  return isApiError(error) && (error.code === "notFound" || error.code === "validation");
}
