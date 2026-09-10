"use client";

import { IdCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  StepRail,
  type RailItem,
  type RailState,
} from "@/components/onboarding/step-rail";
import { Button, buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { writeOnboardingStateToDocument } from "@/lib/onboarding/state";
import { navHref } from "@/lib/routing/routes";

export function OnboardingResume({
  steps,
  labels,
}: {
  steps: readonly RailItem[];
  labels: {
    title: string;
    body: string;
    continue: string;
    dismiss: string;
    rail: string;
    states: Record<RailState, string>;
  };
}) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  function dismiss() {
    writeOnboardingStateToDocument({ status: "done" });
    setDismissed(true);
    router.refresh();
  }

  if (dismissed) return null;

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
        <p className="mt-0.5 text-sm text-ink-muted">{labels.body}</p>
        <StepRail
          items={steps}
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
