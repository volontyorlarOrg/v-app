"use client";

import { IdCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import {
  StepRail,
  type RailItem,
  type RailState,
} from "@/components/onboarding/step-rail";
import { Button, buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  onboardingStateSnapshot,
  publishOnboardingState,
  subscribeToOnboardingState,
} from "@/lib/onboarding/client-store";
import {
  isOnboardingOpen,
  parseOnboardingState,
  readOnboardingStateFromClient,
  resumeStep,
} from "@/lib/onboarding/state";
import { FORM_STEPS, completedFormSteps, type FormStep } from "@/lib/onboarding/steps";
import { navHref } from "@/lib/routing/routes";

export type OnboardingResumeLabels = {
  title: string;
  /** One sentence per number of finished steps, indexed by that number. */
  bodyByDone: readonly string[];
  continue: string;
  dismiss: string;
  rail: string;
  steps: Record<FormStep, string>;
  states: Record<RailState, string>;
};

export function OnboardingResume({
  serverState,
  labels,
}: {
  serverState: string | null;
  labels: OnboardingResumeLabels;
}) {
  const router = useRouter();
  const serialized = useSyncExternalStore(
    subscribeToOnboardingState,
    onboardingStateSnapshot,
    () => serverState,
  );

  // The cookie is what the server could see; localStorage is the record that
  // outlives it. Whichever lagged gets the settled answer written back.
  useEffect(() => {
    readOnboardingStateFromClient();
  }, [serialized]);

  const state = parseOnboardingState(serialized);

  function dismiss() {
    publishOnboardingState({ status: "done" });
    router.refresh();
  }

  if (!isOnboardingOpen(state)) return null;

  const done = completedFormSteps(resumeStep(state));
  const items: RailItem[] = FORM_STEPS.map((key, index) => ({
    key,
    number: index + 1,
    label: labels.steps[key],
    state: index < done ? "done" : index === done ? "current" : "upcoming",
  }));

  return (
    <section
      aria-labelledby="onboarding-resume-title"
      className="enter-rise mt-6 flex flex-col gap-4 rounded-xl border border-border bg-surface px-5 py-4 [--enter-delay:220ms] sm:flex-row sm:items-center"
    >
      <span
        aria-hidden="true"
        className="hidden size-11 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary-ink sm:inline-flex"
      >
        <IdCard className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2
          id="onboarding-resume-title"
          className="font-sans text-base font-semibold text-ink"
        >
          {labels.title}
        </h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          {labels.bodyByDone[done] ?? labels.bodyByDone[0]}
        </p>
        <StepRail
          items={items}
          label={labels.rail}
          stateLabels={labels.states}
          layout="strip"
          className="mt-3 max-w-60"
        />
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Link href={navHref("welcome")} className={buttonClass({ size: "sm" })}>
          {labels.continue}
        </Link>
        <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
          {labels.dismiss}
        </Button>
      </div>
    </section>
  );
}
