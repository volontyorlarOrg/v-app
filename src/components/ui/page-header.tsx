import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {eyebrow ? <div>{eyebrow}</div> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl leading-tight text-ink sm:text-3xl">{title}</h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
