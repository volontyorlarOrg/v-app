import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type SectionTab = {
  key: string;
  href: string;
  label: string;
  active: boolean;
  count?: number;
};

export function SectionTabs({
  label,
  items,
  className,
}: {
  label: string;
  items: readonly SectionTab[];
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("section-tabs", className)}>
      <ul className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {items.map((item) => (
          <li key={item.key} className="shrink-0">
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className="section-tab"
            >
              {item.label}
              {item.count !== undefined ? (
                <span className="section-tab-count tabular">{item.count}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
