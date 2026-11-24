import "server-only";

import { cache } from "react";

import { authed, isMissing } from "@/lib/api/session.server";
import { profileSchema, type Profile } from "@/lib/api/schemas";
import type { PlaceInput, ProfileInput } from "@/lib/profile/input";
import type { ProfileVisibilityInput } from "@/lib/profile/visibility";

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

export function updateProfileVisibility(input: ProfileVisibilityInput) {
  return authed("/profile/visibility", {
    method: "PUT",
    body: input,
    schema: profileSchema,
  });
}

export function updateProfilePlace(input: PlaceInput & { region: string | null }) {
  return authed("/profile/place", {
    method: "PUT",
    body: input,
    schema: profileSchema,
  });
}
