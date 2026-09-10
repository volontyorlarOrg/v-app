import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type RailState = "done" | "current" | "upcoming";

export type RailItem = {
  key: string;
  number: number;
  label: string;
  state: RailState;
};

export function StepRail({
  items,
  label,
  stateLabels,
  layout = "responsive",
  className,
}: {
  items: readonly RailItem[];
  label: string;
  stateLabels: Record<RailState, string>;
  layout?: "responsive" | "strip";
  className?: string;
}) {
  const strip = layout === "strip";

  return (
    <ol
      aria-label={label}
      className={cn(
        "flex items-center gap-2",
        !strip && "lg:flex-col lg:items-stretch lg:gap-0",
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          key={item.key}
          aria-current={item.state === "current" ? "step" : undefined}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3",
            !strip && "lg:flex-none",
          )}
        >
          <span
            data-state={item.state}
            className={cn(
              "onboarding-rail-node inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
              item.state === "done" && "border-accent bg-accent text-knockout",
              item.state === "current" && "border-action bg-action text-knockout",
              item.state === "upcoming" &&
                "border-border-control bg-surface text-ink-muted",
            )}
          >
            {item.state === "done" ? (
              <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
            ) : (
              item.number
            )}
          </span>
          <span
            className={cn(
              "sr-only text-sm",
              !strip && "lg:not-sr-only lg:py-2.5",
              item.state === "current" && "font-semibold text-ink",
              item.state === "done" && "text-accent-ink",
              item.state === "upcoming" && "text-ink-muted",
            )}
          >
            {item.label}
            <span className="sr-only">, {stateLabels[item.state]}</span>
          </span>
          {index < items.length - 1 ? (
            <span
              aria-hidden="true"
              className={cn(
                "h-px min-w-3 flex-1 bg-border-control/60",
                !strip && "lg:hidden",
              )}
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
