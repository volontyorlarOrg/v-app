"use client";

import { routeIcon } from "@/components/app/route-icons";
import { Link, usePathname } from "@/i18n/navigation";
import { isActivePath, type RouteKey } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

export type SidebarItem = { key: RouteKey; href: string; label: string };

export function SidebarNav({
  items,
  label,
  heading,
}: {
  items: readonly SidebarItem[];
  label: string;
  heading: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <p className="px-3 pb-2 text-xs font-semibold tracking-[0.14em] text-shell-muted/80 uppercase">
        {heading}
      </p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = routeIcon(item.key);
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary-muted text-primary-deep"
                    : "text-shell-muted hover:bg-shell-raised hover:text-shell-ink",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-5 shrink-0",
                    active ? "text-primary-deep" : "text-shell-muted",
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
