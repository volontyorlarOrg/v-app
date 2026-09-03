"use server";

import { revalidatePath } from "next/cache";
import { authedActionClient } from "@/lib/safe-action";
import { authedApi } from "@/lib/api/client.server";
import { clearSession } from "@/lib/auth/session.server";

export const signOutAction = authedActionClient.action(async ({ ctx }) => {
  try {
    await authedApi("/auth/logout", ctx.session.accessToken, { method: "POST" });
  } catch (error) {
    console.error("[auth] backend logout failed; clearing local session anyway", error);
  }

  await clearSession();
  revalidatePath("/", "layout");

  return { signedOut: true };
});
