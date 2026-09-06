import { z } from "zod";

import { REGIONS, type Region } from "@/lib/opportunities/types";

export type ProfileInput = {
  fullName: string;
  bio: string;
  school: string;
  gradeYear: string;
  region: Region | null;
  city: string;
  languages: string[];
  skills: string[];
  phone: string;
  telegram: string;
  links: string[];
};

const LIST_LIMITS = { languages: 10, skills: 20, links: 3 } as const;

export const PROFILE_TEXT_LIMITS = {
  fullName: 120,
  bio: 600,
  school: 160,
  gradeYear: 40,
  city: 80,
} as const;

export const PROFILE_NAME_MIN_LENGTH = 2;

const boundedText = (max: number) => z.string().trim().max(max, "tooLong");

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "required")
    .min(PROFILE_NAME_MIN_LENGTH, "tooShort")
    .max(PROFILE_TEXT_LIMITS.fullName, "tooLong"),
  bio: boundedText(PROFILE_TEXT_LIMITS.bio),
  school: boundedText(PROFILE_TEXT_LIMITS.school),
  gradeYear: boundedText(PROFILE_TEXT_LIMITS.gradeYear),
  region: z.union([z.literal(""), z.enum(REGIONS)]),
  city: boundedText(PROFILE_TEXT_LIMITS.city),
  languages: z.string(),
  skills: z.string(),
  phone: z.string().trim(),
  telegram: z.string().trim(),
  links: z.string(),
});

export type ProfileFormValues = z.input<typeof profileFormSchema>;

export function profileFormValues(profile: {
  fullName: string;
  bio: string;
  school: string;
  gradeYear: string;
  region: Region | null;
  city: string;
  languages: readonly string[];
  skills: readonly string[];
  phone: string;
  telegram: string;
  links: readonly string[];
}): ProfileFormValues {
  return {
    fullName: profile.fullName,
    bio: profile.bio,
    school: profile.school,
    gradeYear: profile.gradeYear,
    region: profile.region ?? "",
    city: profile.city,
    languages: profile.languages.join(", "),
    skills: profile.skills.join(", "),
    phone: profile.phone,
    telegram: profile.telegram,
    links: profile.links.join(", "),
  };
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function list(formData: FormData, name: keyof typeof LIST_LIMITS): string[] {
  return text(formData, name)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, LIST_LIMITS[name]);
}

function region(formData: FormData): Region | null {
  const value = text(formData, "region");
  return (REGIONS as readonly string[]).includes(value) ? (value as Region) : null;
}

export function profileInputFromFormData(formData: FormData): ProfileInput {
  return {
    fullName: text(formData, "fullName"),
    bio: text(formData, "bio"),
    school: text(formData, "school"),
    gradeYear: text(formData, "gradeYear"),
    region: region(formData),
    city: text(formData, "city"),
    languages: list(formData, "languages"),
    skills: list(formData, "skills"),
    phone: text(formData, "phone"),
    telegram: text(formData, "telegram").replace(/^@+/, ""),
    links: list(formData, "links"),
  };
}
