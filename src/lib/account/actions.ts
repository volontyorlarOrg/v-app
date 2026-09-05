"use server";

import { revalidatePath } from "next/cache";

import { okResult, resultFromError, type ActionResult } from "@/lib/api/action-result";
import { updatePreferences } from "@/lib/api/account.server";
import { PREFERENCE_KEYS, type PreferenceKey } from "@/lib/account/types";

export async function updatePreferenceAction(
  key: PreferenceKey,
  value: boolean,
): Promise<ActionResult> {
  if (!PREFERENCE_KEYS.includes(key)) return resultFromError(null);

  try {
    await updatePreferences({ [key]: value });
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return okResult;
}
