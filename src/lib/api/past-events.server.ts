import "server-only";

import { api } from "@/lib/api/client.server";
import { pastEventListSchema, type PastEventList } from "@/lib/api/schemas";

export const PAST_EVENT_PAGE_SIZE = 12;

export function listPastEvents(): Promise<PastEventList> {
  return api("/past-events", {
    query: { pageSize: PAST_EVENT_PAGE_SIZE },
    schema: pastEventListSchema,
    cache: "no-store",
  });
}
