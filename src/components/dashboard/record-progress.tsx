import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";

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
  const progress = levelProgress(record.counts);
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
    <div>
      <ol aria-label={t("level.railLabel")} className="relative grid grid-cols-4 gap-2">
        <span
          aria-hidden="true"
          className="absolute top-[0.4375rem] right-0 left-0 h-px bg-border-control/70"
        />
        {LEVELS.map((level) => {
          const isReached = reached.has(level);
          const isCurrent = level === progress.current;
          return (
            <li key={level} className="relative pt-5">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-0 left-0 size-3.5 rounded-full ring-4 ring-surface",
                  isReached ? "bg-accent" : "border border-border-control bg-surface",
                )}
              />
              <span
                className={cn(
                  "block text-xs leading-snug font-semibold",
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
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-semibold text-ink">
              {t("next.label", { level: t(`level.${progress.next}`) })}
            </span>
            <span className="tabular text-ink-muted">
              {done}/{needed}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={needed}
            aria-valuenow={done}
            aria-valuetext={nextText}
            aria-label={t("next.label", { level: t(`level.${progress.next}`) })}
            className="meter mt-2"
          >
            <div
              className="meter-fill"
              style={{ "--meter-progress": done / needed } as CSSProperties}
            />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{nextText}</p>
        </div>
      ) : (
        <p className="mt-5 text-sm font-semibold text-accent-ink">{nextText}</p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        {t("level.explain")}
      </p>
    </div>
  );
}
