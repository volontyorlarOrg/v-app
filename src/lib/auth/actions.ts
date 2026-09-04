"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { defaultLocale, isLocale } from "@/i18n/routing";
import { authedApi } from "@/lib/api/client.server";
import { clearSession, getSession } from "@/lib/auth/session.server";
import { localePath } from "@/lib/routing/routes";

export async function signOut(formData: FormData) {
  const requested = formData.get("locale");
  const locale = isLocale(requested) ? requested : defaultLocale;
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
