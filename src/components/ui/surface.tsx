import type { ComponentProps, ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The raised panel that most content sits on. One component so every card in
 * the product shares a radius, a border, and a background, rather than each
 * page inventing its own.
 */
const surfaceVariants = cva("rounded-card border", {
  variants: {
    tone: {
      panel: "border-signal-line bg-panel",
      field: "border-signal-line bg-field",
      // For a single decisive callout only. The design system's "signal
      // rarity" rule: teal marks action, it does not wash a whole section.
      accent: "border-teal/55 bg-panel-strong",
      quiet: "border-signal-line/60 bg-transparent",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
    },
  },
  defaultVariants: { tone: "panel", padding: "md" },
});

export type SurfaceProps<T extends ElementType = "div"> = {
  as?: T;
} & VariantProps<typeof surfaceVariants> &
  Omit<ComponentProps<"div">, "color">;

export function Surface<T extends ElementType = "div">({
  as,
  tone,
  padding,
  className,
  ...props
}: SurfaceProps<T>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component
      className={cn(surfaceVariants({ tone, padding }), className)}
      {...props}
    />
  );
}
