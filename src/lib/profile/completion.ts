import type { Region } from "@/lib/opportunities/types";

export type ProfileFields = {
  fullName: string;
  bio: string;
  region: Region | null;
  school: string;
  languages: string[];
  phone: string;
  telegram: string;
};

export const COMPLETION_FIELDS = [
  "fullName",
  "bio",
  "region",
  "school",
  "languages",
  "contact",
] as const;

export type CompletionField = (typeof COMPLETION_FIELDS)[number];

function isFilled(profile: ProfileFields, field: CompletionField): boolean {
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
  gradeYear: string;
  city: string;
  skills: string[];
  links: string[];
};

export const EMPTY_PROFILE: VolunteerProfile = {
  fullName: "",
  bio: "",
  region: null,
  school: "",
  gradeYear: "",
  city: "",
  languages: [],
  skills: [],
  phone: "",
  telegram: "",
  links: [],
};
