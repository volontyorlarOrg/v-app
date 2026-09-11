import { z } from "zod";

export const confirmSubmissionSchema = z.object({
  applicationId: z.string().min(1, "required"),
  confirmed: z.boolean().refine((value) => value, "confirmRequired"),
});

export type ConfirmSubmissionValues = z.input<typeof confirmSubmissionSchema>;
