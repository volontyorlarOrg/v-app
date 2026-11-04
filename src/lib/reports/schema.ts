import { z } from "zod";

export const REPORT_DESCRIPTION_MAX = 5_000;

export function isReportPagePath(value: string): boolean {
  if (value.length > 2_048) return false;
  try {
    const decoded = decodeURIComponent(value);
    return (
      decoded.startsWith("/") &&
      !decoded.startsWith("//") &&
      !/[\\?#\s]/u.test(decoded) &&
      ![...decoded].some(
        (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
      ) &&
      !/%[a-f0-9]{2}/i.test(decoded)
    );
  } catch {
    return false;
  }
}

export const reportFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "reportDescriptionRequired")
    .max(REPORT_DESCRIPTION_MAX, "reportDescriptionTooLong")
    .refine((value) => !value.includes("\u0000"), "reportDescriptionInvalid"),
});

export const reportInputSchema = reportFormSchema.extend({
  submissionId: z.uuid(),
  pagePath: z.string().refine(isReportPagePath, "reportPageInvalid"),
});

export const reportReceiptSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
});
