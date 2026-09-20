import "server-only";

import { cache } from "react";

import { api, apiMultipart, authedApi } from "@/lib/api/client.server";
import { isApiError } from "@/lib/api/errors";
import { authed, requireSession } from "@/lib/api/session.server";
import {
  avatarResultSchema,
  connectionOutcomeSchema,
  meSchema,
  mergeApprovalSchema,
  mergeRequestListSchema,
  mergeRequestSchema,
  mergeResolutionSchema,
  publicProfilePreferenceSchema,
  usernameSummarySchema,
  type ConnectionOutcome,
  type MergeApproval,
  type MergeRequest,
  type MergeRequestList,
} from "@/lib/api/schemas";
import { AUTH_REQUEST_TIMEOUT_MS } from "@/lib/auth/config";
import { googleChallengeSchema, type GoogleChallenge } from "@/lib/auth/google";
import { issuedSessionSchema, type IssuedSession } from "@/lib/auth/session";
import {
  telegramAuthorizationSchema,
  type TelegramAuthorization,
} from "@/lib/auth/telegram";

const CONNECTIONS_PATH = "/me/account-connections";
const USERNAME_PATH = "/me/username";
const MERGE_REQUESTS_PATH = "/me/account-merge-requests";

export const getMe = cache(function getMe() {
  return authed("/me", { schema: meSchema });
});

export function authorizeTelegramConnection(
  accessToken: string,
  locale: string,
): Promise<TelegramAuthorization> {
  return authedApi(`${CONNECTIONS_PATH}/telegram/authorize`, accessToken, {
    method: "POST",
    body: { locale },
    schema: telegramAuthorizationSchema,
    cache: "no-store",
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
  });
}

export function completeTelegramConnection(
  accessToken: string,
  input: { state: string; code: string },
): Promise<ConnectionOutcome> {
  return authedApi(`${CONNECTIONS_PATH}/telegram/complete`, accessToken, {
    method: "POST",
    body: input,
    schema: connectionOutcomeSchema,
    cache: "no-store",
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
  });
}

export function challengeGoogleConnection(
  accessToken: string,
): Promise<GoogleChallenge> {
  return authedApi(`${CONNECTIONS_PATH}/google/challenge`, accessToken, {
    method: "POST",
    body: {},
    schema: googleChallengeSchema,
    cache: "no-store",
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
  });
}

export function completeGoogleConnection(
  accessToken: string,
  input: { state: string; credential: string },
): Promise<ConnectionOutcome> {
  return authedApi(`${CONNECTIONS_PATH}/google/complete`, accessToken, {
    method: "POST",
    body: input,
    schema: connectionOutcomeSchema,
    cache: "no-store",
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
  });
}

export function updateUsername(username: string) {
  return authed(USERNAME_PATH, {
    method: "PUT",
    body: { username },
    schema: usernameSummarySchema,
  });
}

export async function uploadAvatar(file: File) {
  const session = await requireSession();
  const body = new FormData();
  body.set("avatar", file);
  return apiMultipart("/me/avatar", session.accessToken, body, avatarResultSchema);
}

export function removeAvatar() {
  return authed("/me/avatar", { method: "DELETE", schema: avatarResultSchema });
}

export function updatePublicProfilePreference(publicProfileEnabled: boolean) {
  return authed("/me/preferences", {
    method: "PUT",
    body: { publicProfileEnabled },
    schema: publicProfilePreferenceSchema,
  });
}

export function updatePassword(input: {
  email: string;
  currentPassword?: string;
  newPassword: string;
}): Promise<IssuedSession> {
  return authed("/auth/password/change", {
    method: "POST",
    body: input,
    schema: issuedSessionSchema,
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
  });
}

export const listMergeRequests = cache(
  async function listMergeRequests(): Promise<MergeRequestList> {
    try {
      return await authed(MERGE_REQUESTS_PATH, { schema: mergeRequestListSchema });
    } catch (error) {
      if (isApiError(error) && error.code === "notFound")
        return { incoming: [], outgoing: [] };
      throw error;
    }
  },
);

export function getMergeRequest(id: string): Promise<MergeRequest> {
  return authed(`${MERGE_REQUESTS_PATH}/${encodeURIComponent(id)}`, {
    schema: mergeRequestSchema,
  });
}

export function approveMergeRequest(id: string): Promise<MergeApproval> {
  return authed(`${MERGE_REQUESTS_PATH}/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    schema: mergeApprovalSchema,
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
  });
}

export function rejectMergeRequest(id: string) {
  return authed(`${MERGE_REQUESTS_PATH}/${encodeURIComponent(id)}/reject`, {
    method: "POST",
    schema: mergeResolutionSchema,
  });
}

export function cancelMergeRequest(id: string) {
  return authed(`${MERGE_REQUESTS_PATH}/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    schema: mergeResolutionSchema,
  });
}

export function endBackendSession(accessToken: string) {
  return api("/auth/logout", {
    method: "POST",
    accessToken,
    cache: "no-store",
    timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
  });
}
