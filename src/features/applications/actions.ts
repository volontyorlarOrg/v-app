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

const applicationIdSchema = z.object({ applicationId: z.string().min(1) });

export const startApplicationAction = authedActionClient
  .inputSchema(z.object({ opportunityId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const application = await startApplication(parsedInput.opportunityId);
    revalidatePath("/applications");
    return { applicationId: application.id, status: application.status };
  });

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
