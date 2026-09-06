import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-colors outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-transparent text-foreground hover:bg-muted hover:text-primary-ink aria-[current=page]:bg-accent-soft aria-[current=page]:text-primary-ink data-[state=on]:bg-accent-soft data-[state=on]:text-primary-ink",
        outline:
          "border-input bg-surface text-foreground hover:border-primary-ink hover:text-primary-ink aria-[current=page]:border-action aria-[current=page]:bg-action aria-[current=page]:text-ink-inverse data-[state=on]:border-action data-[state=on]:bg-action data-[state=on]:text-ink-inverse",
      },
      size: {
        default: "min-h-10 px-4",
        sm: "min-h-9 px-3",
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
