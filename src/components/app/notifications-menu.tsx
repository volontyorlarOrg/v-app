"use client";

import {
  ArrowUpRight,
  Bell,
  BellRing,
  Check,
  Gift,
  ShieldCheck,
  X,
} from "lucide-react";
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
  category?: "reward" | "account" | "activity";
  rewardState?: "ready" | "claimed" | "exhausted";
};

export function NotificationsMenu({
  variant = "icon",
  label,
  title,
  emptyLabel,
  markAllLabel,
  items,
  labels,
}: {
  variant?: "icon" | "shell";
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
        className="w-96 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl p-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border py-2 pr-2 pl-5">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={labels.close}
            className="inline-grid size-11 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-surface-soft hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        {items.length > 0 ? (
          <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border bg-surface-sunk/50 px-5">
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
                className="min-h-11 text-xs font-semibold text-primary-ink underline-offset-4 hover:underline disabled:opacity-70"
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
            className="border-b border-border px-5 py-3 text-sm text-ink-muted"
          >
            {labels.readError}
          </p>
        ) : null}
        {items.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <Bell aria-hidden="true" className="mb-4 size-7 text-ink-muted" />
            <p className="font-semibold text-ink">{emptyLabel}</p>
            <p className="mt-1 max-w-64 text-sm text-ink-muted">{labels.emptyBody}</p>
          </div>
        ) : (
          <ul className="max-h-[min(32rem,60dvh)] overflow-y-auto overscroll-contain">
            {items.map((item) => {
              const fresh = isUnread(item);
              const Icon =
                item.category === "reward"
                  ? Gift
                  : item.category === "account"
                    ? ShieldCheck
                    : BellRing;
              const content = (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 inline-grid size-9 shrink-0 place-items-center rounded-full",
                      item.category === "reward" && item.rewardState !== "exhausted"
                        ? "bg-surface-sunk text-accent-ink"
                        : "bg-surface-sunk text-ink-muted",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm leading-snug font-semibold text-ink">
                        {item.title}
                      </p>
                      {fresh ? (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary">
                          <span className="sr-only">{labels.new}</span>
                        </span>
                      ) : null}
                    </div>
                    {item.body ? (
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                        {item.body}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <p className="text-xs text-ink-muted">{item.time}</p>
                      {item.href ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-ink">
                          {item.action ?? labels.viewDetails}
                          <ArrowUpRight aria-hidden="true" className="size-3.5" />
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
                        "flex gap-3 px-5 py-4 transition-colors hover:bg-surface-soft focus-visible:-outline-offset-2",
                        fresh && "bg-surface-soft/40",
                      )}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "flex gap-3 px-5 py-4",
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
