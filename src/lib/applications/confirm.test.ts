import { describe, expect, it } from "vitest";

import { confirmSubmissionSchema } from "@/lib/applications/confirm";

describe("confirmSubmissionSchema", () => {
  it("sends nothing until the volunteer has confirmed", () => {
    const result = confirmSubmissionSchema.safeParse({
      applicationId: "application-1",
      confirmed: false,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("confirmRequired");
  });

  it("accepts a confirmed submission", () => {
    expect(
      confirmSubmissionSchema.safeParse({
        applicationId: "application-1",
        confirmed: true,
      }).success,
    ).toBe(true);
  });

  it("refuses a submission with no application behind it", () => {
    expect(
      confirmSubmissionSchema.safeParse({ applicationId: "", confirmed: true }).success,
    ).toBe(false);
  });
});
