"use client";

import { routeIcon } from "@/components/app/route-icons";
import { Link, usePathname } from "@/i18n/navigation";
import { isSectionActive, type RouteKey } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

export type SidebarItem = { key: RouteKey; href: string; label: string };

export function SidebarNav({
  items,
  label,
}: {
  items: readonly SidebarItem[];
  label: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = routeIcon(item.key);
          const active = isSectionActive(pathname, item.key);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-shell-active text-shell-active-ink"
                    : "text-shell-muted hover:bg-shell-raised hover:text-shell-ink",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-5 shrink-0 transition-colors",
                    active
                      ? "text-shell-active-ink"
                      : "text-shell-muted group-hover:text-shell-ink",
                  )}
                  strokeWidth={active ? 2.25 : 2}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
