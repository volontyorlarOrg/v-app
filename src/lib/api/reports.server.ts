import "server-only";

import type { z } from "zod";
import { authed } from "@/lib/api/session.server";
import { reportInputSchema, reportReceiptSchema } from "@/lib/reports/schema";

export function submitReport(input: z.infer<typeof reportInputSchema>) {
  return authed("/reports", {
    method: "POST",
    body: input,
    schema: reportReceiptSchema,
  });
}
