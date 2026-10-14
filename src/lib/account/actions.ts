"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isStaleMergeCode } from "@/lib/account/connections";
import { usernameFormSchema, usernameFromFormData } from "@/lib/account/username";
import {
  failedResult,
  okResult,
  resultFromError,
  type ActionResult,
} from "@/lib/api/action-result";
import {
  approveMergeRequest,
  cancelMergeRequest,
  removeAvatar,
  rejectMergeRequest,
  updatePassword,
  updatePublicProfilePreference,
  updateUsername,
  uploadAvatar,
} from "@/lib/api/account.server";
import {
  fieldErrorsOf,
  passwordManagementFromFormData,
  passwordManagementSchema,
} from "@/lib/auth/credentials";
import { toSessionPayload } from "@/lib/auth/session";
import { writeSession } from "@/lib/auth/session.server";
import { navHref } from "@/lib/routing/routes";

function requestIdOf(formData: FormData): string {
  const value = formData.get("requestId");
  return typeof value === "string" ? value.trim() : "";
}

function revalidateAccount() {
  revalidatePath("/", "layout");
}

function resultForMergeFailure(error: unknown): ActionResult {
  const result = resultFromError(error);
  if (result.status === "error" && isStaleMergeCode(result.code)) {
    revalidateAccount();
  }
  return result;
}

export async function updateUsernameAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = usernameFormSchema.safeParse(usernameFromFormData(formData));

  if (!parsed.success) {
    return failedResult("validationFailed", fieldErrorsOf(parsed.error));
  }

  try {
    await updateUsername(parsed.data.username);
  } catch (error) {
    return resultFromError(error);
  }

  revalidateAccount();
  return okResult;
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult> {
  const avatar = formData.get("avatar");
  if (!(avatar instanceof File) || avatar.size === 0) {
    return failedResult("avatarInvalid");
  }

  try {
    await uploadAvatar(avatar);
  } catch (error) {
    return resultFromError(error);
  }
  revalidatePath("/", "layout");
  return okResult;
}

export async function removeAvatarAction(): Promise<ActionResult> {
  try {
    await removeAvatar();
  } catch (error) {
    return resultFromError(error);
  }
  revalidatePath("/", "layout");
  return okResult;
}

export async function setPublicProfileAction(enabled: boolean): Promise<ActionResult> {
  try {
    await updatePublicProfilePreference(enabled);
  } catch (error) {
    return resultFromError(error);
  }
  revalidatePath("/", "layout");
  return okResult;
}

export async function managePasswordAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = passwordManagementSchema.safeParse(
    passwordManagementFromFormData(formData),
  );

  if (!parsed.success) {
    return failedResult("validationFailed", fieldErrorsOf(parsed.error));
  }

  try {
    const issued = await updatePassword({
      email: parsed.data.email,
      newPassword: parsed.data.newPassword,
      ...(parsed.data.currentPassword
        ? { currentPassword: parsed.data.currentPassword }
        : {}),
    });
    if (!(await writeSession(toSessionPayload(issued)))) {
      return failedResult("passwordAuthUnavailable");
    }
  } catch (error) {
    return resultFromError(error);
  }

  revalidateAccount();
  redirect(
    `${navHref("settings")}?password=${parsed.data.mode === "change" ? "changed" : "set"}`,
  );
}

export async function approveMergeRequestAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const requestId = requestIdOf(formData);
  if (!requestId) return failedResult("accountMergeRequestNotFound");

  try {
    const approval = await approveMergeRequest(requestId);
    if (!(await writeSession(toSessionPayload(approval.session)))) {
      return failedResult("accountLinkingUnavailable");
    }
  } catch (error) {
    return resultForMergeFailure(error);
  }

  revalidateAccount();
  redirect(navHref("settings"));
}

export async function rejectMergeRequestAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const requestId = requestIdOf(formData);
  if (!requestId) return failedResult("accountMergeRequestNotFound");

  try {
    await rejectMergeRequest(requestId);
  } catch (error) {
    return resultForMergeFailure(error);
  }

  revalidateAccount();
  return okResult;
}

export async function cancelMergeRequestAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const requestId = requestIdOf(formData);
  if (!requestId) return failedResult("accountMergeRequestNotFound");

  try {
    await cancelMergeRequest(requestId);
  } catch (error) {
    return resultForMergeFailure(error);
  }

  revalidateAccount();
  return okResult;
}
