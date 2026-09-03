import { cn } from "@/lib/utils";

export function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid size-10 shrink-0 place-items-center rounded-full bg-surface-soft text-sm font-bold tracking-[0.02em] text-primary-ink",
        className,
      )}
    >
      {initials}
    </span>
  );
}
