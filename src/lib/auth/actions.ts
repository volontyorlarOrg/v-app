"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { defaultLocale, isLocale } from "@/i18n/routing";
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
import { HOME_ROUTE, localePath } from "@/lib/routing/routes";

function localeOf(formData: FormData) {
  const requested = formData.get("locale");
  return isLocale(requested) ? requested : defaultLocale;
}

function destinationOf(formData: FormData, locale: ReturnType<typeof localeOf>) {
  const next = formData.get("next");
  return (
    safeReturnPath(typeof next === "string" ? next : null) ??
    localePath(locale, HOME_ROUTE)
  );
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

  redirect(destinationOf(formData, localeOf(formData)));
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

  redirect(destinationOf(formData, localeOf(formData)));
}

export async function signOut(formData: FormData) {
  const locale = localeOf(formData);
  const session = await getSession();

  if (session) {
    try {
      await authedApi("/auth/logout", session.accessToken, {
        method: "POST",
        body: session.refreshToken ? { refreshToken: session.refreshToken } : {},
      });
    } catch (error) {
      console.error(
        "[auth] backend logout failed; clearing the local session anyway",
        error,
      );
    }
  }

  await clearSession();
  revalidatePath("/", "layout");
  redirect(localePath(locale, "login"));
}
