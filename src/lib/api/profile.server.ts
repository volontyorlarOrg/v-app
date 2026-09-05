import "server-only";

import { cache } from "react";

import { authed, isMissing } from "@/lib/api/session.server";
import { profileSchema, type Profile } from "@/lib/api/schemas";
import type { ProfileInput } from "@/lib/profile/input";

export const getProfile = cache(async function getProfile(): Promise<Profile | null> {
  try {
    return await authed("/profile", { schema: profileSchema });
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
});

export function updateProfile(input: ProfileInput) {
  return authed("/profile", { method: "PUT", body: input, schema: profileSchema });
}
