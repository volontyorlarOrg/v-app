import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { refreshSession } from "@/lib/auth/refresh";
import {
  SESSION_COOKIE_NAME,
  decryptSession,
  encryptSession,
  isAccessTokenExpiring,
  sessionCookieOptions,
  type SessionPayload,
} from "@/lib/auth/session";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decryptSession(store.get(SESSION_COOKIE_NAME)?.value);
}

export async function writeSession(payload: SessionPayload): Promise<boolean> {
  const value = await encryptSession(payload);
  if (!value) return false;

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, value, sessionCookieOptions());
  return true;
}

export async function canWriteSession(): Promise<boolean> {
  try {
    const store = await cookies();
    const current = store.get(SESSION_COOKIE_NAME);
    if (!current) return false;
    store.set(SESSION_COOKIE_NAME, current.value, sessionCookieOptions());
    return true;
  } catch {
    return false;
  }
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", { ...sessionCookieOptions(), maxAge: 0 });
}

export async function rotatedSession(
  session: SessionPayload,
): Promise<SessionPayload | null> {
  if (!session.refreshToken) return null;
  if (!isAccessTokenExpiring(session)) return null;
  return refreshSession(session.refreshToken);
}

export async function applyRotation<TResponse extends NextResponse>(
  response: TResponse,
  rotated: SessionPayload | null,
): Promise<TResponse> {
  if (!rotated) return response;

  const value = await encryptSession(rotated);
  if (value) response.cookies.set(SESSION_COOKIE_NAME, value, sessionCookieOptions());
  return response;
}
