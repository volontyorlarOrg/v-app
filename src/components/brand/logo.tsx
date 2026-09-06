import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <circle cx="100" cy="76" r="20" fill="currentColor" />
      <path
        d="M 41.74 81.30 A 59 59 0 0 0 158.26 81.30"
        fill="none"
        stroke="currentColor"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrandArc({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <path
        d="M 41.74 81.30 A 59 59 0 0 0 158.26 81.30"
        fill="none"
        stroke="currentColor"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrandLockup({
  name,
  className,
  tone = "primary",
}: {
  name: string;
  className?: string;
  tone?: "primary" | "inverse";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark
        className={cn("size-8", tone === "primary" ? "text-primary" : "text-knockout")}
      />
      <span
        className={cn(
          "hidden text-base leading-none font-bold tracking-[-0.02em] lowercase min-[360px]:inline",
          tone === "primary" ? "text-ink" : "text-knockout",
        )}
      >
        {name}
      </span>
    </span>
  );
}
