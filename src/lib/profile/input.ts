import { z } from "zod";

import { REGIONS, type Region } from "@/lib/opportunities/types";
import { linkedinProfileUrl } from "@/lib/profile/social-links";

export type ProfileInput = {
  fullName: string;
  bio: string;
  school: string;
  gradeYear: string;
  region: Region | null;
  city: string;
  languages: string[];
  phone: string;
  telegram: string;
  instagram: string;
  linkedin: string;
  links: string[];
};

const LIST_LIMITS = { languages: 10, links: 3 } as const;

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
  languages: z.array(z.string().trim().min(1).max(35)).max(LIST_LIMITS.languages),
  phone: z.string().trim(),
  telegram: z.string().trim(),
  instagram: z
    .string()
    .trim()
    .refine((value) => /^@?[A-Za-z0-9._]{0,30}$/.test(value), "invalidInstagram"),
  linkedin: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || linkedinProfileUrl(value) !== null,
      "invalidLinkedin",
    ),
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
  phone: string;
  telegram: string;
  instagram: string;
  linkedin: string;
  links: readonly string[];
}): ProfileFormValues {
  return {
    fullName: profile.fullName,
    bio: profile.bio,
    school: profile.school,
    gradeYear: profile.gradeYear,
    region: profile.region ?? "",
    city: profile.city,
    languages: [...profile.languages],
    phone: profile.phone,
    telegram: profile.telegram,
    instagram: profile.instagram,
    linkedin: profile.linkedin,
    links: profile.links.join(", "),
  };
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function list(formData: FormData, name: keyof typeof LIST_LIMITS): string[] {
  return [
    ...new Set(
      formData
        .getAll(name)
        .flatMap((value) => (typeof value === "string" ? value.split(/[,\n]/) : []))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ].slice(0, LIST_LIMITS[name]);
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
    phone: text(formData, "phone"),
    telegram: text(formData, "telegram").replace(/^@+/, ""),
    instagram: text(formData, "instagram").replace(/^@+/, ""),
    linkedin: linkedinProfileUrl(text(formData, "linkedin")) ?? "",
    links: list(formData, "links"),
  };
}
