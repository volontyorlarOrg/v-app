"use client";

import { ArrowRight, BadgeCheck, CalendarCheck, CircleCheck, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { UsernameSection } from "@/components/account/username-section";
import { SplitWords } from "@/components/motion/scene";
import type { OnboardingLabels } from "@/components/onboarding/labels";
import { PassStage } from "@/components/onboarding/pass-stage";
import { ProfileStepForm } from "@/components/onboarding/profile-step-form";
import { StepRail, type RailItem } from "@/components/onboarding/step-rail";
import { Button, buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
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
import { localePath, navHref } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export function OnboardingFlow({
  locale,
  title,
  lead,
  initialStep,
  initialValues,
  profileSaved,
  next,
  regions,
  username,
  labels,
  completionFields,
}: {
  locale: Locale;
  title: string;
  lead: string;
  initialStep: OnboardingStep;
  initialValues: VolunteerProfile;
  profileSaved: boolean;
  next: string | null;
  regions: readonly { value: string; label: string }[];
  username: UsernameIdentity | null;
  labels: OnboardingLabels;
  completionFields: Record<CompletionField, string>;
}) {
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [direction, setDirection] = useState<StepDirection>("forward");
  const [values, setValues] = useState(initialValues);
  const [saved, setSaved] = useState<VolunteerProfile>(
    profileSaved ? initialValues : EMPTY_PROFILE,
  );
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

  const exitHref = next ?? localePath(locale, "dashboard");
  const ctaHref = next ?? localePath(locale, "opportunities");

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

  const skipLink = (
    <a
      href={exitHref}
      onClick={skipForNow}
      className="inline-flex min-h-8 items-center text-sm font-semibold text-primary-ink underline-offset-4 hover:underline"
    >
      {labels.skipForNow}
    </a>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:items-start lg:gap-14 xl:gap-20">
      <div className="min-w-0">
        <div className="hero-copy">
          <h1 className="greeting-display enter-words [--enter-delay:120ms]">
            <SplitWords text={title} />
          </h1>
          <p className="enter-rise mt-4 max-w-md text-lead text-pretty text-ink-muted [--enter-delay:360ms]">
            {lead}
          </p>
        </div>
        <div className="mt-6 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center xl:gap-8">
          <PassStage parts={parts} className="enter-rise [--enter-delay:440ms]" />
          <StepRail
            items={railItems}
            label={labels.rail.label}
            stateLabels={labels.rail.states}
            className="enter-rise mt-6 [--enter-delay:560ms] xl:mt-0"
          />
        </div>
      </div>

      <section
        aria-labelledby="onboarding-step-title"
        className="enter-rise min-w-0 rounded-2xl border border-border bg-surface p-5 [--enter-delay:520ms] sm:p-7 xl:self-center"
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
            className="text-2xl leading-[1.18] tracking-[-0.02em] text-balance sm:text-3xl"
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

          {isProfileStep(step) ? (
            <>
              <StepLead>{labels.steps[step].lead}</StepLead>
              <ProfileStepForm
                step={step}
                values={values}
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
              locale={locale}
              labels={labels}
              complete={completion.complete}
              percent={completion.percent}
              missing={completion.missing.map((field) => completionFields[field])}
              username={username}
              ctaHref={ctaHref}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

function StepLead({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-pretty text-ink-muted">{children}</p>;
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
      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-5">
        <Button type="button" size="sm" onClick={onStart} className="min-w-36">
          {labels.start}
          <ArrowRight aria-hidden="true" className="size-4" />
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
  locale,
  labels,
  complete,
  percent,
  missing,
  username,
  ctaHref,
}: {
  locale: Locale;
  labels: OnboardingLabels;
  complete: boolean;
  percent: number;
  missing: readonly string[];
  username: UsernameIdentity | null;
  ctaHref: string;
}) {
  return (
    <>
      {complete ? (
        <p className="mt-3 flex items-start gap-2 font-semibold text-accent-ink">
          <CircleCheck aria-hidden="true" className="mt-1 size-4 shrink-0" />
          <span>{labels.done.complete}</span>
        </p>
      ) : (
        <p className="mt-3 text-pretty text-ink">
          {fill(labels.done.incomplete, { percent, fields: missing.join(", ") })}{" "}
          <Link
            href={navHref("profile")}
            className="font-semibold text-primary-ink underline-offset-4 hover:underline"
          >
            {labels.done.finishOnProfile}
          </Link>
        </p>
      )}

      {username ? (
        <div className="mt-6 rounded-xl border border-border bg-surface-sunk p-4 sm:p-5">
          <UsernameSection locale={locale} identity={username} labels={labels.username} />
        </div>
      ) : null}

      <h3 className="mt-7 font-sans text-sm font-semibold text-ink">
        {labels.done.nextTitle}
      </h3>
      <ol className="mt-2 divide-y divide-border border-y border-border">
        {NEXT_STEPS.map(({ key, Icon, achievement }, index) => (
          <li key={key} className="flex items-start gap-4 py-3.5">
            <span
              className={cn(
                "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                achievement
                  ? "bg-surface text-accent-ink ring-1 ring-accent/50"
                  : "bg-surface-soft text-primary-ink",
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
              <span className="sr-only">{index + 1}</span>
            </span>
            <p className="min-w-0 pt-1 text-sm leading-relaxed text-ink">
              {labels.done.next[key]}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
        <a
          href={ctaHref}
          className={buttonClass({ size: "sm", className: "min-w-44" })}
        >
          {labels.done.cta}
          <ArrowRight aria-hidden="true" className="size-4" />
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
