"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { okResult, resultFromError, type ActionResult } from "@/lib/api/action-result";
import { startApplication } from "@/lib/api/applications.server";
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

export async function applyAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const opportunityId = String(formData.get("opportunityId") ?? "");
  let applicationId: string;

  try {
    applicationId = (await startApplication(opportunityId)).id;
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  redirect(`/${await getLocale()}${applicationHref(applicationId)}`);
}
