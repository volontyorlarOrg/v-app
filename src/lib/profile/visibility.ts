export const OPTIONAL_PROFILE_PARTS = [
  "bio",
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

export const DEFAULT_HIDDEN_PROFILE_PARTS = ["phone"] as const;

export const CONTACT_PROFILE_PARTS = [
  "phone",
  "telegram",
  "instagram",
  "linkedin",
  "links",
] as const;

export function contactPublicationRequired(
  previousHidden: readonly string[],
  nextHidden: readonly string[],
) {
  return CONTACT_PROFILE_PARTS.some(
    (part) => previousHidden.includes(part) && !nextHidden.includes(part),
  );
}

export type OptionalProfilePart = (typeof OPTIONAL_PROFILE_PARTS)[number];

export const ALWAYS_SHOWN_PROFILE_PARTS = [
  "photo",
  "name",
  "username",
  "level",
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
    bio: string;
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
    bio: hidden.has("bio") ? "" : profile.bio,
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
