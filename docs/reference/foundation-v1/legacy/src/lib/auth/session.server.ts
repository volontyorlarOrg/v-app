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

let cachedKey: Uint8Array | null = null;

async function encryptionKey(): Promise<Uint8Array | null> {
  if (cachedKey) return cachedKey;

  const secret = sessionSecret();
  if (!secret) return null;

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

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decryptSession(store.get(SESSION_COOKIE_NAME)?.value);
}

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

export async function writeSession(payload: SessionPayload): Promise<void> {
  const store = await cookies();
  store.set(
    SESSION_COOKIE_NAME,
    await encryptSession(payload),
    sessionCookieOptions(isProduction()),
  );
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(isProduction()),
    maxAge: 0,
  });
}

export async function isAuthConfigured(): Promise<boolean> {
  return (await encryptionKey()) !== null;
}
