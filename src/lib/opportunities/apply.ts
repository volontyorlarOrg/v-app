import { z } from "zod";

export const applyFormSchema = z.object({
  opportunityId: z.string().min(1, "required"),
});

export type ApplyFormValues = z.input<typeof applyFormSchema>;
