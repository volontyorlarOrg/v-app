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
    | Exclude<keyof ProfileFormValues, "gradeYear" | "city" | "links">
    | "bioHelp"
    | "languagesHelp"
    | "phoneHelp"
    | "telegramHelp"
    | "regionAny",
    string
  >;
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
