import { z } from "zod";
import { regionSchema } from "@/features/opportunities/schemas";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "tooShort" })
    .max(120, { message: "tooLong" }),

  bio: z.string().trim().max(600, { message: "tooLong" }).default(""),

  school: z.string().trim().max(160, { message: "tooLong" }).default(""),
  gradeYear: z.string().trim().max(40, { message: "tooLong" }).default(""),

  region: regionSchema.nullable().default(null),
  city: z.string().trim().max(80, { message: "tooLong" }).default(""),

  languages: z.array(z.string().trim().min(1)).max(10).default([]),
  skills: z.array(z.string().trim().min(1)).max(20).default([]),

  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, { message: "invalidPhone" })
    .or(z.literal(""))
    .default(""),

  telegram: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]{5,32}$/, { message: "invalidTelegram" })
    .or(z.literal(""))
    .default(""),

  links: z
    .array(z.url({ message: "invalidUrl" }))
    .max(3)
    .default([]),
});

export type ProfileInput = z.output<typeof profileSchema>;

export type ProfileFormValues = z.input<typeof profileSchema>;

export const profileSchemaResponse = profileSchema.extend({
  phoneVerified: z.boolean().default(false),
  updatedAt: z.iso.datetime({ offset: true }).optional(),
});

export type Profile = z.infer<typeof profileSchemaResponse>;

export const EMPTY_PROFILE: ProfileInput = {
  fullName: "",
  bio: "",
  school: "",
  gradeYear: "",
  region: null,
  city: "",
  languages: [],
  skills: [],
  phone: "",
  telegram: "",
  links: [],
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

function isFilled(profile: ProfileInput, field: CompletionField): boolean {
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

export function profileCompletion(profile: ProfileInput): ProfileCompletion {
  const missing = COMPLETION_FIELDS.filter((field) => !isFilled(profile, field));
  const filled = COMPLETION_FIELDS.length - missing.length;

  return {
    percent: Math.round((filled / COMPLETION_FIELDS.length) * 100),
    complete: missing.length === 0,
    missing,
  };
}
