"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authedActionClient } from "@/lib/safe-action";
import { addSavedOpportunity, removeSavedOpportunity } from "./api.server";

/**
 * Save / unsave an opportunity.
 *
 * One action with a boolean rather than two, so the toggle cannot get into a
 * state where a rapid double-tap fires an add and a remove that resolve out of
 * order — the last call always states the intended end state.
 */
export const toggleSavedAction = authedActionClient
  .inputSchema(
    z.object({ opportunityId: z.string().min(1), saved: z.boolean() }),
  )
  .action(async ({ parsedInput }) => {
    if (parsedInput.saved) {
      await addSavedOpportunity(parsedInput.opportunityId);
    } else {
      await removeSavedOpportunity(parsedInput.opportunityId);
    }

    revalidatePath("/saved");
    return { saved: parsedInput.saved };
  });
