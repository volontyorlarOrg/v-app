import type { FormStep } from "@/lib/onboarding/steps";
import type { RailState } from "@/components/onboarding/step-rail";
import type { PlaceLabels } from "@/components/profile/place-fields";

export const ONBOARDING_FIELD_KEYS = [
  "fullName",
  "bio",
  "bioHelp",
  "languages",
  "languagesHelp",
  "languagesSearch",
  "languagesEmpty",
  "languagesCommon",
  "languagesAll",
  "languagesRemove",
  "languagesLimit",
  "phone",
  "phoneHelp",
  "telegram",
  "telegramHelp",
  "instagram",
  "instagramHelp",
  "linkedin",
  "linkedinHelp",
  "links",
  "linksHelp",
] as const;

export type OnboardingLabels = {
  stepCount: string;
  skipForNow: string;
  skipStep: string;
  back: string;
  continue: string;
  saving: string;
  start: string;
  saveError: string;
  nameNeeded: string;
  fieldInvalid: string;
  welcome: { title: string; body: string };
  steps: Record<FormStep, { title: string; lead: string }>;
  rail: {
    label: string;
    states: Record<RailState, string>;
    items: Record<FormStep, string>;
  };
  fields: Record<(typeof ONBOARDING_FIELD_KEYS)[number], string>;
  place: PlaceLabels;
  placeRequired: string;
  optional: string;
  usernameStep: {
    field: string;
    hint: string;
    fromTelegram: string;
    address: string;
    addressPlaceholder: string;
    errors: Record<string, string>;
  };
  done: {
    title: string;
    complete: string;
    incomplete: string;
    finishOnProfile: string;
    nextTitle: string;
    next: { apply: string; attend: string; confirm: string };
    cta: string;
    dashboard: string;
  };
};
