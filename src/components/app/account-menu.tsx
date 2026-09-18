"use client";

import { ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";

import { routeIcon } from "@/components/app/route-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/auth/actions";
import type { RouteKey } from "@/lib/routing/routes";

export type AccountMenuItem = {
  key: RouteKey;
  href: string;
  label: string;
};

export type AccountMenuLabels = {
  menu: string;
  profile: string;
  signOut: string;
};

const ITEM_CLASS =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft hover:text-primary-ink focus-visible:bg-surface-soft";

export function AccountMenu({
  labels,
  name,
  initials,
  handle,
  level,
  profileHref,
  items,
  signOutLocale,
  loginHref,
}: {
  labels: AccountMenuLabels;
  name: string;
  initials: string;
  handle: string | null;
  level: string;
  profileHref: string;
  items: readonly AccountMenuItem[];
  signOutLocale: string | null;
  loginHref: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${labels.menu}: ${name}`}
          className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface transition-colors hover:border-primary data-[state=open]:border-primary"
        >
          <Avatar aria-hidden="true" className="size-9">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" sideOffset={8} className="w-64 p-1.5">
        <nav aria-label={labels.menu}>
          <Link
            href={profileHref}
            onClick={close}
            aria-label={`${labels.profile}: ${name}`}
            className="group flex items-center gap-3 rounded-lg px-3 pt-2 pb-2.5 transition-colors hover:bg-surface-soft focus-visible:bg-surface-soft"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink group-hover:text-primary-ink">
                {name}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                {handle ? <span className="truncate">@{handle}</span> : null}
                <Badge variant="achievement">{level}</Badge>
              </p>
            </div>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-ink-muted transition-colors group-hover:text-primary-ink"
            />
          </Link>

          <ul className="mt-1.5 flex flex-col border-t border-border pt-1.5">
            {items.map((item) => {
              const Icon = routeIcon(item.key);
              return (
                <li key={item.key}>
                  <Link href={item.href} onClick={close} className={ITEM_CLASS}>
                    <Icon aria-hidden="true" className="size-4 text-primary" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-1.5 border-t border-border pt-1.5">
            {signOutLocale ? (
              <form action={signOut}>
                <input type="hidden" name="locale" value={signOutLocale} />
                <button type="submit" className={ITEM_CLASS}>
                  <LogOut aria-hidden="true" className="size-4" />
                  {labels.signOut}
                </button>
              </form>
            ) : (
              <Link href={loginHref} onClick={close} className={ITEM_CLASS}>
                <LogOut aria-hidden="true" className="size-4" />
                {labels.signOut}
              </Link>
            )}
          </div>
        </nav>
      </PopoverContent>
    </Popover>
  );
}
