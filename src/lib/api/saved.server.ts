import "server-only";

import { cache } from "react";

import { authed } from "@/lib/api/session.server";
import { savedItemSchema, savedListSchema, type SavedList } from "@/lib/api/schemas";

export const listSaved = cache(function listSaved(): Promise<SavedList> {
  return authed("/saved", { schema: savedListSchema });
});

export function savedIds(list: SavedList): Set<string> {
  return new Set(list.items.map((item) => item.id));
}

export function saveOpportunity(opportunityId: string) {
  return authed("/saved", {
    method: "POST",
    body: { opportunityId },
    schema: savedItemSchema,
  });
}

export function unsaveOpportunity(opportunityId: string) {
  return authed(`/saved/${encodeURIComponent(opportunityId)}`, {
    method: "DELETE",
    schema: savedItemSchema,
  });
}
