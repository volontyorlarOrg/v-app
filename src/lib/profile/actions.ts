"use server";

import { revalidatePath } from "next/cache";

import { okResult, resultFromError, type ActionResult } from "@/lib/api/action-result";
import { updateProfile } from "@/lib/api/profile.server";
import { profileInputFromFormData } from "@/lib/profile/input";

export async function updateProfileAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await updateProfile(profileInputFromFormData(formData));
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return okResult;
}
