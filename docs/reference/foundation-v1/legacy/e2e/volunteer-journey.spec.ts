import { test } from "@playwright/test";

const BLOCKED =
  "Blocked: no YVC backend. Needs YVC_API_BASE_URL, YVC_SESSION_SECRET, and a test-auth path.";

test.describe("volunteer journey", () => {
  test.skip(true, BLOCKED);

  test("signs in and lands on the dashboard", async () => {});

  test("completes the profile and sees the completion meter update", async () => {});

  test("starts an application from an opportunity", async () => {});

  test("writes an essay and sees the save state become Saved", async () => {});

  test("keeps the draft across a page reload", async () => {});

  test("submits after confirming, and the status becomes Submitted", async () => {});

  test("shows the submitted application in the application history", async () => {});

  test("cannot reach a partner or admin route by direct URL", async () => {});
});

test.describe("partner review", () => {
  test.skip(
    true,
    "Blocked: partner workflows are not implemented. No backend permission model or applicant-review contract exists — see docs/features/partner-review.md.",
  );

  test("opens the applicant list", async () => {});

  test("changes a review status and the list refreshes", async () => {});
});
