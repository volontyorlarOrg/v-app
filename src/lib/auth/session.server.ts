import "server-only";

import { cookies } from "next/headers";
import { EncryptJWT, jwtDecrypt } from "jose";
import { isProduction, sessionSecret } from "@/lib/api/env.server";
import { ApiError } from "@/lib/api/errors";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieOptions,
  sessionPayloadSchema,
  type SessionPayload,
} from "./session";

/**
 * Reading, writing, and clearing the session.
 *
 * The cookie holds an **encrypted** JWE, not a signed JWT. A signed token
 * would leave the backend access token readable by anyone who can see the
 * cookie value — a support screenshot, a shared device, a proxy log. Encrypting
 * it means the cookie is opaque to everything except this server.
 */

let cachedKey: Uint8Array | null = null;

/** Derives the AES key. Returns `null` when auth is not configured. */
async function encryptionKey(): Promise<Uint8Array | null> {
  if (cachedKey) return cachedKey;

  const secret = sessionSecret();
  if (!secret) return null;

  // A64-byte-ish passphrase is not a key; hashing gives the exact 32 bytes
  // A256GCM requires regardless of how the secret was generated.
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );

  cachedKey = new Uint8Array(digest);
  return cachedKey;
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  const key = await encryptionKey();

  if (!key) {
    throw new ApiError("notConfigured", {
      message: "YVC_SESSION_SECRET is not set; cannot establish a session.",
    });
  }

  return new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .encrypt(key);
}

/**
 * Decrypts and validates a session cookie.
 *
 * Any failure — tampering, expiry, a rotated secret, a payload that no longer
 * matches the schema — is treated identically as "no session". Callers must
 * not be able to distinguish those cases, and none of them should produce a
 * different user-visible outcome than signing in again.
 */
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

/**
 * The current session, or `null`.
 *
 * This is the *only* source of authenticated identity in the application. A
 * `userId` that arrived in a form field, a query parameter, or a request body
 * is user-controlled input and must never be used to decide whose data to
 * read or write.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decryptSession(store.get(SESSION_COOKIE_NAME)?.value);
}

/**
 * The session, or an `unauthenticated` ApiError.
 *
 * Server Functions are reachable by direct POST, not only through the UI, so
 * every one of them must call this rather than assuming the proxy already
 * checked. The proxy is a redirect for humans, not an authorisation boundary.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    throw new ApiError("unauthenticated", {
      status: 401,
      message: "This operation requires a signed-in user.",
    });
  }

  return session;
}

/**
 * Writes the session cookie.
 *
 * Only callable from a Server Action or Route Handler — Next.js forbids
 * cookie writes during a Server Component render, and that restriction is
 * load-bearing here: a render that could rotate tokens would spend a
 * single-use refresh token it has no way to persist.
 */
export async function writeSession(payload: SessionPayload): Promise<void> {
  const store = await cookies();
  store.set(
    SESSION_COOKIE_NAME,
    await encryptSession(payload),
    sessionCookieOptions(isProduction()),
  );
}

/**
 * Clears the session cookie.
 *
 * Local only. Invalidating the backend session is a separate call the sign-out
 * action makes first — dropping the cookie without telling the backend leaves
 * a live refresh token in circulation.
 */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(isProduction()),
    maxAge: 0,
  });
}

/** Whether this deployment can establish sessions at all. */
export async function isAuthConfigured(): Promise<boolean> {
  return (await encryptionKey()) !== null;
}
