import { z } from "zod";
import { regionSchema } from "@/features/opportunities/schemas";

/**
 * Volunteer profile — the reusable half of an application.
 *
 * Two things this file is careful about, because YVC serves young people and
 * potentially minors (handoff §26):
 *
 *   - Every field earns its place by being needed for an application or for an
 *     organiser to contact someone. There is no date of birth, no address, no
 *     document number, no parent contact — none of those have a stated product
 *     use, and collecting them "for later" is exactly what §26 forbids.
 *   - Nothing here is a trusted identity field. `userId` is absent by design:
 *     it comes from the session, never from a submitted form.
 *
 * @see docs/features/volunteer-profile.md
 */

/**
 * Error messages are validation-namespace keys, translated at render time.
 * A schema cannot call `useTranslations`, and hard-coding English here would
 * put untranslatable copy in front of Uzbek and Russian speakers.
 */
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

  /**
   * E.164. Uzbek numbers are +998 followed by nine digits, but the pattern
   * stays general so a volunteer with a foreign number is not locked out.
   */
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

/**
 * The parsed profile — every field present, because the schema fills defaults.
 * This is what the server action and the API layer work with.
 */
export type ProfileInput = z.output<typeof profileSchema>;

/**
 * The profile as a *form* holds it, before parsing.
 *
 * Distinct from `ProfileInput` because `.default()` makes a field optional on
 * the way in and guaranteed on the way out. React Hook Form needs the input
 * type for its values and the output type for what the submit handler
 * receives; conflating them is what makes the resolver types disagree.
 */
export type ProfileFormValues = z.input<typeof profileSchema>;

/** What the backend returns, including fields the volunteer cannot set. */
export const profileSchemaResponse = profileSchema.extend({
  /** Whether the phone number was verified (e.g. shared through Telegram). */
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

/**
 * The fields that count toward completion, and their weight.
 *
 * The handoff permits a completion indicator only if the model is explicitly
 * defined — so it is, here, once. "Complete" means "an organiser can evaluate
 * and contact you", which is why a contact method and a region are required
 * and a portfolio link is not.
 */
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
    // Either channel is enough. Requiring both would force a volunteer without
    // Telegram to hand over a phone number they had no reason to give.
    case "contact":
      return profile.phone.trim().length > 0 || profile.telegram.trim().length > 0;
  }
}

export type ProfileCompletion = {
  /** 0–100, rounded. */
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
