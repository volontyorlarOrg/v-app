"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authedActionClient } from "@/lib/safe-action";
import { draftAnswersSchema } from "./schemas";
import {
  saveApplicationDraft,
  startApplication,
  submitApplication,
  withdrawApplication,
} from "./api.server";

/**
 * Application mutations.
 *
 * Every one of these runs through `authedActionClient`, so the session is
 * resolved server-side before the body executes and is available as
 * `ctx.session`. Note what none of them accept: a `userId`. Ownership comes
 * from the token, and the backend re-checks it — a Server Action is reachable
 * by direct POST, so nothing here may assume the UI was the caller.
 */

const applicationIdSchema = z.object({ applicationId: z.string().min(1) });

export const startApplicationAction = authedActionClient
  .inputSchema(z.object({ opportunityId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const application = await startApplication(parsedInput.opportunityId);
    revalidatePath("/applications");
    return { applicationId: application.id, status: application.status };
  });

/**
 * Autosave. Returns the save time so the field can show "Saved 14:32" rather
 * than a spinner that never resolves into anything the user can trust.
 *
 * No `revalidatePath` — a draft save happens every few seconds while typing,
 * and re-rendering the route each time would fight the editor for focus.
 */
export const saveDraftAction = authedActionClient
  .inputSchema(
    z.object({
      applicationId: z.string().min(1),
      answers: draftAnswersSchema,
    }),
  )
  .action(async ({ parsedInput }) => {
    await saveApplicationDraft(parsedInput.applicationId, parsedInput.answers);
    return { savedAt: new Date().toISOString() };
  });

export const submitApplicationAction = authedActionClient
  .inputSchema(
    z.object({
      applicationId: z.string().min(1),
      answers: draftAnswersSchema,
    }),
  )
  .action(async ({ parsedInput }) => {
    const application = await submitApplication(
      parsedInput.applicationId,
      parsedInput.answers,
    );

    // Submission changes both the list and this application's own page.
    revalidatePath("/applications");
    revalidatePath(`/applications/${application.id}`);

    return { status: application.status, submittedAt: application.submittedAt };
  });

export const withdrawApplicationAction = authedActionClient
  .inputSchema(applicationIdSchema)
  .action(async ({ parsedInput }) => {
    const application = await withdrawApplication(parsedInput.applicationId);

    revalidatePath("/applications");
    revalidatePath(`/applications/${application.id}`);

    return { status: application.status };
  });
