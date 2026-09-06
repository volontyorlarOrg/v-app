import { z } from "zod";

import { isApiError } from "@/lib/api/errors";
import { hasVerifiedSiteOrigin, siteOrigin } from "@/lib/seo/origin";

export const GOOGLE_AUTHORIZATION_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";
export const GOOGLE_SCOPES = "openid email profile";
export const GOOGLE_STATE_COOKIE_NAME = "volontyorlar_google_state";

export const googleChallengeSchema = z.object({
  state: z.string().min(20).max(300),
  nonce: z.string().min(16).max(300),
  expiresAt: z.string().optional(),
});

export type GoogleChallenge = z.infer<typeof googleChallengeSchema>;

export const GOOGLE_STATUSES = [
  "unavailable",
  "expired",
  "cancelled",
  "disabled",
  "tooMany",
  "conflict",
] as const;

const RESTART_CODES = new Set(["invalidGoogleState", "invalidGoogleCredential"]);
const CONFLICT_CODES = new Set([
  "emailUnavailable",
  "googleIdentityConflict",
  "googleEmailLinkRequiresVerification",
]);
export type GoogleStatus = (typeof GOOGLE_STATUSES)[number];

export function isGoogleStatus(value: unknown): value is GoogleStatus {
  return (
    typeof value === "string" && (GOOGLE_STATUSES as readonly string[]).includes(value)
  );
}

export function googleRedirectUri(requestOrigin: string): string {
  const origin = hasVerifiedSiteOrigin() ? siteOrigin() : requestOrigin;
  return `${origin}${GOOGLE_CALLBACK_PATH}`;
}

export function googleAuthorizationUrl({
  clientId,
  redirectUri,
  state,
  nonce,
  locale,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  locale: string;
}): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "id_token",
    response_mode: "form_post",
    scope: GOOGLE_SCOPES,
    state,
    nonce,
    prompt: "select_account",
    hl: locale,
  });

  return `${GOOGLE_AUTHORIZATION_ENDPOINT}?${params.toString()}`;
}

export function googleStatusForProviderError(error: string): GoogleStatus {
  return error === "access_denied" ? "cancelled" : "unavailable";
}

export function googleStatusForError(error: unknown): GoogleStatus {
  if (!isApiError(error)) return "unavailable";
  const backendCode = error.backendCode;
  if (backendCode === "accountDisabled") return "disabled";
  if (backendCode && CONFLICT_CODES.has(backendCode)) return "conflict";
  if (error.code === "rateLimited") return "tooMany";
  if (backendCode && RESTART_CODES.has(backendCode)) return "expired";
  if (error.code === "unauthenticated" || error.code === "validation") return "expired";
  return "unavailable";
}
