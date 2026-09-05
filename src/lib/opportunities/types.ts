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

export function isRegion(value: unknown): value is Region {
  return typeof value === "string" && (REGIONS as readonly string[]).includes(value);
}

export const OPPORTUNITY_FORMATS = ["onsite", "remote", "hybrid"] as const;
export type OpportunityFormat = (typeof OPPORTUNITY_FORMATS)[number];

export const OPPORTUNITY_STATUSES = ["open", "closed", "full"] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  verified: boolean;
};

export type OpportunitySummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  organization: Organization;
  region: Region;
  city?: string;
  locationName?: string;
  format: OpportunityFormat;
  status: OpportunityStatus;
  startsAt: string;
  endsAt?: string;
  applicationDeadline: string;
  imageUrl?: string;
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

export type QuestionOption = { value: string; label: string };

export type ApplicationQuestion = {
  id: string;
  prompt: string;
  helpText?: string;
  type: QuestionType;
  required: boolean;
  maxLength?: number;
  options?: QuestionOption[];
};

export type OpportunityDetail = OpportunitySummary & {
  description: string;
  requirements: string[];
  questions: ApplicationQuestion[];
  sourcedByTeam: boolean;
};
