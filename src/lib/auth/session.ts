import { z } from "zod";

/**
 * Session shape and cookie policy.
 *
 * Kept free of `server-only` so `src/proxy.ts` can import it. It contains no
 * secrets and no I/O — the encryption keys and the cookie store live in
 * `session.server.ts`.
 */

export const SESSION_COOKIE_NAME = "yvc_session";

/** Where to return after sign-in. Written by the sign-in entry point. */
export const RETURN_TO_COOKIE_NAME = "yvc_return_to";

/**
 * Roles as the *frontend* understands them.
 *
 * These decide what is worth rendering. They decide nothing about what is
 * permitted: every protected operation is authorised by the backend, and a
 * hidden button is not a security control (handoff §4).
 *
 * `partner` and `admin` exist because the route tree reserves space for them.
 * `coordinator` is deliberately absent — regional coordinators exist
 * operationally, but no product workflow or backend contract does, and
 * inventing an authorisation level for them now would be fiction.
 */
export const ROLES = ["volunteer", "partner", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const sessionPayloadSchema = z.object({
  /** Backend user id. The only trustworthy source of identity. */
  userId: z.string().min(1),
  roles: z.array(z.enum(ROLES)).default(["volunteer"]),
  /** Display name, for the account menu. Absent until the profile has one. */
  displayName: z.string().optional(),
  /** Backend access token. Never leaves the server. */
  accessToken: z.string().min(1),
  /** Single-use refresh token, if the backend issues one. */
  refreshToken: z.string().optional(),
  /** Access-token expiry, epoch seconds. */
  accessTokenExpiresAt: z.number().int().positive().optional(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

/**
 * What a Client Component is allowed to know about the session.
 *
 * Tokens are absent by construction rather than by remembering to strip them:
 * anything passed to the client is built through this type.
 */
export type PublicSession = {
  userId: string;
  roles: Role[];
  displayName?: string;
};

export function toPublicSession(session: SessionPayload): PublicSession {
  return {
    userId: session.userId,
    roles: session.roles,
    ...(session.displayName !== undefined
      ? { displayName: session.displayName }
      : {}),
  };
}

export function hasRole(
  session: Pick<SessionPayload, "roles"> | PublicSession | null,
  role: Role,
): boolean {
  return session?.roles.includes(role) ?? false;
}

/** Session lifetime. Matches the refresh-token window the backend allows. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Refresh this many seconds before the access token actually expires. */
export const ACCESS_TOKEN_REFRESH_SKEW_SECONDS = 60;

export function isAccessTokenExpiring(
  session: Pick<SessionPayload, "accessTokenExpiresAt">,
  now: number = Date.now(),
): boolean {
  // No stated expiry means we cannot know, so we do not pre-emptively spend a
  // single-use refresh token. A 401 from the backend is the fallback signal.
  if (session.accessTokenExpiresAt === undefined) return false;

  const nowSeconds = Math.floor(now / 1000);
  return session.accessTokenExpiresAt - ACCESS_TOKEN_REFRESH_SKEW_SECONDS <= nowSeconds;
}

/**
 * Cookie attributes. `httpOnly` is what keeps the session out of reach of
 * `document.cookie` and therefore out of any XSS payload; `lax` still lets
 * the cookie ride the top-level navigation that Telegram sends users back on.
 */
export function sessionCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Guards an open redirect. Only a same-site, non-protocol-relative path is
 * ever followed after sign-in.
 */
export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  // `//evil.example` is a protocol-relative URL, not a local path.
  if (value.startsWith("//")) return null;
  if (value.includes("\\")) return null;
  return value;
}
