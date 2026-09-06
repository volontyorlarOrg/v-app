"use client";

import { routeIcon } from "@/components/app/route-icons";
import { Link, usePathname } from "@/i18n/navigation";
import { isActivePath, type RouteKey } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

export type SidebarItem = { key: RouteKey; href: string; label: string };

function Items({
  items,
  pathname,
}: {
  items: readonly SidebarItem[];
  pathname: string;
}) {
  return (
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
                  ? "bg-surface-soft text-primary-ink"
                  : "text-ink-muted hover:bg-surface-sunk hover:text-ink",
              )}
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SidebarNav({
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
}: {
  primary: readonly SidebarItem[];
  secondary: readonly SidebarItem[];
  primaryLabel: string;
  secondaryLabel: string;
}) {
  const pathname = usePathname();

  return (
    <>
      <nav aria-label={primaryLabel} className="px-3">
        <Items items={primary} pathname={pathname} />
      </nav>
      <nav
        aria-label={secondaryLabel}
        className="mt-6 border-t border-border px-3 pt-6"
      >
        <Items items={secondary} pathname={pathname} />
      </nav>
    </>
  );
}
