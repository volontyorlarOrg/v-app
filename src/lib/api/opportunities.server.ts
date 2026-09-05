import "server-only";

import { cache } from "react";

import { api } from "@/lib/api/client.server";
import { isApiError } from "@/lib/api/errors";
import {
  opportunityDetailSchema,
  opportunityListSchema,
  type OpportunityList,
} from "@/lib/api/schemas";
import { filtersToApiQuery, type OpportunityFilters } from "@/lib/opportunities/filters";
import type { OpportunityDetail } from "@/lib/opportunities/types";

export const OPPORTUNITY_PAGE_SIZE = 50;

export function listOpportunities(filters: OpportunityFilters): Promise<OpportunityList> {
  return api("/opportunities", {
    query: { ...filtersToApiQuery(filters), pageSize: OPPORTUNITY_PAGE_SIZE },
    schema: opportunityListSchema,
    cache: "no-store",
  });
}

export const getOpportunity = cache(async function getOpportunity(slug: string): Promise<OpportunityDetail | null> {
  try {
    return await api(`/opportunities/${encodeURIComponent(slug)}`, {
      schema: opportunityDetailSchema,
      cache: "no-store",
    });
  } catch (error) {
    if (isApiError(error) && error.code === "notFound") return null;
    throw error;
  }
});
