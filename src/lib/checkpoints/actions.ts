"use server";

import { revalidatePath } from "next/cache";

import {
  failedResult,
  okResult,
  resultFromError,
  type ActionResult,
} from "@/lib/api/action-result";
import { claimCheckpoint } from "@/lib/api/checkpoints.server";
import { isCheckpointKey } from "@/lib/checkpoints/checkpoints";

export async function claimCheckpointAction(key: string): Promise<ActionResult> {
  if (!isCheckpointKey(key)) return failedResult("checkpointNotFound");
  try {
    await claimCheckpoint(key);
  } catch (error) {
    return resultFromError(error);
  }
  revalidatePath("/", "layout");
  return okResult;
}
