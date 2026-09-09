import { z } from "zod";

import { defaultLocale, isLocale, type Locale } from "@/i18n/routing";
import {
  ACCOUNT_ERROR_CODES,
  CONNECT_STATUSES,
  STALE_MERGE_ERROR_CODES,
  type AccountErrorCode,
  type AccountErrorKey,
  type ConnectStatus,
  type ConnectionProvider,
} from "@/lib/account/types";
import { isApiError } from "@/lib/api/errors";
import type { Me } from "@/lib/api/schemas";

export const CONNECT_START_PATHS: Record<"telegram" | "google", string> = {
  telegram: "/api/auth/connect/telegram/start",
  google: "/api/auth/connect/google/start",
};

export const REAUTHENTICATE_PATH = "/api/auth/connect/reauthenticate";

export const GOOGLE_CONNECT_CALLBACK_PATH = "/api/auth/connect/google/callback";

export function connectStartHref(
  provider: "telegram" | "google",
  locale: string,
): string {
  return `${CONNECT_START_PATHS[provider]}?${new URLSearchParams({ locale }).toString()}`;
}

export function connectLocale(
  hinted: string | undefined,
  preferred: string | undefined,
): Locale {
  if (isLocale(hinted)) return hinted;
  if (isLocale(preferred)) return preferred;
  return defaultLocale;
}

export function isConnectStatus(value: unknown): value is ConnectStatus {
  return (
    typeof value === "string" && (CONNECT_STATUSES as readonly string[]).includes(value)
  );
}

export function isAccountErrorCode(value: unknown): value is AccountErrorCode {
  return (
    typeof value === "string" &&
    (ACCOUNT_ERROR_CODES as readonly string[]).includes(value)
  );
}

export function isStaleMergeCode(value: unknown): boolean {
  return (
    typeof value === "string" &&
    (STALE_MERGE_ERROR_CODES as readonly string[]).includes(value)
  );
}

export function accountErrorKey(code: string | null | undefined): AccountErrorKey {
  if (isAccountErrorCode(code)) return code;
  if (code === "rateLimited") return "rateLimitExceeded";
  if (code === "network" || code === "timeout") return "network";
  return "unknown";
}

const RESTART_CODES = new Set([
  "invalidLoginState",
  "invalidGoogleState",
  "invalidGoogleCredential",
]);

const UNAVAILABLE_CODES = new Set([
  "accountLinkingUnavailable",
  "authRateLimitUnavailable",
  "telegramAuthUnavailable",
  "googleAuthUnavailable",
  "passwordAuthUnavailable",
  "telegramUnavailable",
  "googleUnavailable",
]);

export function connectStatusForProviderError(error: string): ConnectStatus {
  return error === "access_denied" ? "cancelled" : "unavailable";
}

export function connectStatusForError(error: unknown): ConnectStatus {
  if (!isApiError(error)) return "unavailable";

  const backendCode = error.backendCode;
  if (backendCode === "accountConnectionConflict") return "conflict";
  if (backendCode === "accountMergeAlreadyPending") return "alreadyPending";
  if (backendCode === "accountDisabled") return "disabled";
  if (backendCode === "phoneRequired") return "phoneRequired";
  if (backendCode === "rateLimitExceeded") return "tooMany";
  if (backendCode && UNAVAILABLE_CODES.has(backendCode)) return "unavailable";
  if (backendCode && RESTART_CODES.has(backendCode)) return "expired";

  if (error.code === "rateLimited") return "tooMany";
  if (error.code === "conflict") return "conflict";
  if (error.code === "unauthenticated" || error.code === "validation") return "expired";
  return "unavailable";
}

export type ConnectionState = {
  provider: ConnectionProvider;
  connected: boolean;
  detail: string | null;
  verified: boolean;
};

export function connectionStates(me: Me): readonly ConnectionState[] {
  const { telegram, google, password } = me.authMethods;
  const address = me.email ?? null;

  return [
    {
      provider: "telegram",
      connected: telegram,
      detail: me.telegramIdentity?.username ? `@${me.telegramIdentity.username}` : null,
      verified: false,
    },
    {
      provider: "google",
      connected: google,
      detail: google ? address : null,
      verified: false,
    },
    {
      provider: "password",
      connected: password,
      detail: password ? address : null,
      verified: password && me.emailVerified,
    },
  ];
}

export function isConnected(
  states: readonly ConnectionState[],
  provider: ConnectionProvider,
): boolean {
  return states.some((state) => state.provider === provider && state.connected);
}

export const mergeRequestFormSchema = z.object({
  requestId: z.string().min(1),
  locale: z.string().min(1),
});

export type MergeRequestFormValues = z.input<typeof mergeRequestFormSchema>;
