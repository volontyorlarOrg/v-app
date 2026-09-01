import "server-only";

import { authedApi } from "@/lib/api/client.server";
import { ApiError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/session.server";
import {
  applicationDetailSchema,
  applicationListResponseSchema,
  type ApplicationDetail,
  type ApplicationStatus,
  type DraftAnswers,
} from "./schemas";

/**
 * Application reads and writes.
 *
 * Every function starts by resolving the session and every request carries its
 * access token. No function accepts a `userId` — the backend derives ownership
 * from the token, which is the only way "a volunteer cannot read another
 * volunteer's application" can actually hold.
 */

export async function listMyApplications(status: ApplicationStatus | null) {
  const session = await requireSession();

  return authedApi("/applications", session.accessToken, {
    schema: applicationListResponseSchema,
    query: { status: status ?? undefined },
  });
}

/**
 * One application. `null` when it does not exist *or* is not this user's —
 * the backend's 404 and 403 collapse to the same outcome here so the UI cannot
 * be used to probe which application ids exist.
 */
export async function getMyApplication(
  applicationId: string,
): Promise<ApplicationDetail | null> {
  const session = await requireSession();

  try {
    return await authedApi(
      `/applications/${encodeURIComponent(applicationId)}`,
      session.accessToken,
      { schema: applicationDetailSchema },
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.code === "notFound" || error.code === "forbidden")
    ) {
      return null;
    }
    throw error;
  }
}

/** The volunteer's existing application to an opportunity, if any. */
export async function getMyApplicationForOpportunity(
  opportunityId: string,
): Promise<ApplicationDetail | null> {
  const session = await requireSession();

  try {
    return await authedApi("/applications/by-opportunity", session.accessToken, {
      schema: applicationDetailSchema,
      query: { opportunityId },
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === "notFound") return null;
    throw error;
  }
}

/**
 * Creates the draft, or returns the existing one.
 *
 * Idempotent on purpose: pressing Apply twice — a double-tap, a back button,
 * a reopened Telegram link — must not create two drafts for one opportunity.
 */
export async function startApplication(
  opportunityId: string,
): Promise<ApplicationDetail> {
  const session = await requireSession();

  return authedApi("/applications", session.accessToken, {
    method: "POST",
    body: { opportunityId },
    schema: applicationDetailSchema,
  });
}

export async function saveApplicationDraft(
  applicationId: string,
  answers: DraftAnswers,
): Promise<ApplicationDetail> {
  const session = await requireSession();

  return authedApi(
    `/applications/${encodeURIComponent(applicationId)}/draft`,
    session.accessToken,
    { method: "PATCH", body: { answers }, schema: applicationDetailSchema },
  );
}

export async function submitApplication(
  applicationId: string,
  answers: DraftAnswers,
): Promise<ApplicationDetail> {
  const session = await requireSession();

  return authedApi(
    `/applications/${encodeURIComponent(applicationId)}/submit`,
    session.accessToken,
    { method: "POST", body: { answers }, schema: applicationDetailSchema },
  );
}

export async function withdrawApplication(
  applicationId: string,
): Promise<ApplicationDetail> {
  const session = await requireSession();

  return authedApi(
    `/applications/${encodeURIComponent(applicationId)}/withdraw`,
    session.accessToken,
    { method: "POST", schema: applicationDetailSchema },
  );
}
