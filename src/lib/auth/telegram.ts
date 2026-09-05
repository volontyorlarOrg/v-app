import { z } from "zod";

import { isApiError } from "@/lib/api/errors";

export const TELEGRAM_AUTHORIZATION_ORIGIN = "https://oauth.telegram.org";
export const AUTH_STATE_COOKIE_NAME = "volontyorlar_auth_state";

export const telegramAuthorizationSchema = z.object({
  authorizationUrl: z.url(),
  state: z.string().min(20).max(300),
  expiresAt: z.string().optional(),
});

export type TelegramAuthorization = z.infer<typeof telegramAuthorizationSchema>;

export const TELEGRAM_STATUSES = [
  "unavailable",
  "expired",
  "cancelled",
  "phoneRequired",
] as const;
export type TelegramStatus = (typeof TELEGRAM_STATUSES)[number];

export function isTelegramStatus(value: unknown): value is TelegramStatus {
  return (
    typeof value === "string" &&
    (TELEGRAM_STATUSES as readonly string[]).includes(value)
  );
}

export function isTrustedAuthorizationUrl(
  value: string,
  apiBase: string | null,
): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.origin === TELEGRAM_AUTHORIZATION_ORIGIN) return true;
  if (!apiBase) return false;

  try {
    return url.origin === new URL(apiBase).origin;
  } catch {
    return false;
  }
}

export function telegramStatusForProviderError(error: string): TelegramStatus {
  return error === "access_denied" ? "cancelled" : "unavailable";
}

export function telegramStatusForError(error: unknown): TelegramStatus {
  if (!isApiError(error)) return "unavailable";
  if (error.code === "forbidden" && error.backendCode === "phoneRequired") {
    return "phoneRequired";
  }
  if (error.code === "unauthenticated" || error.code === "validation") {
    return "expired";
  }
  return "unavailable";
}
