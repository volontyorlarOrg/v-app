import "server-only";

import { publicApi } from "@/lib/api/client.server";
import { ApiError } from "@/lib/api/errors";
import { publicApiBaseUrl, sampleDataEnabled } from "@/lib/api/env.server";
import { canApply, displayStatus } from "./deadline";
import { sampleOpportunities } from "./sample-data";
import {
  PAGE_SIZE,
  opportunityDetailSchema,
  opportunityListResponseSchema,
  type OpportunityDetail,
  type OpportunityFilters,
  type OpportunityListResponse,
} from "./schemas";

const LIST_REVALIDATE_SECONDS = 120;
const DETAIL_REVALIDATE_SECONDS = 300;

export function isUsingSampleData(): boolean {
  return publicApiBaseUrl() === null && sampleDataEnabled();
}

function ensureSource(): void {
  if (publicApiBaseUrl() === null && !sampleDataEnabled()) {
    throw new ApiError("notConfigured", {
      message:
        "No YVC_API_BASE_URL and sample data is disabled; there is no opportunity source.",
    });
  }
}

export async function listOpportunities(
  filters: OpportunityFilters,
): Promise<OpportunityListResponse> {
  ensureSource();

  if (isUsingSampleData()) return listFromSample(filters);

  return publicApi("/opportunities", {
    schema: opportunityListResponseSchema,
    query: {
      q: filters.q || undefined,
      region: filters.region ?? undefined,
      format: filters.format ?? undefined,
      status: filters.openOnly ? "open" : undefined,
      sort: filters.sort,
      page: filters.page,
      pageSize: PAGE_SIZE,
    },
    revalidate: LIST_REVALIDATE_SECONDS,
    tags: ["opportunities"],
  });
}

export async function getOpportunity(slug: string): Promise<OpportunityDetail | null> {
  ensureSource();

  if (isUsingSampleData()) {
    return sampleOpportunities().find((item) => item.slug === slug) ?? null;
  }

  try {
    return await publicApi(`/opportunities/${encodeURIComponent(slug)}`, {
      schema: opportunityDetailSchema,
      revalidate: DETAIL_REVALIDATE_SECONDS,
      tags: ["opportunities", `opportunity:${slug}`],
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === "notFound") return null;
    throw error;
  }
}

export async function listOpportunitySlugs(): Promise<string[]> {
  if (isUsingSampleData()) {
    return sampleOpportunities().map((item) => item.slug);
  }
  return [];
}

function listFromSample(filters: OpportunityFilters): OpportunityListResponse {
  const now = new Date();
  const needle = filters.q.trim().toLowerCase();

  let items = sampleOpportunities();

  if (needle) {
    items = items.filter((item) =>
      [item.title, item.summary, item.organization.name, item.city ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  if (filters.region) {
    items = items.filter((item) => item.region === filters.region);
  }

  if (filters.format) {
    items = items.filter((item) => item.format === filters.format);
  }

  if (filters.openOnly) {
    items = items.filter((item) => {
      const status = displayStatus(item, now);
      return status === "open" || status === "closingSoon";
    });
  }

  items = [...items].sort((a, b) => {
    const openA = canApply(a, now) ? 0 : 1;
    const openB = canApply(b, now) ? 0 : 1;
    if (openA !== openB) return openA - openB;

    switch (filters.sort) {
      case "deadline":
        return a.applicationDeadline.localeCompare(b.applicationDeadline);
      case "startDate":
        return a.startsAt.localeCompare(b.startsAt);
      case "newest":
        return b.id.localeCompare(a.id);
    }
  });

  const total = items.length;
  const start = (filters.page - 1) * PAGE_SIZE;

  return {
    items: items.slice(start, start + PAGE_SIZE),
    page: filters.page,
    pageSize: PAGE_SIZE,
    total,
  };
}
