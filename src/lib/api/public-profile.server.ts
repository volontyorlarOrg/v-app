import "server-only";

import { cache } from "react";

import { publicProfileSchema, type PublicProfile } from "@/lib/api/schemas";
import { authed, isMissing } from "@/lib/api/session.server";

export const getPublicProfile = cache(async function getPublicProfile(
  username: string,
): Promise<PublicProfile | null> {
  try {
    return await authed(`/public/profiles/${encodeURIComponent(username)}`, {
      schema: publicProfileSchema,
    });
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
});
