"use client";

import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@/i18n/navigation";
import { useServerAction } from "@/hooks/use-server-action";
import { markAllReadAction } from "@/lib/notifications/actions";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  href?: string;
};

export function NotificationsMenu({
  variant = "icon",
  label,
  title,
  emptyLabel,
  markAllLabel,
  items,
}: {
  variant?: "icon" | "shell";
  label: string;
  title: string;
  emptyLabel: string;
  markAllLabel: string;
  items: readonly NotificationItem[];
}) {
  const markAll = useServerAction(markAllReadAction);
  const allRead = markAll.isSuccess;
  const unread = allRead ? 0 : items.filter((item) => item.unread).length;
  const name = unread > 0 ? `${label} (${unread})` : label;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={name}
          className={cn(
            "relative inline-grid size-11 shrink-0 place-items-center rounded-full border transition-colors",
            variant === "shell"
              ? "border-shell-line bg-shell-raised/60 text-shell-muted hover:bg-shell-raised hover:text-shell-ink data-[state=open]:bg-shell-raised data-[state=open]:text-shell-ink"
              : "border-border bg-surface text-ink hover:border-primary hover:text-primary-ink data-[state=open]:border-primary",
          )}
        >
          <Bell aria-hidden="true" className="size-4" />
          {unread > 0 ? (
            <Badge
              aria-hidden="true"
              className="tabular absolute -top-1 -right-1 min-w-5 px-1.5 py-0 leading-5 font-bold"
            >
              {unread}
            </Badge>
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent
        aria-label={title}
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-80 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-ink">{title}</p>
          {unread > 0 ? (
            <button
              type="button"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
              className="text-xs font-semibold text-primary-ink underline-offset-4 hover:underline disabled:opacity-70"
            >
              {markAllLabel}
            </button>
          ) : null}
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">{emptyLabel}</p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    item.unread && !allRead ? "bg-primary" : "bg-border",
                  )}
                />
                <div className="min-w-0">
                  <p className="text-sm leading-snug font-semibold text-ink">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="underline-offset-4 hover:underline"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </p>
                  {item.body ? (
                    <p className="mt-0.5 text-sm leading-snug text-ink-muted">
                      {item.body}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-ink-muted">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
