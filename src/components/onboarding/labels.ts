import type { Preferences } from "@/lib/account/types";
import type { FormStep } from "@/lib/onboarding/steps";
import type { ProfileFormValues } from "@/lib/profile/input";
import type { RailState } from "@/components/onboarding/step-rail";

export type OnboardingPreferenceKey = Extract<
  keyof Preferences,
  "remindDeadlines" | "notifyDecisions" | "notifyTelegram" | "profileToOrganisers"
>;

export const ONBOARDING_PREFERENCE_KEYS = [
  "remindDeadlines",
  "notifyDecisions",
  "notifyTelegram",
  "profileToOrganisers",
] as const satisfies readonly OnboardingPreferenceKey[];

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
  fields: Record<
    | Exclude<keyof ProfileFormValues, "gradeYear" | "city" | "skills" | "links">
    | "bioHelp"
    | "languagesHelp"
    | "phoneHelp"
    | "telegramHelp"
    | "regionAny",
    string
  >;
  preferences: Record<OnboardingPreferenceKey, { label: string; description: string }>;
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
