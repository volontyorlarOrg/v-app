import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type Stat = {
  id: string;
  label: string;
  value: string;
  note?: string;
  achievement?: boolean;
};

export function StatTiles({
  stats,
  className,
}: {
  stats: readonly Stat[];
  className?: string;
}) {
  const wideColumns = stats.length === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4";

  return (
    <dl className={cn("grid grid-cols-2 gap-3 sm:gap-4", wideColumns, className)}>
      {stats.map((stat, index) => (
        <div
          key={stat.id}
          className="enter-rise min-w-0 rounded-xl border border-border bg-surface px-4 py-3.5 sm:px-5 sm:py-4"
          style={{ "--enter-delay": `${120 + index * 70}ms` } as CSSProperties}
        >
          <dt className="min-h-[2lh] text-xs font-semibold tracking-[0.1em] text-ink-muted uppercase sm:tracking-[0.14em] xl:min-h-0">
            {stat.label}
          </dt>
          <dd
            className={cn(
              "display-face tabular mt-2 text-figure",
              stat.achievement ? "text-accent-ink" : "text-ink",
            )}
          >
            {stat.value}
          </dd>
          {stat.note ? (
            <dd className="mt-1.5 text-xs leading-relaxed text-ink-muted">
              {stat.note}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
