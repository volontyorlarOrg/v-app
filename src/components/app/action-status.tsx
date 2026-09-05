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
        "flex items-start gap-3 rounded-lg px-4 py-3 text-sm leading-relaxed",
        tone === "info" && "bg-surface-soft text-primary-ink",
        tone === "done" && "bg-surface-soft text-accent-ink",
        tone === "error" && "border border-border-control bg-surface-sunk text-ink",
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}
