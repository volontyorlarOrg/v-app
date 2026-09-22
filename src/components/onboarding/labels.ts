import type { FormStep } from "@/lib/onboarding/steps";
import type { ProfileFormValues } from "@/lib/profile/input";
import type { RailState } from "@/components/onboarding/step-rail";

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
    | keyof ProfileFormValues
    | "bioHelp"
    | "languagesHelp"
    | "languagesSearch"
    | "languagesEmpty"
    | "languagesCommon"
    | "languagesAll"
    | "languagesRemove"
    | "languagesLimit"
    | "phoneHelp"
    | "telegramHelp"
    | "instagramHelp"
    | "linkedinHelp"
    | "linksHelp"
    | "regionAny",
    string
  >;
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
