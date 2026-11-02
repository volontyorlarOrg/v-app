import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-transparent text-foreground hover:bg-muted aria-[current=page]:bg-surface-soft aria-[current=page]:text-primary data-[state=on]:bg-surface-soft data-[state=on]:text-primary",
        outline:
          "border-border text-ink-muted hover:bg-muted hover:text-ink aria-[current=page]:border-transparent aria-[current=page]:bg-surface-soft aria-[current=page]:text-primary data-[state=on]:border-transparent data-[state=on]:bg-surface-soft data-[state=on]:text-primary",
      },
      size: {
        default: "min-h-(--control-sm) px-3",
        sm: "min-h-(--control-sm) px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
