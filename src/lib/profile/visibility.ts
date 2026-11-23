export const REQUIRED_PROFILE_PARTS = [
  "bio",
  "region",
  "city",
  "school",
  "languages",
  "links",
  "joined",
  "activity",
] as const;

export const OPTIONAL_PROFILE_PARTS = [
  "hometownRegion",
  "gradeYear",
  "phone",
  "telegram",
  "instagram",
  "linkedin",
] as const;

export const DEFAULT_HIDDEN_PROFILE_PARTS = ["phone"] as const;

export const CONTACT_PROFILE_PARTS = [
  "phone",
  "telegram",
  "instagram",
  "linkedin",
] as const;

export function contactPublicationRequired(
  previousHidden: readonly string[],
  nextHidden: readonly string[],
) {
  return CONTACT_PROFILE_PARTS.some(
    (part) => previousHidden.includes(part) && !nextHidden.includes(part),
  );
}

export type RequiredProfilePart = (typeof REQUIRED_PROFILE_PARTS)[number];
export type OptionalProfilePart = (typeof OPTIONAL_PROFILE_PARTS)[number];

export type ProfileVisibilityInput = {
  hiddenFields: OptionalProfilePart[];
  confirmContactPublication: boolean;
};

export const HEADER_PROFILE_PARTS = [
  "photo",
  "name",
  "username",
  "level",
  "figures",
] as const;

export const ALWAYS_SHOWN_PROFILE_PARTS = [
  ...HEADER_PROFILE_PARTS,
  ...REQUIRED_PROFILE_PARTS,
] as const;

export type AlwaysShownProfilePart = (typeof ALWAYS_SHOWN_PROFILE_PARTS)[number];

export function hiddenProfileParts(
  stored: readonly string[] | undefined,
): Set<OptionalProfilePart> {
  const chosen = new Set(stored ?? []);
  return new Set(OPTIONAL_PROFILE_PARTS.filter((part) => chosen.has(part)));
}

export function withoutHiddenParts<
  T extends {
    hometownRegion: unknown;
    gradeYear: string;
    phone: string;
    telegram: string;
    instagram: string;
    linkedin: string;
  },
>(profile: T, hidden: ReadonlySet<OptionalProfilePart>): T {
  return {
    ...profile,
    hometownRegion: hidden.has("hometownRegion") ? null : profile.hometownRegion,
    gradeYear: hidden.has("gradeYear") ? "" : profile.gradeYear,
    phone: hidden.has("phone") ? "" : profile.phone,
    telegram: hidden.has("telegram") ? "" : profile.telegram,
    instagram: hidden.has("instagram") ? "" : profile.instagram,
    linkedin: hidden.has("linkedin") ? "" : profile.linkedin,
  };
}
