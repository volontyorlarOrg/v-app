import { z } from "zod";

export const SESSION_COOKIE_NAME = "yvc_session";

export const RETURN_TO_COOKIE_NAME = "yvc_return_to";

export const ROLES = ["volunteer", "partner", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const sessionPayloadSchema = z.object({
  userId: z.string().min(1),
  roles: z.array(z.enum(ROLES)).default(["volunteer"]),

  displayName: z.string().optional(),

  accessToken: z.string().min(1),

  refreshToken: z.string().optional(),

  accessTokenExpiresAt: z.number().int().positive().optional(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export type PublicSession = {
  userId: string;
  roles: Role[];
  displayName?: string;
};

export function toPublicSession(session: SessionPayload): PublicSession {
  return {
    userId: session.userId,
    roles: session.roles,
    ...(session.displayName !== undefined ? { displayName: session.displayName } : {}),
  };
}

export function hasRole(
  session: Pick<SessionPayload, "roles"> | PublicSession | null,
  role: Role,
): boolean {
  return session?.roles.includes(role) ?? false;
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const ACCESS_TOKEN_REFRESH_SKEW_SECONDS = 60;

export function isAccessTokenExpiring(
  session: Pick<SessionPayload, "accessTokenExpiresAt">,
  now: number = Date.now(),
): boolean {
  if (session.accessTokenExpiresAt === undefined) return false;

  const nowSeconds = Math.floor(now / 1000);
  return session.accessTokenExpiresAt - ACCESS_TOKEN_REFRESH_SKEW_SECONDS <= nowSeconds;
}

export function sessionCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;

  if (value.startsWith("//")) return null;
  if (value.includes("\\")) return null;
  return value;
}
