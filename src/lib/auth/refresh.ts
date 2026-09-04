import { apiBaseUrl } from "@/lib/auth/config";
import {
  issuedSessionSchema,
  toSessionPayload,
  type SessionPayload,
} from "@/lib/auth/session";

const REFRESH_TIMEOUT_MS = 8_000;

export async function refreshSession(
  refreshToken: string,
): Promise<SessionPayload | null> {
  const baseUrl = apiBaseUrl();
  if (!baseUrl) return null;

  try {
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const parsed = issuedSessionSchema.safeParse(await response.json());
    return parsed.success ? toSessionPayload(parsed.data) : null;
  } catch {
    return null;
  }
}
