import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title?: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-5 py-8 text-center", className)}>
      {title ? <p className="font-semibold text-ink">{title}</p> : null}
      <p
        className={cn(
          "mx-auto max-w-prose text-sm leading-relaxed text-ink-muted",
          title && "mt-1",
        )}
      >
        {body}
      </p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
