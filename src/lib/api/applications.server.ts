import "server-only";

import { cache } from "react";

import { authed, isMissing } from "@/lib/api/session.server";
import {
  applicationDetailSchema,
  applicationListSchema,
  type ApplicationList,
} from "@/lib/api/schemas";
import type { AnswerInput } from "@/lib/applications/answers";
import type { ApplicationDetail } from "@/lib/applications/status";

export const listApplications = cache(function listApplications(): Promise<ApplicationList> {
  return authed("/applications", { schema: applicationListSchema });
});

export const getApplication = cache(async function getApplication(id: string): Promise<ApplicationDetail | null> {
  try {
    return await authed(`/applications/${encodeURIComponent(id)}`, {
      schema: applicationDetailSchema,
    });
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
});

export const getApplicationByOpportunity = cache(async function getApplicationByOpportunity(
  opportunityId: string,
): Promise<ApplicationDetail | null> {
  try {
    return await authed("/applications/by-opportunity", {
      query: { opportunityId },
      schema: applicationDetailSchema,
    });
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
});

export function startApplication(opportunityId: string): Promise<ApplicationDetail> {
  return authed("/applications", {
    method: "POST",
    body: { opportunityId },
    schema: applicationDetailSchema,
  });
}

export function saveApplicationDraft(
  id: string,
  answers: AnswerInput,
): Promise<ApplicationDetail> {
  return authed(`/applications/${encodeURIComponent(id)}/draft`, {
    method: "PATCH",
    body: { answers },
    schema: applicationDetailSchema,
  });
}

export function submitApplication(
  id: string,
  answers: AnswerInput,
): Promise<ApplicationDetail> {
  return authed(`/applications/${encodeURIComponent(id)}/submit`, {
    method: "POST",
    body: { answers },
    schema: applicationDetailSchema,
  });
}

export function withdrawApplication(id: string): Promise<ApplicationDetail> {
  return authed(`/applications/${encodeURIComponent(id)}/withdraw`, {
    method: "POST",
    schema: applicationDetailSchema,
  });
}
