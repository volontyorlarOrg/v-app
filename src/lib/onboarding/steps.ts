import type { ProfileFields } from "@/lib/profile/completion";
import type { ProfileFormValues } from "@/lib/profile/input";

export const ONBOARDING_STEPS = [
  "welcome",
  "about",
  "place",
  "contact",
  "preferences",
  "done",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const PROFILE_STEPS = ["about", "place", "contact"] as const;
export type ProfileStep = (typeof PROFILE_STEPS)[number];

export const FORM_STEPS = ["about", "place", "contact", "preferences"] as const;
export type FormStep = (typeof FORM_STEPS)[number];
export const FORM_STEP_COUNT = FORM_STEPS.length;

export const PROFILE_STEP_FIELDS = {
  about: ["fullName", "bio"],
  place: ["school", "region", "languages"],
  contact: ["phone", "telegram"],
} as const satisfies Record<ProfileStep, readonly (keyof ProfileFormValues)[]>;

export type StepDirection = "forward" | "back";

export function isOnboardingStep(value: unknown): value is OnboardingStep {
  return (
    typeof value === "string" && (ONBOARDING_STEPS as readonly string[]).includes(value)
  );
}

export function isFormStep(step: OnboardingStep): step is FormStep {
  return (FORM_STEPS as readonly string[]).includes(step);
}

export function isProfileStep(step: OnboardingStep): step is ProfileStep {
  return (PROFILE_STEPS as readonly string[]).includes(step);
}

export function stepIndex(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step);
}

export function nextStep(step: OnboardingStep): OnboardingStep {
  return (
    ONBOARDING_STEPS[Math.min(stepIndex(step) + 1, ONBOARDING_STEPS.length - 1)] ??
    "done"
  );
}

export function previousStep(step: OnboardingStep): OnboardingStep | null {
  if (step === "welcome" || step === "done") return null;
  return ONBOARDING_STEPS[stepIndex(step) - 1] ?? null;
}

export function formStepNumber(step: FormStep): number {
  return FORM_STEPS.indexOf(step) + 1;
}

export function completedFormSteps(step: OnboardingStep): number {
  return FORM_STEPS.filter((candidate) => stepIndex(candidate) < stepIndex(step))
    .length;
}

export type PassParts = {
  name: boolean;
  place: boolean;
  languages: boolean;
  contact: boolean;
  preferences: boolean;
  sealed: boolean;
};

export const PASS_PART_KEYS = [
  "name",
  "place",
  "languages",
  "contact",
  "preferences",
  "sealed",
] as const satisfies readonly (keyof PassParts)[];

export function passParts(profile: ProfileFields, step: OnboardingStep): PassParts {
  return {
    name: profile.fullName.trim().length >= 2,
    place: profile.school.trim().length > 0 || profile.region !== null,
    languages: profile.languages.length > 0,
    contact: profile.phone.trim().length > 0 || profile.telegram.trim().length > 0,
    preferences: stepIndex(step) > stepIndex("preferences"),
    sealed: step === "done",
  };
}
