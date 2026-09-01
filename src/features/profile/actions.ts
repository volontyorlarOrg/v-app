"use server";

import { revalidatePath } from "next/cache";
import { authedActionClient } from "@/lib/safe-action";
import { profileSchema } from "./schemas";
import { saveMyProfile } from "./api.server";

/**
 * Saves the volunteer's profile.
 *
 * The input schema is the same one the form validates against, so the server
 * cannot accept something the client would have rejected — and, more
 * importantly, cannot be talked into accepting it by a direct POST that skips
 * the form entirely.
 */
export const saveProfileAction = authedActionClient
  .inputSchema(profileSchema)
  .action(async ({ parsedInput }) => {
    const profile = await saveMyProfile(parsedInput);

    // The profile feeds the dashboard's completion meter and the application
    // form's prefilled block, so the whole authenticated tree is refreshed.
    revalidatePath("/", "layout");

    return { savedAt: profile.updatedAt ?? new Date().toISOString() };
  });
