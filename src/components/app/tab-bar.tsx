"use client";

import { routeIcon } from "@/components/app/route-icons";
import { Link, usePathname } from "@/i18n/navigation";
import { isSectionActive, type RouteKey } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

export type TabBarItem = { key: RouteKey; href: string; label: string };

export function TabBar({
  items,
  label,
}: {
  items: readonly TabBarItem[];
  label: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className="tab-bar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm lg:hidden"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      >
        {items.map((item) => {
          const Icon = routeIcon(item.key);
          const active = isSectionActive(pathname, item.key);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 pt-1.5 pb-1 text-xs font-semibold transition-colors",
                  active ? "text-primary-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "inline-grid h-7 w-12 place-items-center rounded-full transition-colors",
                    active && "bg-shell-active text-shell-active-ink",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="size-5"
                    strokeWidth={active ? 2.25 : 2}
                  />
                </span>
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
