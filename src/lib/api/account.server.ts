import "server-only";

import { cache } from "react";

import { authed } from "@/lib/api/session.server";
import { meSchema, preferencesSchema, type Preferences } from "@/lib/api/schemas";

export const getMe = cache(function getMe() {
  return authed("/me", { schema: meSchema });
});

export const getPreferences = cache(function getPreferences() {
  return authed("/me/preferences", { schema: preferencesSchema });
});

export function updatePreferences(input: Partial<Preferences>) {
  return authed("/me/preferences", {
    method: "PUT",
    body: input,
    schema: preferencesSchema,
  });
}
