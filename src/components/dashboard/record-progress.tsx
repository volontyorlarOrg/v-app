import { useTranslations } from "next-intl";

import { Progress } from "@/components/ui/progress";
import {
  LEVELS,
  LEVEL_THRESHOLDS,
  levelProgress,
  reachedLevels,
  type VolunteerRecord,
} from "@/lib/record/levels";
import { cn } from "@/lib/utils";

export function RecordProgress({ record }: { record: VolunteerRecord }) {
  const t = useTranslations("record");
  const progress = levelProgress(record.counts, record.level);
  const reached = new Set(reachedLevels(progress.current));

  const needed = progress.next ? LEVEL_THRESHOLDS[progress.next].events : null;
  const done = needed === null ? null : Math.min(record.counts.attended, needed);
  const nextText = !progress.next
    ? t("next.top")
    : progress.eventsNeeded !== null
      ? t("next.progress", { done: done ?? 0, needed: needed ?? 0 })
      : progress.blockedByReview
        ? t("next.review")
        : t("next.reliability", {
            percent: Math.round(LEVEL_THRESHOLDS[progress.next].reliability * 100),
          });

  return (
    <>
      <div className="dashboard-hero-meter">
        <ol aria-label={t("level.railLabel")} className="grid grid-cols-4 gap-2">
          {LEVELS.map((level, index) => {
            const isReached = reached.has(level);
            const isCurrent = level === progress.current;
            return (
              <li key={level} className="relative min-w-0 pt-5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-0 left-0 size-3.5 rounded-full",
                    isReached ? "bg-accent" : "border border-border-control",
                  )}
                />
                {index < LEVELS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-[0.4375rem] -right-0.5 left-5 h-px bg-border-control/70"
                  />
                ) : null}
                <span
                  className={cn(
                    "block text-xs leading-snug font-semibold hyphens-auto max-[22.5rem]:text-[0.6875rem] max-[22.5rem]:tracking-[-0.01em]",
                    isReached ? "text-accent-ink" : "text-ink-muted",
                  )}
                >
                  {t(`level.${level}`)}
                  {isCurrent ? (
                    <span className="sr-only"> ({t("level.current")})</span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>

        {progress.next && needed !== null && done !== null ? (
          <div className="mt-5">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="font-semibold text-ink">
                {t("next.label", { level: t(`level.${progress.next}`) })}
              </span>
              <span className="tabular text-ink-muted">
                {done}/{needed}
              </span>
            </div>
            <Progress
              value={done}
              max={needed}
              valueText={nextText}
              aria-label={t("next.label", { level: t(`level.${progress.next}`) })}
              className="mt-2"
            />
            {progress.eventsNeeded === null ? (
              <p className="mt-2 text-sm leading-relaxed text-ink">{nextText}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 text-sm font-semibold text-accent-ink">{nextText}</p>
        )}
      </div>

      <p className="text-sm leading-relaxed text-ink-muted">{t("level.explain")}</p>
    </>
  );
}
