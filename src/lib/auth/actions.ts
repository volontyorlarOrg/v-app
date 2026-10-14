"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  failedResult,
  resultFromError,
  type ActionResult,
} from "@/lib/api/action-result";
import { api, authedApi } from "@/lib/api/client.server";
import { AUTH_REQUEST_TIMEOUT_MS, isAuthConfigured } from "@/lib/auth/config";
import {
  credentialsFromFormData,
  fieldErrorsOf,
  logInSchema,
  signUpSchema,
} from "@/lib/auth/credentials";
import {
  issuedSessionSchema,
  safeReturnPath,
  toSessionPayload,
} from "@/lib/auth/session";
import { clearSession, getSession, writeSession } from "@/lib/auth/session.server";
import { onboardingPath } from "@/lib/onboarding/state";
import { onboardingStartCookie } from "@/lib/onboarding/state.server";
import { ENTRY_ROUTE, HOME_ROUTE, navHref } from "@/lib/routing/routes";

function returnPathOf(formData: FormData) {
  const next = formData.get("next");
  return safeReturnPath(typeof next === "string" ? next : null);
}

function destinationOf(formData: FormData) {
  return returnPathOf(formData) ?? navHref(HOME_ROUTE);
}

async function openSession(
  path: string,
  body: Record<string, string>,
): Promise<ActionResult> {
  if (!isAuthConfigured()) return failedResult("authUnavailable");

  try {
    const issued = await api(path, {
      method: "POST",
      body,
      schema: issuedSessionSchema,
      cache: "no-store",
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
    });

    if (!(await writeSession(toSessionPayload(issued)))) {
      return failedResult("authUnavailable");
    }
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return { status: "ok" };
}

export async function logInAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = logInSchema.safeParse(credentialsFromFormData(formData));
  if (!parsed.success) {
    return failedResult("validationFailed", fieldErrorsOf(parsed.error));
  }

  const result = await openSession("/auth/password/login", parsed.data);
  if (result.status !== "ok") return result;

  redirect(destinationOf(formData));
}

export async function createAccountAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(credentialsFromFormData(formData));
  if (!parsed.success) {
    return failedResult("validationFailed", fieldErrorsOf(parsed.error));
  }

  const result = await openSession("/auth/password/signup", parsed.data);
  if (result.status !== "ok") return result;

  const store = await cookies();
  store.set(onboardingStartCookie());
  redirect(onboardingPath(returnPathOf(formData)));
}

export async function signOut() {
  const session = await getSession();

  if (session) {
    try {
      await authedApi("/auth/logout", session.accessToken, { method: "POST" });
    } catch (error) {
      console.error(
        "[auth] backend logout failed; clearing the local session anyway",
        error,
      );
    }
  }

  await clearSession();
  revalidatePath("/", "layout");
  redirect(navHref(ENTRY_ROUTE));
}
