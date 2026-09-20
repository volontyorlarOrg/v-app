"use client";

import type { ShellUser } from "@/components/app/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        "group flex items-center gap-3 rounded-xl border px-3 py-2.5 inset-shadow-2xs inset-shadow-shell-ink/10 transition-colors",
        active
          ? "border-shell-muted bg-shell-raised"
          : "border-shell-line bg-shell-raised/60 hover:border-shell-muted/50 hover:bg-shell-raised active:bg-shell-raised/40",
      )}
    >
      <Avatar
        aria-hidden="true"
        className={cn(
          "size-10 shrink-0 outline-2 outline-offset-2 transition-[outline-color]",
          active ? "outline-accent" : "outline-accent/60 group-hover:outline-accent",
        )}
      >
        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
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
