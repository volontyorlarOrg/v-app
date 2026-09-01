import { test } from "@playwright/test";

/**
 * The signed-in volunteer journey.
 *
 * **These tests are declared and skipped, and that is a deliberate report of a
 * blocker rather than an omission.**
 *
 * The journey the handoff specifies — sign in, complete a profile, start an
 * application, write an essay, save a draft, reload, confirm the draft
 * persisted, submit, see the status — cannot be executed here. Every step of
 * it needs a backend that does not exist yet:
 *
 *   - There is no authentication service, so there is no way to reach a
 *     signed-in state. The Telegram contract this app codes against is
 *     explicitly marked unverified (see `src/features/auth/telegram.ts`).
 *   - There is no application service, so a draft has nowhere to persist and
 *     the reload step has nothing to prove.
 *
 * The alternative would be to mock the backend inside the E2E layer, which
 * would produce a suite that passes without testing the integration these
 * tests exist to cover. A green tick for a journey that has never run is worse
 * than a visible skip.
 *
 * To enable: point `YVC_API_BASE_URL` at a backend, set `YVC_SESSION_SECRET`,
 * add a test-auth path that can establish a session without a live Telegram
 * bot, then remove the `.skip` below.
 */

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
