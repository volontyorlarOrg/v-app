import { z } from "zod";

export const withdrawFormSchema = z.object({
  applicationId: z.string().min(1, "required"),
});

export type WithdrawFormValues = z.input<typeof withdrawFormSchema>;
