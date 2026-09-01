import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "bg-surface text-ink-muted",
        structure: "bg-blue-tint text-blue-deep",
        structureSolid: "bg-blue-deep text-knockout",
        achievement: "bg-orange-tint text-orange-deep",
        achievementSolid: "bg-orange-deep text-knockout",
        urgent: "bg-danger-tint text-danger",
        outline: "border border-line-control bg-canvas text-ink-muted",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { icon?: ReactNode };

export function Badge({ className, tone, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {icon}
      {children}
    </span>
  );
}

export { badgeVariants };
