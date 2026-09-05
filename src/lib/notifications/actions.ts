"use server";

import { revalidatePath } from "next/cache";

import { okResult, resultFromError, type ActionResult } from "@/lib/api/action-result";
import { markAllNotificationsRead } from "@/lib/api/notifications.server";

export async function markAllReadAction(): Promise<ActionResult> {
  try {
    await markAllNotificationsRead();
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return okResult;
}
