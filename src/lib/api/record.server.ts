import "server-only";

import { cache } from "react";

import { authed } from "@/lib/api/session.server";
import { historySchema, recordSchema, type History } from "@/lib/api/schemas";
import type { VolunteerRecord } from "@/lib/record/levels";

export const getRecord = cache(function getRecord(): Promise<VolunteerRecord> {
  return authed("/record", { schema: recordSchema });
});

export const getHistory = cache(function getHistory(): Promise<History> {
  return authed("/record/history", { schema: historySchema });
});
