import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Status chip.
 *
 * Every variant carries a word, and callers that mean something urgent pass an
 * icon too. Colour is a reinforcement here, never the message — a red/green
 * distinction is invisible to a good share of readers, and this product uses
 * status to tell people whether they can still apply.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "bg-field text-muted",
        // Teal: open, confirmed, positive.
        signal: "bg-teal text-teal-ink",
        signalQuiet: "bg-teal/15 text-teal",
        // Amber: deadlines and time pressure only.
        deadline: "bg-field text-amber",
        danger: "bg-danger/15 text-danger",
        success: "bg-success/15 text-success",
        // Sample/illustrative content must always be labelled as such.
        sample: "border border-amber/40 bg-amber/10 text-amber",
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
