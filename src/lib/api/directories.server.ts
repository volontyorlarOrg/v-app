import "server-only";

import { cache } from "react";

import { api } from "@/lib/api/client.server";
import {
  districtListSchema,
  institutionListSchema,
  type District,
  type Institution,
} from "@/lib/api/schemas";
import type { InstitutionType } from "@/lib/profile/place";

const DIRECTORY_REVALIDATE_SECONDS = 300;

export const getDistricts = cache(async function getDistricts(): Promise<District[]> {
  const { items } = await api("/directories/districts", {
    schema: districtListSchema,
    revalidate: DIRECTORY_REVALIDATE_SECONDS,
  });
  return items;
});

export type InstitutionQuery = {
  type: InstitutionType;
  districtId?: string;
  region?: string;
  q?: string;
};

export async function searchInstitutions(
  query: InstitutionQuery,
): Promise<Institution[]> {
  const { items } = await api("/directories/institutions", {
    query,
    schema: institutionListSchema,
    revalidate: DIRECTORY_REVALIDATE_SECONDS,
  });
  return items;
}

export const getUniversities = cache(async function getUniversities(): Promise<
  Institution[]
> {
  return searchInstitutions({ type: "university" });
});

export type PlaceDirectories = { districts: District[]; universities: Institution[] };

export async function loadPlaceDirectories(): Promise<PlaceDirectories | null> {
  try {
    const [districts, universities] = await Promise.all([
      getDistricts(),
      getUniversities(),
    ]);
    return { districts, universities };
  } catch {
    return null;
  }
}
