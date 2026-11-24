import type { Region } from "@/lib/opportunities/types";
import type { EducationType, PlaceOption } from "@/lib/profile/place";

export type ProfileFields = {
  fullName: string;
  bio: string;
  region: Region | null;
  districtId: string | null;
  educationType: EducationType | null;
  institutionId: string | null;
  gradeYear: string;
  languages: string[];
  phone: string;
  telegram: string;
};

export const COMPLETION_FIELDS = [
  "fullName",
  "bio",
  "region",
  "district",
  "education",
  "gradeYear",
  "languages",
  "telegram",
] as const;

export type CompletionField = (typeof COMPLETION_FIELDS)[number];

export function isCompletionField(value: string): value is CompletionField {
  return (COMPLETION_FIELDS as readonly string[]).includes(value);
}

function isFilled(profile: ProfileFields, field: CompletionField): boolean {
  switch (field) {
    case "fullName":
      return profile.fullName.trim().length >= 2;
    case "bio":
      return profile.bio.trim().length > 0;
    case "region":
      return profile.region !== null;
    case "district":
      return profile.districtId !== null;
    case "education":
      return (
        profile.educationType === "gap_year" ||
        (profile.educationType !== null && profile.institutionId !== null)
      );
    case "gradeYear":
      return (
        profile.educationType === "gap_year" || profile.gradeYear.trim().length > 0
      );
    case "languages":
      return profile.languages.length > 0;
    case "telegram":
      return profile.telegram.trim().length > 0;
  }
}

export type ProfileCompletion = {
  percent: number;
  complete: boolean;
  missing: CompletionField[];
};

export function profileCompletion(profile: ProfileFields): ProfileCompletion {
  const missing = COMPLETION_FIELDS.filter((field) => !isFilled(profile, field));
  const filled = COMPLETION_FIELDS.length - missing.length;

  return {
    percent: Math.round((filled / COMPLETION_FIELDS.length) * 100),
    complete: missing.length === 0,
    missing,
  };
}

export type VolunteerProfile = ProfileFields & {
  hometownRegion: Region | null;
  city: string;
  school: string;
  district: PlaceOption | null;
  institution: PlaceOption | null;
  instagram: string;
  linkedin: string;
  links: string[];
};

export const EMPTY_PROFILE: VolunteerProfile = {
  fullName: "",
  bio: "",
  region: null,
  hometownRegion: null,
  districtId: null,
  district: null,
  educationType: null,
  institutionId: null,
  institution: null,
  school: "",
  gradeYear: "",
  city: "",
  languages: [],
  phone: "",
  telegram: "",
  instagram: "",
  linkedin: "",
  links: [],
};
