import type { Region } from "@/lib/opportunities/types";

export const APPLICATION_PROFILE_FIELDS = [
  "fullName",
  "bio",
  "region",
  "school",
  "languages",
  "contact",
] as const;

export type ApplicationProfileField = (typeof APPLICATION_PROFILE_FIELDS)[number];

export type ApplicantProfile = {
  fullName: string;
  bio: string;
  region: Region | null;
  school: string;
  languages: string[];
  phone: string;
  telegram: string;
};

export type ApplicationReadiness = {
  ready: boolean;
  missing: ApplicationProfileField[];
};

function isPresent(profile: ApplicantProfile, field: ApplicationProfileField): boolean {
  switch (field) {
    case "fullName":
      return profile.fullName.trim().length >= 2;
    case "bio":
      return profile.bio.trim().length > 0;
    case "region":
      return profile.region !== null;
    case "school":
      return profile.school.trim().length > 0;
    case "languages":
      return profile.languages.length > 0;
    case "contact":
      return profile.phone.trim().length > 0 || profile.telegram.trim().length > 0;
  }
}

export function applicationReadiness(
  profile: ApplicantProfile | null,
): ApplicationReadiness {
  if (!profile) return { ready: false, missing: [...APPLICATION_PROFILE_FIELDS] };

  const missing = APPLICATION_PROFILE_FIELDS.filter(
    (field) => !isPresent(profile, field),
  );

  return { ready: missing.length === 0, missing };
}
