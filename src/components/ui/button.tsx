import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-200 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-action text-ink-inverse hover:bg-action-hover",
        accent: "bg-accent text-knockout hover:bg-primary-deep",
        outline:
          "border border-border-control bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-ink-inverse",
        ghost: "text-primary-ink hover:bg-accent-soft",
        inverse: "bg-knockout text-band hover:bg-primary-muted hover:text-primary-deep",
      },
      size: {
        sm: "min-h-11 px-5 text-sm",
        md: "min-h-13 px-7 text-base",
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
