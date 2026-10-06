import "server-only";

import { cache } from "react";

import { authed } from "@/lib/api/session.server";
import { checkpointListSchema, type CheckpointList } from "@/lib/api/schemas";

export const getCheckpoints = cache(function getCheckpoints(): Promise<CheckpointList> {
  return authed("/checkpoints", { schema: checkpointListSchema });
});
