"use client";

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
      className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-surface px-5 py-4 shadow-panel sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <h2 id="onboarding-resume-title" className="text-sm font-semibold text-ink">
          {labels.title}
        </h2>
        <p className="text-sm text-ink-muted">
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
