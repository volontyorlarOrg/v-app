"use client";

import { routeIcon } from "@/components/app/route-icons";
import { Link, usePathname } from "@/i18n/navigation";
import { isActivePath, type RouteKey } from "@/lib/routing/routes";
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
      className="tab-bar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface lg:hidden"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      >
        {items.map((item) => {
          const Icon = routeIcon(item.key);
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors",
                  active ? "text-primary-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
