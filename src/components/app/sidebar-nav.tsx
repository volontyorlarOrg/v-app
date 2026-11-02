"use client";

import type { ReactNode } from "react";

import { routeIcon } from "@/components/app/route-icons";
import { Link, usePathname } from "@/i18n/navigation";
import { isSectionActive, type RouteKey } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

export type SidebarItem = { key: RouteKey; href: string; label: string };

export function SidebarNav({
  items,
  label,
  lead,
}: {
  items: readonly SidebarItem[];
  label: string;
  lead?: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="flex flex-col gap-1">
      {lead}
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = routeIcon(item.key);
          const active = isSectionActive(pathname, item.key);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-(--control-sm) items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-active text-primary"
                    : "text-ink-muted hover:bg-sidebar-hover hover:text-ink",
                )}
              >
                <Icon aria-hidden="true" className="size-4.5 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
