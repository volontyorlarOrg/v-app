import { CloudOff, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { Panel } from "@/components/app/panel";
import { RetryControls, type RetryLabels } from "@/components/app/retry-controls";
import type { LoadFailure } from "@/lib/api/load.server";
import { cn } from "@/lib/utils";

export type LoadErrorLabels = RetryLabels & {
  title: string;
  body: string;
  failedTitle: string;
  failedBody: string;
  section: string;
  reference: string;
};

type Translate = ((key: string) => string) & { raw: (key: string) => string };

export function loadErrorLabels(t: Translate): LoadErrorLabels {
  return {
    title: t("error.title"),
    body: t("error.body"),
    failedTitle: t("error.failedTitle"),
    failedBody: t("error.failedBody"),
    section: t("error.section"),
    retry: t("error.retry"),
    retrying: t.raw("error.retrying"),
    retryingNow: t("error.retryingNow"),
    reference: t.raw("error.reference"),
  };
}

function Icon({
  reason,
  className,
}: {
  reason: LoadFailure["reason"];
  className?: string;
}) {
  const Glyph = reason === "unreachable" ? CloudOff : TriangleAlert;
  return <Glyph aria-hidden="true" className={className} strokeWidth={1.75} />;
}

export function LoadErrorPanel({
  failure,
  labels,
  action,
  className,
}: {
  failure: LoadFailure;
  labels: LoadErrorLabels;
  action?: ReactNode;
  className?: string;
}) {
  const unreachable = failure.reason === "unreachable";

  return (
    <div role="alert" className={cn("mx-auto mt-6 w-full max-w-lg", className)}>
      <Panel className="text-center">
        <span className="mx-auto inline-grid size-14 place-items-center rounded-full bg-surface-soft text-primary-ink">
          <Icon reason={failure.reason} className="size-7" />
        </span>
        <p className="mt-4 text-lg font-semibold text-ink">
          {unreachable ? labels.title : labels.failedTitle}
        </p>
        <p className="mx-auto mt-2 max-w-prose text-sm leading-relaxed text-ink-muted">
          {unreachable ? labels.body : labels.failedBody}
        </p>
        <div className="mt-5">
          {action ?? <RetryControls auto={failure.retryable} labels={labels} />}
        </div>
        {failure.reference ? (
          <p className="tabular mt-4 text-xs text-ink-muted">
            {labels.reference.replace("{id}", failure.reference)}
          </p>
        ) : null}
      </Panel>
    </div>
  );
}

export function LoadErrorRows({
  failure,
  labels,
  className,
}: {
  failure: LoadFailure;
  labels: LoadErrorLabels;
  className?: string;
}) {
  const unreachable = failure.reason === "unreachable";

  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center px-5 py-7 text-center", className)}
    >
      <span className="inline-grid size-11 place-items-center rounded-full bg-surface-soft text-primary-ink">
        <Icon reason={failure.reason} className="size-5" />
      </span>
      <p className="mt-3 font-semibold text-ink">{labels.section}</p>
      <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-muted">
        {unreachable ? labels.body : labels.failedBody}
      </p>
      <RetryControls auto={failure.retryable} labels={labels} className="mt-4" />
      {failure.reference ? (
        <p className="tabular mt-3 text-xs text-ink-muted">
          {labels.reference.replace("{id}", failure.reference)}
        </p>
      ) : null}
    </div>
  );
}
