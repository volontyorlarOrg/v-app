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
