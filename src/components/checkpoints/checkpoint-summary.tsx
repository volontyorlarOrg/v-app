import { useFormatter, useTranslations } from "next-intl";

import { Progress } from "@/components/ui/progress";
import type { CheckpointList } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";

export function CheckpointSummary({
  list,
  className,
}: {
  list: CheckpointList;
  className?: string;
}) {
  const t = useTranslations("checkpoints.summary");
  const format = useFormatter();
  const reached = t("reached", {
    completed: format.number(list.completed),
    total: format.number(list.total),
  });

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <span className="tabular font-semibold text-ink">{reached}</span>
        <span
          className={cn(
            "tabular",
            list.xpEarned > 0 ? "font-semibold text-accent-ink" : "text-ink-muted",
          )}
        >
          {t("xp", {
            earned: format.number(list.xpEarned),
            available: format.number(list.xpAvailable),
          })}
        </span>
      </div>
      <Progress
        value={list.completed}
        max={list.total}
        valueText={reached}
        aria-label={t("label")}
        className="mt-2"
      />
      {list.xpClaimable > 0 ? (
        <p className="mt-2 text-sm font-semibold text-accent-ink">
          {t("claimable", { xp: format.number(list.xpClaimable) })}
        </p>
      ) : null}
    </div>
  );
}
