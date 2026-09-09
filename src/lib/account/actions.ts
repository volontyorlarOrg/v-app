"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { defaultLocale, isLocale, type Locale } from "@/i18n/routing";
import { isStaleMergeCode } from "@/lib/account/connections";
import { PREFERENCE_KEYS, type PreferenceKey } from "@/lib/account/types";
import {
  failedResult,
  okResult,
  resultFromError,
  type ActionResult,
} from "@/lib/api/action-result";
import {
  approveMergeRequest,
  cancelMergeRequest,
  rejectMergeRequest,
  updatePreferences,
  verifyPasswordConnection,
} from "@/lib/api/account.server";
import {
  credentialsFromFormData,
  fieldErrorsOf,
  logInSchema,
} from "@/lib/auth/credentials";
import { toSessionPayload } from "@/lib/auth/session";
import { writeSession } from "@/lib/auth/session.server";
import { localePath } from "@/lib/routing/routes";

function localeOf(formData: FormData): Locale {
  const requested = formData.get("locale");
  return isLocale(requested) ? requested : defaultLocale;
}

function requestIdOf(formData: FormData): string {
  const value = formData.get("requestId");
  return typeof value === "string" ? value.trim() : "";
}

function revalidateAccount(locale: Locale) {
  revalidatePath(localePath(locale, "settings"));
  revalidatePath("/", "layout");
}

function resultForMergeFailure(error: unknown, locale: Locale): ActionResult {
  unstable_rethrow(error);

  const result = resultFromError(error);
  if (result.status === "error" && isStaleMergeCode(result.code)) {
    revalidateAccount(locale);
  }
  return result;
}

export async function updatePreferenceAction(
  key: PreferenceKey,
  value: boolean,
): Promise<ActionResult> {
  if (!PREFERENCE_KEYS.includes(key)) return resultFromError(null);

  try {
    await updatePreferences({ [key]: value });
  } catch (error) {
    unstable_rethrow(error);
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return okResult;
}

export async function connectPasswordAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const locale = localeOf(formData);
  const parsed = logInSchema.safeParse(credentialsFromFormData(formData));

  if (!parsed.success) {
    return failedResult("validationFailed", fieldErrorsOf(parsed.error));
  }

  try {
    await verifyPasswordConnection(parsed.data);
  } catch (error) {
    unstable_rethrow(error);
    return resultFromError(error);
  }

  revalidateAccount(locale);
  return okResult;
}

export async function approveMergeRequestAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const locale = localeOf(formData);
  const requestId = requestIdOf(formData);
  if (!requestId) return failedResult("accountMergeRequestNotFound");

  try {
    const approval = await approveMergeRequest(requestId);
    if (!(await writeSession(toSessionPayload(approval.session)))) {
      return failedResult("accountLinkingUnavailable");
    }
  } catch (error) {
    return resultForMergeFailure(error, locale);
  }

  revalidateAccount(locale);
  redirect(localePath(locale, "settings"));
}

export async function rejectMergeRequestAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const locale = localeOf(formData);
  const requestId = requestIdOf(formData);
  if (!requestId) return failedResult("accountMergeRequestNotFound");

  try {
    await rejectMergeRequest(requestId);
  } catch (error) {
    return resultForMergeFailure(error, locale);
  }

  revalidateAccount(locale);
  return okResult;
}

export async function cancelMergeRequestAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const locale = localeOf(formData);
  const requestId = requestIdOf(formData);
  if (!requestId) return failedResult("accountMergeRequestNotFound");

  try {
    await cancelMergeRequest(requestId);
  } catch (error) {
    return resultForMergeFailure(error, locale);
  }

  revalidateAccount(locale);
  return okResult;
}
