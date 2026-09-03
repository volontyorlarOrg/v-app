import type { Locale } from "@/i18n/routing";

export const REGIONS = [
  "andijan",
  "bukhara",
  "fergana",
  "jizzakh",
  "kashkadarya",
  "khorezm",
  "namangan",
  "navoiy",
  "samarkand",
  "sirdaryo",
  "surkhandarya",
  "tashkent-region",
  "tashkent-city",
  "karakalpakstan",
] as const;

export type Region = (typeof REGIONS)[number];

export const OPPORTUNITY_FORMATS = ["onsite", "remote", "hybrid"] as const;
export type OpportunityFormat = (typeof OPPORTUNITY_FORMATS)[number];

export const OPPORTUNITY_STATUSES = ["open", "closed", "full"] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export type LocalizedText = Record<Locale, string>;

export function localized(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

export type Organization = {
  id: string;
  name: LocalizedText;
  verified: boolean;
};

export type OpportunitySummary = {
  id: string;
  slug: string;
  title: LocalizedText;
  organization: Organization;
  region: Region;
  city?: LocalizedText;
  locationName?: LocalizedText;
  format: OpportunityFormat;
  status: OpportunityStatus;
  startsAt: string;
  endsAt?: string;
  applicationDeadline: string;
  capacity?: number;
  spotsRemaining?: number;
};

export const QUESTION_TYPES = [
  "short_text",
  "long_text",
  "single_select",
  "multi_select",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export type QuestionOption = { value: string; label: LocalizedText };

export type ApplicationQuestion = {
  id: string;
  prompt: LocalizedText;
  help?: LocalizedText;
  type: QuestionType;
  required: boolean;
  maxLength?: number;
  options?: QuestionOption[];
};

export type OpportunityDetail = OpportunitySummary & {
  description: LocalizedText;
  requirements: LocalizedText[];
  questions: ApplicationQuestion[];
  sourcedByTeam: boolean;
};
