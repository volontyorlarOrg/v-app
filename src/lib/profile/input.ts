import { z } from "zod";

import { REGIONS, type Region } from "@/lib/opportunities/types";
import {
  EDUCATION_TYPES,
  isEducationType,
  needsInstitution,
  type EducationType,
} from "@/lib/profile/place";
import { linkedinProfileUrl } from "@/lib/profile/social-links";
export type ProfileInput = {
  fullName: string;
  bio: string;
  gradeYear: string;
  region: Region | null;
  districtId: string | null;
  educationType: EducationType | null;
  institutionId: string | null;
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
  gradeYear: 40,
} as const;

const DISTRICT_ID = /^\d{7}$/;

export const PROFILE_NAME_MIN_LENGTH = 2;

export const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
export const TELEGRAM_USERNAME_PATTERN = /^[A-Za-z0-9_]{5,32}$/;

export function normalizePhone(value: string): string {
  const compact = value.trim().replace(/[\s().-]/g, "");
  return compact.startsWith("00") ? `+${compact.slice(2)}` : compact;
}

export function normalizeTelegram(value: string): string {
  return value.trim().replace(/^@+/, "");
}

const boundedText = (max: number) => z.string().trim().max(max, "tooLong");

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "required")
    .min(PROFILE_NAME_MIN_LENGTH, "tooShort")
    .max(PROFILE_TEXT_LIMITS.fullName, "tooLong"),
  bio: boundedText(PROFILE_TEXT_LIMITS.bio),
  gradeYear: boundedText(PROFILE_TEXT_LIMITS.gradeYear),
  region: z.union([z.literal(""), z.enum(REGIONS)]),
  districtId: z.string().refine((value) => value === "" || DISTRICT_ID.test(value)),
  educationType: z.union([z.literal(""), z.enum(EDUCATION_TYPES)]),
  institutionId: z.string().max(80),
  languages: z.array(z.string().trim().min(1).max(35)).max(LIST_LIMITS.languages),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || PHONE_PATTERN.test(normalizePhone(value)),
      "invalidPhone",
    ),
  telegram: z
    .string()
    .trim()
    .refine((value) => {
      const username = normalizeTelegram(value);
      return username === "" || TELEGRAM_USERNAME_PATTERN.test(username);
    }, "invalidTelegram"),
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

type PlaceValues = Pick<
  ProfileFormValues,
  "region" | "districtId" | "educationType" | "institutionId" | "gradeYear"
>;

export function placeIssues(values: PlaceValues) {
  const issues: { path: keyof PlaceValues; message: string }[] = [];
  if (!values.region) issues.push({ path: "region", message: "required" });
  if (!values.districtId) issues.push({ path: "districtId", message: "required" });
  if (!values.educationType)
    issues.push({ path: "educationType", message: "required" });
  if (needsInstitution(values.educationType) && !values.institutionId)
    issues.push({ path: "institutionId", message: "required" });
  if (needsInstitution(values.educationType) && !values.gradeYear.trim())
    issues.push({ path: "gradeYear", message: "required" });
  return issues;
}

export const requiredPlaceFormSchema = profileFormSchema.superRefine(
  (values, context) => {
    for (const issue of placeIssues(values)) {
      context.addIssue({ code: "custom", path: [issue.path], message: issue.message });
    }
  },
);

export const placeFormSchema = profileFormSchema
  .pick({
    region: true,
    districtId: true,
    educationType: true,
    institutionId: true,
    gradeYear: true,
  })
  .superRefine((values, context) => {
    for (const issue of placeIssues(values)) {
      context.addIssue({ code: "custom", path: [issue.path], message: issue.message });
    }
  });

export type PlaceFormValues = z.input<typeof placeFormSchema>;

export function placeFormValues(profile: {
  region: Region | null;
  districtId: string | null;
  educationType: EducationType | null;
  institutionId: string | null;
  gradeYear: string;
}): PlaceFormValues {
  return {
    region: profile.region ?? "",
    districtId: profile.districtId ?? "",
    educationType: profile.educationType ?? "",
    institutionId: profile.institutionId ?? "",
    gradeYear: profile.educationType === "gap_year" ? "" : profile.gradeYear,
  };
}

export function profileFormValues(profile: {
  fullName: string;
  bio: string;
  gradeYear: string;
  region: Region | null;
  districtId: string | null;
  educationType: EducationType | null;
  institutionId: string | null;
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
    gradeYear: profile.educationType === "gap_year" ? "" : profile.gradeYear,
    region: profile.region ?? "",
    districtId: profile.districtId ?? "",
    educationType: profile.educationType ?? "",
    institutionId: profile.institutionId ?? "",
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

export type PlaceInput = {
  districtId: string | null;
  educationType: EducationType | null;
  institutionId: string | null;
  gradeYear: string;
};

export function placeInputFromFormData(formData: FormData): PlaceInput {
  const districtId = text(formData, "districtId");
  const education = text(formData, "educationType");
  const educationType = isEducationType(education) ? education : null;
  const institutionId = needsInstitution(educationType)
    ? text(formData, "institutionId") || null
    : null;
  return {
    districtId: DISTRICT_ID.test(districtId) ? districtId : null,
    educationType,
    institutionId,
    gradeYear: educationType === "gap_year" ? "" : text(formData, "gradeYear"),
  };
}

export function placeSubmissionFromFormData(formData: FormData) {
  return { region: region(formData), ...placeInputFromFormData(formData) };
}

export function profileInputFromFormData(formData: FormData): ProfileInput {
  return {
    fullName: text(formData, "fullName"),
    bio: text(formData, "bio"),
    region: region(formData),
    ...placeInputFromFormData(formData),
    languages: list(formData, "languages"),
    phone: normalizePhone(text(formData, "phone")),
    telegram: normalizeTelegram(text(formData, "telegram")),
    instagram: text(formData, "instagram").replace(/^@+/, ""),
    linkedin: linkedinProfileUrl(text(formData, "linkedin")) ?? "",
    links: list(formData, "links"),
  };
}
