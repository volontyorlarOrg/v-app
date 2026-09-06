import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export type ChipTone = "neutral" | "structure" | "achievement";

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
    <Badge variant={tone} className={className}>
      {icon}
      {children}
    </Badge>
  );
}
