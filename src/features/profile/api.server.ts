import "server-only";

import { authedApi } from "@/lib/api/client.server";
import { ApiError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/session.server";
import {
  EMPTY_PROFILE,
  profileSchemaResponse,
  type Profile,
  type ProfileInput,
} from "./schemas";

/**
 * Volunteer profile reads and writes.
 *
 * No `userId` parameter anywhere: the profile is always the session's own.
 * Reading someone else's is not a capability this layer offers, so it cannot
 * be reached by passing the wrong id.
 */

/**
 * The signed-in volunteer's profile.
 *
 * A 404 means "not created yet", which is the normal state right after
 * sign-up — it returns an empty profile rather than an error, so onboarding is
 * just the edit form with nothing in it.
 */
export async function getMyProfile(): Promise<Profile> {
  const session = await requireSession();

  try {
    return await authedApi("/profile", session.accessToken, {
      schema: profileSchemaResponse,
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === "notFound") {
      return { ...EMPTY_PROFILE, phoneVerified: false };
    }
    throw error;
  }
}

export async function saveMyProfile(input: ProfileInput): Promise<Profile> {
  const session = await requireSession();

  return authedApi("/profile", session.accessToken, {
    method: "PUT",
    body: input,
    schema: profileSchemaResponse,
  });
}
