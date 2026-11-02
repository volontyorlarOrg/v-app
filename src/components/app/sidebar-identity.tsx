"use client";

import type { ShellUser } from "@/components/app/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, usePathname } from "@/i18n/navigation";
import { IDENTITY_ROUTE, isSectionActive, navHref } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

export function SidebarIdentity({ user, label }: { user: ShellUser; label: string }) {
  const active = isSectionActive(usePathname(), IDENTITY_ROUTE);

  return (
    <Link
      href={navHref(IDENTITY_ROUTE)}
      aria-label={`${label}: ${user.name}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors",
        active ? "bg-sidebar-active" : "hover:bg-sidebar-hover",
      )}
    >
      <Avatar
        aria-hidden="true"
        className="size-8 shrink-0 outline-2 outline-offset-1 outline-accent/60"
      >
        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
        <AvatarFallback>{user.initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{user.name}</p>
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-ink-muted">
          {user.handle ? <span className="truncate">@{user.handle}</span> : null}
          {user.level ? <span className="shrink-0">{user.level}</span> : null}
        </p>
      </div>
    </Link>
  );
}
