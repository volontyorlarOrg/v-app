import { Crown } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardEntry } from "@/lib/api/schemas";
import { initialsOf } from "@/lib/profile/initials";
import { cn } from "@/lib/utils";

export const PODIUM_SIZE = 3;

const ORDER: Record<number, string> = {
  1: "order-2",
  2: "order-1",
  3: "order-3",
};

export function LeaderboardPodium({
  entries,
}: {
  entries: readonly LeaderboardEntry[];
}) {
  const t = useTranslations("leaderboard");
  const format = useFormatter();

  return (
    <section
      aria-label={t("podium.label")}
      className="podium-stage enter-rise overflow-hidden rounded-xl border border-border [--enter-delay:180ms]"
    >
      <ol className="grid grid-cols-3 items-end gap-2 px-3 pt-8 pb-6 sm:gap-6 sm:px-8">
        {entries.map((entry) => {
          const first = entry.rank === 1;
          return (
            <li
              key={entry.username}
              aria-current={entry.isCurrentUser ? "true" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center text-center",
                ORDER[entry.rank] ?? "order-3",
                first ? "pb-6" : "pb-0",
              )}
            >
              <div className="relative">
                {first ? (
                  <Crown
                    aria-hidden="true"
                    className="absolute -top-7 left-1/2 size-6 -translate-x-1/2 fill-accent text-accent"
                    strokeWidth={1.5}
                  />
                ) : null}
                <Avatar
                  aria-hidden="true"
                  className={cn(
                    "ring-4 ring-surface",
                    first ? "size-20 sm:size-24" : "size-16 sm:size-20",
                    first
                      ? "outline outline-2 outline-accent"
                      : "outline outline-2 outline-primary-muted",
                  )}
                >
                  <AvatarFallback
                    className={cn(
                      first
                        ? "bg-accent/15 text-xl text-accent-ink sm:text-2xl"
                        : "bg-surface-soft text-lg text-primary-ink sm:text-xl",
                    )}
                  >
                    {initialsOf(entry.username)}
                  </AvatarFallback>
                </Avatar>
                <span
                  aria-label={t("podium.place", { rank: entry.rank })}
                  className={cn(
                    "tabular absolute -right-1 -bottom-1 inline-grid size-7 place-items-center rounded-full border-2 border-surface text-xs font-bold",
                    first ? "bg-accent text-knockout" : "bg-action text-knockout",
                  )}
                >
                  {format.number(entry.rank)}
                </span>
              </div>
              <p className="mt-3 flex max-w-full flex-col items-center gap-1">
                <span className="max-w-full truncate text-sm font-semibold text-ink sm:text-base">
                  @{entry.username}
                </span>
                {entry.isCurrentUser ? (
                  <Badge variant="structure">{t("you")}</Badge>
                ) : null}
              </p>
              <p
                className={cn(
                  "display-face tabular mt-1.5 text-accent-ink",
                  first ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
                )}
              >
                {t("xpValue", { xp: format.number(entry.xp) })}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
