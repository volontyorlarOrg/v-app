import { describe, expect, it } from "vitest";
import {
  isReportPagePath,
  reportFormSchema,
  reportInputSchema,
} from "@/lib/reports/schema";

describe("report input", () => {
  it("rejects null characters that PostgreSQL cannot store", () => {
    expect(
      reportFormSchema.safeParse({ description: "Problem\u0000text" }).success,
    ).toBe(false);
  });
  it("accepts only the problem and automatically attached context", () => {
    const parsed = reportInputSchema.parse({
      description: "  The button did not work.  ",
      pagePath: "/profile/edit",
      submissionId: "00000000-0000-4000-8000-000000000001",
      userId: "spoofed",
    });
    expect(parsed.description).toBe("The button did not work.");
    expect(parsed).not.toHaveProperty("userId");
  });
  it.each(["", "  ", "a".repeat(5001)])(
    "rejects empty or excessive descriptions",
    (description) => {
      expect(reportFormSchema.safeParse({ description }).success).toBe(false);
    },
  );
  it.each(["/dashboard", "/opportunities/book-drive", "/profiles/%D0%B8%D0%BC%D1%8F"])(
    "accepts a relative pathname: %s",
    (path) => expect(isReportPagePath(path)).toBe(true),
  );
  it.each([
    "https://evil.example",
    "//evil.example",
    "/%2fevil.example",
    "/%5cevil.example",
    "/%252fevil.example",
    "/settings?token=private",
    "/settings#secret",
    "/%00",
    "/%",
    "/" + "x".repeat(2048),
  ])("rejects external paths and private URL data: %s", (path) =>
    expect(isReportPagePath(path)).toBe(false),
  );
});
