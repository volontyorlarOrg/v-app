"use server";

import { revalidatePath } from "next/cache";
import { authedActionClient } from "@/lib/safe-action";
import { profileSchema } from "./schemas";
import { saveMyProfile } from "./api.server";

export const saveProfileAction = authedActionClient
  .inputSchema(profileSchema)
  .action(async ({ parsedInput }) => {
    const profile = await saveMyProfile(parsedInput);

    revalidatePath("/", "layout");

    return { savedAt: profile.updatedAt ?? new Date().toISOString() };
  });
