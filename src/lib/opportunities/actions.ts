"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { okResult, resultFromError, type ActionResult } from "@/lib/api/action-result";
import { startApplication, submitApplication } from "@/lib/api/applications.server";
import { isApiError } from "@/lib/api/errors";
import { getOpportunity } from "@/lib/api/opportunities.server";
import { saveOpportunity, unsaveOpportunity } from "@/lib/api/saved.server";
import { applicationHref } from "@/lib/routing/routes";

export async function setSavedAction(
  opportunityId: string,
  saved: boolean,
): Promise<ActionResult> {
  try {
    if (saved) await saveOpportunity(opportunityId);
    else await unsaveOpportunity(opportunityId);
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return okResult;
}

async function canSubmitFromProfile(slug: string): Promise<boolean> {
  const opportunity = await getOpportunity(slug);
  return (
    opportunity !== null &&
    opportunity.questions.length === 0 &&
    !opportunity.essayRequired
  );
}

async function send(applicationId: string): Promise<void> {
  try {
    await submitApplication(applicationId, {});
  } catch (error) {
    if (isApiError(error) && error.backendCode === "applicationNotEditable") return;
    throw error;
  }
}

export async function applyAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const opportunityId = String(formData.get("opportunityId") ?? "");
  let applicationId: string;

  try {
    const application = await startApplication(opportunityId);
    applicationId = application.id;
    if (
      application.status === "draft" &&
      (await canSubmitFromProfile(application.opportunity.slug))
    ) {
      await send(application.id);
    }
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  redirect(`/${await getLocale()}${applicationHref(applicationId)}`);
}
