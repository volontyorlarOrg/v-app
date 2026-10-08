"use server";

import { revalidatePath } from "next/cache";

import {
  failedResult,
  okResult,
  resultFromError,
  type ActionResult,
} from "@/lib/api/action-result";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications.server";

export async function markAllReadAction(): Promise<ActionResult> {
  try {
    await markAllNotificationsRead();
  } catch (error) {
    return resultFromError(error);
  }

  revalidatePath("/", "layout");
  return okResult;
}

export async function markReadAction(id: string): Promise<ActionResult> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    return failedResult("validation");
  try {
    await markNotificationRead(id);
  } catch (error) {
    return resultFromError(error);
  }
  revalidatePath("/", "layout");
  return okResult;
}
