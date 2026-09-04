import { EncryptJWT, jwtDecrypt } from "jose";
import { z } from "zod";

import { isProduction, sessionSecret } from "@/lib/auth/config";

export const SESSION_COOKIE_NAME = "volontyorlar_session";
export const RETURN_TO_COOKIE_NAME = "volontyorlar_return_to";
export const LOCALE_HINT_COOKIE_NAME = "volontyorlar_auth_locale";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const HANDOFF_MAX_AGE_SECONDS = 60 * 15;
export const ACCESS_TOKEN_REFRESH_SKEW_SECONDS = 60;

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

export const issuedSessionSchema = z.object({
  userId: z.string().min(1),
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  accessTokenExpiresAt: z.number().int().positive().optional(),
  displayName: z.string().optional(),
  roles: z.array(z.enum(ROLES)).optional(),
});

export type IssuedSession = z.infer<typeof issuedSessionSchema>;

export function toSessionPayload(issued: IssuedSession): SessionPayload {
  return {
    userId: issued.userId,
    accessToken: issued.accessToken,
    roles: issued.roles ?? ["volunteer"],
    ...(issued.refreshToken !== undefined ? { refreshToken: issued.refreshToken } : {}),
    ...(issued.accessTokenExpiresAt !== undefined
      ? { accessTokenExpiresAt: issued.accessTokenExpiresAt }
      : {}),
    ...(issued.displayName !== undefined ? { displayName: issued.displayName } : {}),
  };
}

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

export function isAccessTokenExpiring(
  session: Pick<SessionPayload, "accessTokenExpiresAt">,
  now: number = Date.now(),
): boolean {
  if (session.accessTokenExpiresAt === undefined) return false;
  const nowSeconds = Math.floor(now / 1000);
  return session.accessTokenExpiresAt - ACCESS_TOKEN_REFRESH_SKEW_SECONDS <= nowSeconds;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function handoffCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: HANDOFF_MAX_AGE_SECONDS,
  };
}

export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.includes("\\")) return null;
  return value;
}

let cachedKey: Uint8Array | null = null;
let cachedFrom: string | null = null;

async function encryptionKey(): Promise<Uint8Array | null> {
  const secret = sessionSecret();
  if (!secret) return null;
  if (cachedKey && cachedFrom === secret) return cachedKey;

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  cachedKey = new Uint8Array(digest);
  cachedFrom = secret;
  return cachedKey;
}

export async function encryptSession(payload: SessionPayload): Promise<string | null> {
  const key = await encryptionKey();
  if (!key) return null;

  return new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .encrypt(key);
}

export async function decryptSession(
  value: string | undefined,
): Promise<SessionPayload | null> {
  if (!value) return null;

  const key = await encryptionKey();
  if (!key) return null;

  try {
    const { payload } = await jwtDecrypt(value, key);
    const parsed = sessionPayloadSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
