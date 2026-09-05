"use server";

import { revalidatePath } from "next/cache";

import { okResult, resultFromError, type ActionResult } from "@/lib/api/action-result";
import {
  saveApplicationDraft,
  submitApplication,
  withdrawApplication,
} from "@/lib/api/applications.server";
import { answersFromFormData } from "@/lib/applications/answers";

function applicationIdOf(formData: FormData): string {
  return String(formData.get("applicationId") ?? "");
}

export async function saveDraftAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await saveApplicationDraft(applicationIdOf(formData), answersFromFormData(formData));
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return okResult;
}

export async function submitApplicationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await submitApplication(applicationIdOf(formData), answersFromFormData(formData));
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return okResult;
}

export async function withdrawApplicationAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await withdrawApplication(applicationIdOf(formData));
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return okResult;
}
