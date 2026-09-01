import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg font-semibold transition-colors",
    "disabled:pointer-events-none disabled:opacity-55",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-blue-deep text-knockout hover:bg-ink",
        secondary:
          "border border-line-control bg-canvas text-blue-deep hover:bg-blue-tint",
        ghost: "bg-transparent text-ink-muted hover:bg-surface hover:text-ink",
        danger: "bg-danger text-knockout hover:bg-ink",
        quiet:
          "border border-line bg-surface text-ink hover:border-line-control hover:bg-surface-strong",
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
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
