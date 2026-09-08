"use server";

import { revalidatePath } from "next/cache";

import { okResult, resultFromError, type ActionResult } from "@/lib/api/action-result";
import { updatePreferences } from "@/lib/api/account.server";
import {
  PREFERENCE_KEYS,
  type PreferenceKey,
  type Preferences,
} from "@/lib/account/types";

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

export async function updatePreferencesAction(
  input: Partial<Preferences>,
): Promise<ActionResult> {
  const entries = Object.entries(input).filter(
    (entry): entry is [PreferenceKey, boolean] =>
      (PREFERENCE_KEYS as readonly string[]).includes(entry[0]) &&
      typeof entry[1] === "boolean",
  );
  if (entries.length === 0) return resultFromError(null);

  try {
    await updatePreferences(Object.fromEntries(entries));
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return okResult;
}
