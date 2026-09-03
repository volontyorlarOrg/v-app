import { StatusChip } from "@/components/app/section";
import { cn } from "@/lib/utils";

export function PreviewNote({
  chip,
  body,
  className,
}: {
  chip: string;
  body: string;
  className?: string;
}) {
  return (
    <p
      role="note"
      className={cn(
        "flex flex-col items-start gap-2 text-sm leading-relaxed text-ink-muted sm:flex-row sm:items-start sm:gap-3",
        className,
      )}
    >
      <StatusChip className="shrink-0">{chip}</StatusChip>
      <span>{body}</span>
    </p>
  );
}
