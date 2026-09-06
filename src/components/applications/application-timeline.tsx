import { Check } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { applicationTimeline, type ApplicationDetail } from "@/lib/applications/status";
import { cn } from "@/lib/utils";

export function ApplicationTimeline({
  application,
}: {
  application: ApplicationDetail;
}) {
  const t = useTranslations("applications");
  const format = useFormatter();
  const entries = applicationTimeline(application);

  return (
    <ol className="grid gap-4 sm:grid-cols-3">
      {entries.map((entry) => {
        const decidedDone = entry.step === "decided" && entry.state === "done";
        const label = decidedDone
          ? t(`status.${application.status}`)
          : t(`detail.steps.${entry.step}`);
        const achievement = decidedDone && application.status === "accepted";

        return (
          <li key={entry.step} className="flex gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 inline-grid size-6 shrink-0 place-items-center rounded-full",
                entry.state === "done" && (achievement ? "bg-accent" : "bg-action"),
                entry.state === "current" && "border-2 border-primary bg-surface",
                entry.state === "pending" && "border border-border-control bg-surface",
              )}
            >
              {entry.state === "done" ? (
                <Check className="size-3.5 text-knockout" />
              ) : entry.state === "current" ? (
                <span className="size-2 rounded-full bg-primary" />
              ) : null}
            </span>
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  entry.state === "pending" ? "text-ink-muted" : "text-ink",
                  achievement && "text-accent-ink",
                )}
              >
                {label}
              </p>
              <p className="tabular mt-0.5 text-xs text-ink-muted">
                {entry.at
                  ? format.dateTime(new Date(entry.at), "day")
                  : entry.state === "current"
                    ? t("detail.inProgress")
                    : t("detail.pending")}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
