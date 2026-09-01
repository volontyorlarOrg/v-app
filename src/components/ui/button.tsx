import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The button. No `"use client"` — it renders in either tree, so a Server
 * Component page can use it without dragging itself across the boundary.
 *
 * Sizes keep a >=44px touch target at every step except `sm`, which is
 * reserved for controls that sit inside an already-tappable row. Most YVC
 * traffic is thumbs on a phone opened from Telegram.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg font-bold transition-[background-color,border-color,color,transform]",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:translate-y-0 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-teal text-teal-ink hover:bg-teal-hover hover:-translate-y-0.5",
        secondary:
          "border border-signal-line bg-transparent text-ink hover:border-teal hover:bg-field",
        ghost: "bg-transparent text-muted hover:bg-field hover:text-ink",
        // Destructive actions never rely on colour alone — callers pair this
        // with an explicit verb and a confirmation step.
        danger:
          "border border-danger/50 bg-danger/10 text-danger hover:bg-danger/20",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-13 px-6 text-base",
        icon: "size-11",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render as the child element — for a `Link` styled as a button. */
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      // A button inside a form defaults to `submit` in HTML, which turns every
      // unlabelled button into an accidental submit. Opt in explicitly instead.
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
