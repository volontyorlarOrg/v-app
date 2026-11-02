import { toggleVariants } from "@/components/ui/toggle";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type SegmentedItem = {
  key: string;
  href: string;
  label: string;
  active: boolean;
  count?: number;
};

export function Segmented({
  label,
  items,
  className,
}: {
  label: string;
  items: readonly SegmentedItem[];
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={toggleVariants({ variant: "outline" })}
        >
          {item.label}
          {item.count !== undefined ? (
            <span
              className={cn(
                "tabular text-xs",
                item.active ? "text-band-copy" : "text-ink-muted",
              )}
            >
              {item.count}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
