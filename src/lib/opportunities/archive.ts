export type PastOpportunityScene = "stadium" | "mountains" | "expo";

export type PastOpportunity = {
  id: string;
  titleKey: "profession" | "amirsoy" | "football";
  locationKey: "andijan" | "amirsoy" | "tashkent";
  startsAt: string;
  endsAt: string;
  scene: PastOpportunityScene;
  sourceUrl: string;
};

export const PAST_OPPORTUNITIES = [
  {
    id: "best-in-profession-2026",
    titleKey: "profession",
    startsAt: "2026-09-21",
    endsAt: "2026-09-24",
    locationKey: "andijan",
    scene: "expo",
    sourceUrl: "https://t.me/yvc_uz/307",
  },
  {
    id: "amirsoy-paradiso-2026",
    titleKey: "amirsoy",
    startsAt: "2026-08-15",
    endsAt: "2026-08-16",
    locationKey: "amirsoy",
    scene: "mountains",
    sourceUrl: "https://t.me/yvc_uz/281",
  },
  {
    id: "pakhtakor-international-match-2026",
    titleKey: "football",
    startsAt: "2026-08-11",
    endsAt: "2026-08-11",
    locationKey: "tashkent",
    scene: "stadium",
    sourceUrl: "https://t.me/yvc_uz/273",
  },
] satisfies readonly PastOpportunity[];
