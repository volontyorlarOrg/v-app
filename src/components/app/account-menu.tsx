"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { routeIcon } from "@/components/app/route-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@/i18n/navigation";
import type { RouteKey } from "@/lib/routing/routes";

export type AccountMenuItem = {
  key: RouteKey;
  href: string;
  label: string;
};

export type AccountMenuLabels = {
  menu: string;
  profile: string;
};

const ITEM_CLASS =
  "flex min-h-11 w-full items-center gap-2.5 rounded-sm px-2.5 text-sm text-ink transition-colors hover:bg-surface-sunk focus-visible:bg-surface-sunk";

export function AccountMenu({
  labels,
  name,
  initials,
  avatarUrl,
  handle,
  level,
  profileHref,
  items,
}: {
  labels: AccountMenuLabels;
  name: string;
  initials: string;
  avatarUrl?: string;
  handle: string | null;
  level: string | null;
  profileHref: string;
  items: readonly AccountMenuItem[];
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${labels.menu}: ${name}`}
          className="inline-flex size-11 items-center justify-center rounded-md transition-colors hover:bg-surface-sunk data-[state=open]:bg-surface-sunk"
        >
          <Avatar aria-hidden="true" className="size-8">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" sideOffset={8} className="w-64 p-1">
        <nav aria-label={labels.menu}>
          <Link
            href={profileHref}
            onClick={close}
            aria-label={`${labels.profile}: ${name}`}
            className="flex items-center gap-3 rounded-sm px-2.5 py-2 transition-colors hover:bg-surface-sunk focus-visible:bg-surface-sunk"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{name}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                {handle ? <span className="truncate">@{handle}</span> : null}
                {level ? <Badge variant="achievement">{level}</Badge> : null}
              </p>
            </div>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-ink-muted"
            />
          </Link>

          <ul className="mt-1 flex flex-col border-t border-border pt-1">
            {items.map((item) => {
              const Icon = routeIcon(item.key);
              return (
                <li key={item.key}>
                  <Link href={item.href} onClick={close} className={ITEM_CLASS}>
                    <Icon aria-hidden="true" className="size-4 text-ink-muted" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </PopoverContent>
    </Popover>
  );
}
