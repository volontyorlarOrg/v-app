"use client";

import type { ShellUser } from "@/components/app/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
        "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
        active
          ? "border-shell-muted bg-shell-raised"
          : "border-shell-line bg-shell-raised/60 hover:border-shell-muted/50 hover:bg-shell-raised",
      )}
    >
      <Avatar aria-hidden="true" className="size-10 shrink-0 ring-2 ring-accent/70">
        <AvatarFallback className="bg-primary-muted text-sm text-primary-deep">
          {user.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-shell-ink">{user.name}</p>
        <p className="mt-0.5 flex min-w-0 items-center gap-1.5">
          {user.handle ? (
            <span className="truncate text-xs text-shell-muted">@{user.handle}</span>
          ) : null}
          <Badge variant="achievement" className="shrink-0">
            {user.level}
          </Badge>
        </p>
      </div>
    </Link>
  );
}
