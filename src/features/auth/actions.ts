"use server";

import { revalidatePath } from "next/cache";
import { authedActionClient } from "@/lib/safe-action";
import { authedApi } from "@/lib/api/client.server";
import { clearSession } from "@/lib/auth/session.server";

/**
 * Sign out.
 *
 * Order matters: tell the backend first, then drop the cookie. Reversing it
 * would leave a live refresh token in circulation that this app can no longer
 * revoke, because it just deleted the only copy.
 *
 * A backend failure does not block the local sign-out — a user who pressed
 * "sign out" must end up signed out on this device regardless.
 */
export const signOutAction = authedActionClient.action(async ({ ctx }) => {
  try {
    await authedApi("/auth/logout", ctx.session.accessToken, { method: "POST" });
  } catch (error) {
    console.error(
      "[auth] backend logout failed; clearing local session anyway",
      error,
    );
  }

  await clearSession();
  revalidatePath("/", "layout");

  return { signedOut: true };
});
