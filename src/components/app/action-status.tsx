import { CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ActionTone = "info" | "done" | "error";

export function ActionStatus({
  tone = "info",
  children,
  className,
}: {
  tone?: ActionTone;
  children: ReactNode;
  className?: string;
}) {
  const Icon = tone === "done" ? CircleCheck : Info;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-md bg-surface-sunk px-3 py-2 text-sm text-ink",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "done"
            ? "text-accent"
            : tone === "info"
              ? "text-primary"
              : "text-ink",
        )}
      />
      <span className="min-w-0">{children}</span>
    </p>
  );
}
