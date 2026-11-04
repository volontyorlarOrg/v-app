"use server";

import {
  failedResult,
  okResult,
  resultFromError,
  type ActionResult,
} from "@/lib/api/action-result";
import { submitReport } from "@/lib/api/reports.server";
import { reportInputSchema } from "@/lib/reports/schema";

export async function submitReportAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = reportInputSchema.safeParse({
    submissionId: formData.get("submissionId"),
    description: formData.get("description"),
    pagePath: formData.get("pagePath"),
  });
  if (!parsed.success) {
    const fields: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string") fields[field] = [issue.message];
    }
    return failedResult("validationFailed", fields);
  }
  try {
    await submitReport(parsed.data);
    return okResult;
  } catch (error) {
    return resultFromError(error);
  }
}
