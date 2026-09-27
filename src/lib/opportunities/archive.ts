export type PastOpportunityScene = "stadium" | "mountains" | "expo" | "media";

export type PastOpportunity = {
  id: string;
  titleKey: string;
  categoryKey: "eventTeam" | "communityRole" | "regionalRole";
  dateKind: "event" | "deadline" | "undated";
  startsAt?: string;
  endsAt?: string;
  locationKey?: "uzbekistan" | "tashkent" | "amirsoy" | "allRegions" | "andijan";
  scene: PastOpportunityScene;
  sourceUrl: string;
};

export const PAST_OPPORTUNITIES = [
  {
    id: "best-in-profession-2026",
    titleKey: "profession",
    categoryKey: "eventTeam",
    dateKind: "event",
    startsAt: "2026-09-21",
    endsAt: "2026-09-24",
    locationKey: "andijan",
    scene: "expo",
    sourceUrl: "https://t.me/yvc_uz/307",
  },
  {
    id: "articularuz-regional-coordinators",
    titleKey: "articular",
    categoryKey: "regionalRole",
    dateKind: "deadline",
    startsAt: "2026-09-07",
    locationKey: "allRegions",
    scene: "media",
    sourceUrl: "https://t.me/yvc_uz/293",
  },
  {
    id: "independent-writer",
    titleKey: "writer",
    categoryKey: "communityRole",
    dateKind: "undated",
    scene: "media",
    sourceUrl: "https://t.me/yvc_uz/304",
  },
  {
    id: "regional-volunteer-coordinators",
    titleKey: "coordinators",
    categoryKey: "regionalRole",
    dateKind: "undated",
    locationKey: "allRegions",
    scene: "expo",
    sourceUrl: "https://t.me/yvc_uz/275",
  },
  {
    id: "yashil-qollar-media-team",
    titleKey: "yashilQollar",
    categoryKey: "communityRole",
    dateKind: "deadline",
    startsAt: "2026-08-22",
    scene: "media",
    sourceUrl: "https://t.me/yvc_uz/283",
  },
  {
    id: "amirsoy-paradiso-2026",
    titleKey: "amirsoy",
    categoryKey: "eventTeam",
    dateKind: "event",
    startsAt: "2026-08-15",
    endsAt: "2026-08-16",
    locationKey: "amirsoy",
    scene: "mountains",
    sourceUrl: "https://t.me/yvc_uz/281",
  },
  {
    id: "pakhtakor-international-match-2026",
    titleKey: "football",
    categoryKey: "eventTeam",
    dateKind: "event",
    startsAt: "2026-08-11",
    locationKey: "tashkent",
    scene: "stadium",
    sourceUrl: "https://t.me/yvc_uz/273",
  },
  {
    id: "x-factor-uzbekistan-2025",
    titleKey: "xFactor",
    categoryKey: "eventTeam",
    dateKind: "event",
    startsAt: "2025-07-06",
    endsAt: "2025-07-21",
    locationKey: "uzbekistan",
    scene: "media",
    sourceUrl: "https://t.me/together_87/1186",
  },
] satisfies readonly PastOpportunity[];
