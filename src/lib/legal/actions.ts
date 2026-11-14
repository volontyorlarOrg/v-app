"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isLocale } from "@/i18n/routing";
import {
  failedResult,
  resultFromError,
  type ActionResult,
} from "@/lib/api/action-result";
import { api } from "@/lib/api/client.server";
import { authed } from "@/lib/api/session.server";
import { isSecureCookieTransport } from "@/lib/auth/config";
import { safeReturnPath } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session.server";

import {
  ADMISSION_COOKIE,
  LEGAL_CHOICES,
  LEGAL_REQUEST_KINDS,
  LEGAL_VERSION,
  type LegalChoice,
} from "./constants";
import { admissionSchema, legalStateSchema, receiptSchema } from "./schemas";

const ADMISSION_MAX_AGE_SECONDS = 30 * 60;

export async function giveConsentAction(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const locale = String(form.get("locale"));
  if (form.get("accepted") !== "on" || !isLocale(locale)) {
    return failedResult("consentRequired");
  }
  const consent = {
    locale,
    version: LEGAL_VERSION,
    accepted: true,
    leaderboard: form.get("leaderboard") === "on",
    publicProfile: form.get("publicProfile") === "on",
  };
  const rawNext = form.get("next");
  const next = safeReturnPath(typeof rawNext === "string" ? rawNext : null);
  const session = await getSession();

  try {
    if (session) {
      await authed("/me/legal/accept", {
        method: "POST",
        body: consent,
        schema: receiptSchema,
      });
    } else {
      const admission = await api("/legal/admissions", {
        method: "POST",
        body: consent,
        schema: admissionSchema,
      });
      (await cookies()).set(ADMISSION_COOKIE, admission.token, {
        httpOnly: true,
        secure: isSecureCookieTransport(),
        sameSite: "lax",
        path: "/",
        maxAge: ADMISSION_MAX_AGE_SECONDS,
      });
    }
  } catch (error) {
    return resultFromError(error);
  }

  if (session) {
    revalidatePath("/", "layout");
    redirect(next ?? "/dashboard");
  }
  redirect(next ? `/signup?next=${encodeURIComponent(next)}` : "/signup");
}

export async function setLegalChoiceAction(
  choice: LegalChoice,
  enabled: boolean,
): Promise<ActionResult> {
  if (!LEGAL_CHOICES.includes(choice)) return failedResult("validationFailed");
  try {
    await authed("/me/legal/choices", {
      method: "PUT",
      body: { [choice]: enabled },
      schema: legalStateSchema,
    });
  } catch (error) {
    return resultFromError(error);
  }
  revalidatePath("/", "layout");
  return { status: "ok" };
}

const dataRequestSchema = z.object({
  kind: z.enum(LEGAL_REQUEST_KINDS),
  message: z
    .string()
    .max(2000)
    .refine((value) => !value.includes("\u0000")),
});

export async function requestDataAction(
  _previous: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const parsed = dataRequestSchema.safeParse({
    kind: form.get("kind"),
    message: form.get("message") ?? "",
  });
  if (!parsed.success) return failedResult("validationFailed");
  try {
    await authed("/me/legal/requests", {
      method: "POST",
      body: parsed.data,
      schema: receiptSchema,
    });
  } catch (error) {
    return resultFromError(error);
  }
  revalidatePath("/consent");
  return { status: "ok" };
}
