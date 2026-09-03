import type { ReactNode } from "react";

import { StatusChip } from "@/components/app/section";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  chip,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  chip?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "enter-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow || chip ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
            {eyebrow ? <span>{eyebrow}</span> : null}
            {chip ? <StatusChip>{chip}</StatusChip> : null}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl tracking-[-0.025em] text-balance sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl leading-relaxed text-pretty text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
