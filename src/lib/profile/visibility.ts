export const OPTIONAL_PROFILE_PARTS = [
  "region",
  "hometownRegion",
  "city",
  "school",
  "gradeYear",
  "languages",
  "phone",
  "telegram",
  "instagram",
  "linkedin",
  "links",
  "joined",
  "activity",
] as const;

export type OptionalProfilePart = (typeof OPTIONAL_PROFILE_PARTS)[number];

export const ALWAYS_SHOWN_PROFILE_PARTS = [
  "photo",
  "name",
  "username",
  "level",
  "bio",
  "figures",
] as const;

export type AlwaysShownProfilePart = (typeof ALWAYS_SHOWN_PROFILE_PARTS)[number];

export const VISIBILITY_MARKER = "visibility";

export function visibilityFieldName(part: OptionalProfilePart): string {
  return `show-${part}`;
}

export function hiddenProfileParts(
  stored: readonly string[] | undefined,
): Set<OptionalProfilePart> {
  const chosen = new Set(stored ?? []);
  return new Set(OPTIONAL_PROFILE_PARTS.filter((part) => chosen.has(part)));
}

export function hiddenPartsFromFormData(
  formData: FormData,
): OptionalProfilePart[] | undefined {
  if (!formData.has(VISIBILITY_MARKER)) return undefined;
  return OPTIONAL_PROFILE_PARTS.filter(
    (part) => !formData.has(visibilityFieldName(part)),
  );
}

export function withoutHiddenParts<
  T extends {
    region: unknown;
    hometownRegion: unknown;
    city: string;
    school: string;
    gradeYear: string;
    languages: readonly string[];
    phone: string;
    telegram: string;
    instagram: string;
    linkedin: string;
    links: readonly string[];
  },
>(profile: T, hidden: ReadonlySet<OptionalProfilePart>): T {
  return {
    ...profile,
    region: hidden.has("region") ? null : profile.region,
    hometownRegion: hidden.has("hometownRegion") ? null : profile.hometownRegion,
    city: hidden.has("city") ? "" : profile.city,
    school: hidden.has("school") ? "" : profile.school,
    gradeYear: hidden.has("gradeYear") ? "" : profile.gradeYear,
    languages: hidden.has("languages") ? [] : profile.languages,
    phone: hidden.has("phone") ? "" : profile.phone,
    telegram: hidden.has("telegram") ? "" : profile.telegram,
    instagram: hidden.has("instagram") ? "" : profile.instagram,
    linkedin: hidden.has("linkedin") ? "" : profile.linkedin,
    links: hidden.has("links") ? [] : profile.links,
  };
}
