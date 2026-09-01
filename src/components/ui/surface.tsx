import type { ComponentProps, ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const surfaceVariants = cva("rounded-card border", {
  variants: {
    tone: {
      raised: "border-line bg-canvas",
      muted: "border-line bg-surface",
      structure: "border-blue-deep/20 bg-blue-tint",
      achievement: "border-orange-deep/25 bg-orange-tint",
      alert: "border-danger/25 bg-danger-tint",
      quiet: "border-line bg-transparent",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
    },
  },
  defaultVariants: { tone: "raised", padding: "md" },
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
