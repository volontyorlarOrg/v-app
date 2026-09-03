import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ChipTone = "neutral" | "structure" | "achievement";

const toneClass: Record<ChipTone, string> = {
  neutral: "border border-border-control text-ink-muted",
  structure: "bg-surface-soft text-primary-ink",
  achievement: "border border-accent/50 bg-surface text-accent-ink",
};

export function StateChip({
  tone = "neutral",
  icon,
  className,
  children,
}: {
  tone?: ChipTone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold [&_svg]:size-3.5",
        toneClass[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
