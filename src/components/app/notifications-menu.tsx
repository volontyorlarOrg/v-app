"use client";

import { Bell, BellRing, Check, Gift, ShieldCheck, Star, X } from "lucide-react";
import { useId, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@/i18n/navigation";
import { useServerAction } from "@/hooks/use-server-action";
import { markAllReadAction, markReadAction } from "@/lib/notifications/actions";
import type { NotificationLabels } from "@/lib/notifications/labels";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  href?: string;
  action?: string;
  category?: "reward" | "account" | "activity" | "level";
  rewardState?: "ready" | "claimed" | "exhausted";
};

export function NotificationsMenu({
  label,
  title,
  emptyLabel,
  markAllLabel,
  items,
  labels,
}: {
  label: string;
  title: string;
  emptyLabel: string;
  markAllLabel: string;
  items: readonly NotificationItem[];
  labels: NotificationLabels;
}) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(new Set());
  const markAll = useServerAction<string[]>(markAllReadAction, {
    onSuccess: (_result, ids: string[]) =>
      setReadIds((known) => new Set([...known, ...ids])),
  });
  const markOne = useServerAction(markReadAction, {
    onSuccess: (_result, id) => setReadIds((known) => new Set([...known, id])),
  });
  const isUnread = (item: NotificationItem) => item.unread && !readIds.has(item.id);
  const unread = items.filter(isUnread).length;
  const name = unread > 0 ? `${label} (${unread})` : label;

  function visit(item: NotificationItem) {
    if (isUnread(item)) markOne.mutate(item.id);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={name}
          className="relative inline-grid size-(--control-sm) shrink-0 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-sunk hover:text-ink data-[state=open]:bg-surface-sunk data-[state=open]:text-ink"
        >
          <Bell aria-hidden="true" className="size-4.5" />
          {unread > 0 ? (
            <Badge
              aria-hidden="true"
              className="tabular absolute top-0.5 right-0.5 min-w-4 rounded-full px-1 py-0 text-center leading-4"
            >
              {unread > 9 ? "9+" : unread}
            </Badge>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        aria-labelledby={titleId}
        side="bottom"
        align="end"
        sideOffset={12}
        collisionPadding={12}
        className="w-96 max-w-[calc(100vw-1.5rem)] overflow-hidden p-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border py-1 pr-1.5 pl-4">
          <h2 id={titleId} className="text-sm font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={labels.close}
            className="inline-grid size-(--control-sm) shrink-0 place-items-center rounded-md text-ink-muted hover:bg-surface-sunk hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        {items.length > 0 ? (
          <div className="flex min-h-(--control-sm) items-center justify-between gap-3 border-b border-border px-4">
            <p aria-live="polite" className="text-xs text-ink-muted">
              {unread > 0 ? `${labels.unread}: ${unread}` : labels.allRead}
            </p>
            {unread > 0 ? (
              <button
                type="button"
                disabled={markAll.isPending}
                aria-busy={markAll.isPending}
                onClick={() =>
                  markAll.mutate(items.filter(isUnread).map((item) => item.id))
                }
                className="min-h-(--control-sm) text-xs font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
              >
                {markAll.isPending ? labels.marking : markAllLabel}
              </button>
            ) : (
              <Check aria-hidden="true" className="size-4 text-ink-muted" />
            )}
          </div>
        ) : null}
        {markAll.isError || markOne.isError ? (
          <p
            role="alert"
            className="border-b border-border px-4 py-3 text-sm text-ink-muted"
          >
            {labels.readError}
          </p>
        ) : null}
        {items.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <Bell aria-hidden="true" className="mb-3 size-5 text-ink-muted" />
            <p className="text-sm font-medium text-ink">{emptyLabel}</p>
            <p className="mt-1 max-w-64 text-sm text-ink-muted">{labels.emptyBody}</p>
          </div>
        ) : (
          <ul className="max-h-[min(32rem,60dvh)] overflow-y-auto overscroll-contain">
            {items.map((item) => {
              const fresh = isUnread(item);
              const Icon =
                item.category === "reward"
                  ? Gift
                  : item.category === "level"
                    ? Star
                    : item.category === "account"
                      ? ShieldCheck
                      : BellRing;
              const content = (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 shrink-0",
                      (item.category === "reward" &&
                        item.rewardState !== "exhausted") ||
                        item.category === "level"
                        ? "text-accent"
                        : "text-ink-muted",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm leading-snug font-medium text-ink">
                        {item.title}
                      </p>
                      {fresh ? (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary">
                          <span className="sr-only">{labels.new}</span>
                        </span>
                      ) : null}
                    </div>
                    {item.body ? (
                      <p className="mt-0.5 text-sm text-ink-muted">{item.body}</p>
                    ) : null}
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <p className="text-xs text-ink-muted">{item.time}</p>
                      {item.href ? (
                        <span className="text-xs font-medium text-primary">
                          {item.action ?? labels.viewDetails}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </>
              );
              return (
                <li key={item.id} className="border-b border-border last:border-b-0">
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => visit(item)}
                      className={cn(
                        "flex gap-3 px-4 py-3 transition-colors hover:bg-surface-sunk focus-visible:-outline-offset-2",
                        fresh && "bg-surface-soft/40",
                      )}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "flex gap-3 px-4 py-3",
                        fresh && "bg-surface-soft/40",
                      )}
                    >
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
