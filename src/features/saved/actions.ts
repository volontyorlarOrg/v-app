"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authedActionClient } from "@/lib/safe-action";
import { addSavedOpportunity, removeSavedOpportunity } from "./api.server";

export const toggleSavedAction = authedActionClient
  .inputSchema(z.object({ opportunityId: z.string().min(1), saved: z.boolean() }))
  .action(async ({ parsedInput }) => {
    if (parsedInput.saved) {
      await addSavedOpportunity(parsedInput.opportunityId);
    } else {
      await removeSavedOpportunity(parsedInput.opportunityId);
    }

    revalidatePath("/saved");
    return { saved: parsedInput.saved };
  });
