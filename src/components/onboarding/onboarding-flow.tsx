"use client";

import { BadgeCheck, CalendarCheck, CircleCheck, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type { OnboardingLabels } from "@/components/onboarding/labels";
import { PassStage } from "@/components/onboarding/pass-stage";
import { ProfileStepForm } from "@/components/onboarding/profile-step-form";
import { StepRail, type RailItem } from "@/components/onboarding/step-rail";
import { UsernameStepForm } from "@/components/onboarding/username-step-form";
import { Button, buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { UsernameIdentity } from "@/lib/account/username";
import { writeOnboardingStateToClient } from "@/lib/onboarding/state";
import {
  FORM_STEPS,
  FORM_STEP_COUNT,
  formStepNumber,
  isFormStep,
  isProfileStep,
  nextStep,
  passParts,
  previousStep,
  stepIndex,
  type OnboardingStep,
  type StepDirection,
} from "@/lib/onboarding/steps";
import {
  EMPTY_PROFILE,
  profileCompletion,
  type CompletionField,
  type VolunteerProfile,
} from "@/lib/profile/completion";
import type { LanguageOption } from "@/lib/profile/languages";
import { navHref } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

function usernameGate(step: OnboardingStep): OnboardingStep {
  return stepIndex(step) > stepIndex("username") ? "username" : step;
}

export function OnboardingFlow({
  title,
  lead,
  initialStep,
  initialValues,
  profileSaved,
  next,
  regions,
  languageOptions,
  username,
  addressPrefix,
  labels,
  completionFields,
}: {
  title: string;
  lead: string;
  initialStep: OnboardingStep;
  initialValues: VolunteerProfile;
  profileSaved: boolean;
  next: string | null;
  regions: readonly { value: string; label: string }[];
  languageOptions: readonly LanguageOption[];
  username: UsernameIdentity;
  addressPrefix: string | null;
  labels: OnboardingLabels;
  completionFields: Record<CompletionField, string>;
}) {
  const [requested, setStep] = useState<OnboardingStep>(initialStep);
  const [direction, setDirection] = useState<StepDirection>("forward");
  const [values, setValues] = useState(initialValues);
  const [saved, setSaved] = useState<VolunteerProfile>(
    profileSaved ? initialValues : EMPTY_PROFILE,
  );
  const usernameRequired = username.source === "generated";
  const step = usernameRequired ? usernameGate(requested) : requested;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  const parts = useMemo(() => passParts(saved, step), [saved, step]);
  const completion = useMemo(() => profileCompletion(values), [values]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const exitHref = next ?? navHref("dashboard");
  const ctaHref = next ?? navHref("opportunities");

  function go(to: OnboardingStep, dir: StepDirection) {
    setDirection(dir);
    setStep(to);
    writeOnboardingStateToClient(
      to === "done" ? { status: "done" } : { status: "pending", step: to },
    );
  }

  const advance = () => go(nextStep(step), "forward");
  const retreat = () => {
    const previous = previousStep(step);
    if (previous) go(previous, "back");
  };
  const skipForNow = () => writeOnboardingStateToClient({ status: "skipped", step });

  const railItems: RailItem[] = FORM_STEPS.map((key) => ({
    key,
    number: formStepNumber(key),
    label: labels.rail.items[key],
    state:
      stepIndex(key) < stepIndex(step) ? "done" : key === step ? "current" : "upcoming",
  }));

  const skipLink = usernameRequired ? null : (
    <a
      href={exitHref}
      onClick={skipForNow}
      className="inline-flex min-h-8 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      {labels.skipForNow}
    </a>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-start lg:gap-12 xl:gap-16">
      <div className="min-w-0">
        <h1 className="text-3xl text-balance">{title}</h1>
        <p className="mt-2 max-w-md text-sm text-pretty text-ink-muted">{lead}</p>
        <div className="mt-6 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center xl:gap-8">
          <PassStage parts={parts} className="" />
          <StepRail
            items={railItems}
            label={labels.rail.label}
            stateLabels={labels.rail.states}
            className="mt-6 xl:mt-0"
          />
        </div>
      </div>

      <section
        aria-labelledby="onboarding-step-title"
        className="min-w-0 rounded-lg border border-border bg-surface p-5 sm:p-6 xl:self-center"
      >
        <div key={step} className="onboarding-step" data-direction={direction}>
          {isFormStep(step) ? (
            <div className="mb-3 flex min-h-8 items-center justify-between gap-4">
              <p className="tabular text-sm text-ink-muted">
                {fill(labels.stepCount, {
                  step: formStepNumber(step),
                  total: FORM_STEP_COUNT,
                })}
              </p>
              {skipLink}
            </div>
          ) : null}

          <h2
            id="onboarding-step-title"
            ref={headingRef}
            tabIndex={-1}
            className="text-xl text-balance"
          >
            {step === "welcome"
              ? labels.welcome.title
              : step === "done"
                ? labels.done.title
                : labels.steps[step].title}
          </h2>

          {step === "welcome" ? (
            <WelcomeBody labels={labels} onStart={advance} skipLink={skipLink} />
          ) : null}

          {step === "username" ? (
            <>
              <StepLead>{labels.steps.username.lead}</StepLead>
              <UsernameStepForm
                identity={username}
                addressPrefix={addressPrefix}
                labels={labels}
                onContinue={() => go(nextStep("username"), "forward")}
                onBack={retreat}
              />
            </>
          ) : null}

          {isProfileStep(step) ? (
            <>
              <StepLead>{labels.steps[step].lead}</StepLead>
              <ProfileStepForm
                step={step}
                values={values}
                languageOptions={languageOptions}
                regions={regions}
                labels={labels}
                onSaved={(profile) => {
                  setValues(profile);
                  setSaved(profile);
                  advance();
                }}
                onSkip={advance}
                onBack={retreat}
              />
            </>
          ) : null}

          {step === "done" ? (
            <DoneBody
              labels={labels}
              complete={completion.complete}
              percent={completion.percent}
              missing={completion.missing.map((field) => completionFields[field])}
              ctaHref={ctaHref}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

function StepLead({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-sm text-pretty text-ink-muted">{children}</p>;
}

function WelcomeBody({
  labels,
  onStart,
  skipLink,
}: {
  labels: OnboardingLabels;
  onStart: () => void;
  skipLink: ReactNode;
}) {
  return (
    <>
      <StepLead>{labels.welcome.body}</StepLead>
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
        <Button type="button" onClick={onStart}>
          {labels.start}
        </Button>
        {skipLink}
      </div>
    </>
  );
}

const NEXT_STEPS = [
  { key: "apply", Icon: Send, achievement: false },
  { key: "attend", Icon: CalendarCheck, achievement: false },
  { key: "confirm", Icon: BadgeCheck, achievement: true },
] as const;

function DoneBody({
  labels,
  complete,
  percent,
  missing,
  ctaHref,
}: {
  labels: OnboardingLabels;
  complete: boolean;
  percent: number;
  missing: readonly string[];
  ctaHref: string;
}) {
  return (
    <>
      {complete ? (
        <p className="mt-2 flex items-start gap-2 text-sm font-medium text-ink">
          <CircleCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-accent"
          />
          <span>{labels.done.complete}</span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-pretty text-ink">
          {fill(labels.done.incomplete, { percent, fields: missing.join(", ") })}{" "}
          <Link
            href={navHref("profileEdit")}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {labels.done.finishOnProfile}
          </Link>
        </p>
      )}

      <h3 className="mt-6 text-sm font-medium text-ink">{labels.done.nextTitle}</h3>
      <ol className="mt-2 divide-y divide-border border-y border-border">
        {NEXT_STEPS.map(({ key, Icon, achievement }, index) => (
          <li key={key} className="flex items-start gap-3 py-3">
            <span
              className={cn(
                "mt-0.5 shrink-0",
                achievement ? "text-accent" : "text-ink-muted",
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
              <span className="sr-only">{index + 1}</span>
            </span>
            <p className="min-w-0 text-sm text-ink">{labels.done.next[key]}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
        <a href={ctaHref} className={buttonClass()}>
          {labels.done.cta}
        </a>
        <Link
          href={navHref("dashboard")}
          className={buttonClass({ variant: "ghost", size: "sm" })}
        >
          {labels.done.dashboard}
        </Link>
      </div>
    </>
  );
}
