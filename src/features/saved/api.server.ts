import "server-only";

import { z } from "zod";
import { authedApi } from "@/lib/api/client.server";
import { requireSession } from "@/lib/auth/session.server";
import { opportunitySummarySchema } from "@/features/opportunities/schemas";

/** Saved (bookmarked) opportunities for the signed-in volunteer. */

const savedListSchema = z.object({
  items: z.array(opportunitySummarySchema),
});

export async function listSavedOpportunities() {
  const session = await requireSession();

  return authedApi("/saved", session.accessToken, { schema: savedListSchema });
}

export async function addSavedOpportunity(opportunityId: string) {
  const session = await requireSession();

  await authedApi("/saved", session.accessToken, {
    method: "POST",
    body: { opportunityId },
  });
}

export async function removeSavedOpportunity(opportunityId: string) {
  const session = await requireSession();

  await authedApi(`/saved/${encodeURIComponent(opportunityId)}`, session.accessToken, {
    method: "DELETE",
  });
}
