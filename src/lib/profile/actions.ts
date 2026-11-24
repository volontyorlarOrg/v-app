"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  failedResult,
  okResult,
  resultFromError,
  type ActionResult,
} from "@/lib/api/action-result";
import {
  updateProfile,
  updateProfilePlace,
  updateProfileVisibility,
} from "@/lib/api/profile.server";
import {
  placeIssues,
  placeSubmissionFromFormData,
  profileInputFromFormData,
} from "@/lib/profile/input";
import {
  OPTIONAL_PROFILE_PARTS,
  type ProfileVisibilityInput,
} from "@/lib/profile/visibility";

const visibilitySchema = z.object({
  hiddenFields: z
    .array(z.enum(OPTIONAL_PROFILE_PARTS))
    .max(OPTIONAL_PROFILE_PARTS.length),
  confirmContactPublication: z.boolean(),
});

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

export async function confirmPlaceAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const input = placeSubmissionFromFormData(formData);
  const issues = placeIssues({
    region: input.region ?? "",
    districtId: input.districtId ?? "",
    educationType: input.educationType ?? "",
    institutionId: input.institutionId ?? "",
    gradeYear: input.gradeYear,
  });
  if (issues.length > 0) {
    return failedResult(
      "validationFailed",
      Object.fromEntries(issues.map((issue) => [issue.path, [issue.message]])),
    );
  }

  try {
    await updateProfilePlace(input);
  } catch (error) {
    return resultFromError(error);
  }

  return okResult;
}

export async function updateProfileVisibilityAction(
  input: ProfileVisibilityInput,
): Promise<ActionResult> {
  const parsed = visibilitySchema.safeParse(input);
  if (!parsed.success) return failedResult("validationFailed");

  try {
    await updateProfileVisibility(parsed.data);
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return okResult;
}
