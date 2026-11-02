import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-action text-knockout hover:bg-action-hover",
        outline: "border border-border bg-surface text-ink hover:bg-surface-sunk",
        ghost: "text-primary hover:bg-surface-sunk",
        "danger-outline":
          "border border-border bg-surface text-danger-ink hover:border-danger/50 hover:bg-danger-muted",
        inverse: "bg-knockout text-action hover:bg-surface-sunk",
      },
      size: {
        sm: "min-h-(--control-sm) px-3 text-sm",
        md: "min-h-(--control) px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function buttonClass(props: ButtonVariantProps & { className?: string } = {}) {
  const { className, ...variants } = props;
  return cn(buttonVariants(variants), className);
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> & ButtonVariantProps & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "primary"}
      data-size={size ?? "md"}
      className={buttonClass({ variant, size, className })}
      {...props}
    />
  );
}

export { buttonVariants };
