import { Crown } from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardEntry } from "@/lib/api/schemas";
import { VIEWER_ANCHOR } from "@/lib/leaderboard/standing";
import { initialsOf } from "@/lib/profile/initials";
import { memberProfileHref } from "@/lib/profile/public-routing";
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
      className="overflow-hidden rounded-lg border border-border"
    >
      <ol className="grid grid-cols-3 items-end gap-2 px-3 pt-10 sm:gap-4 sm:px-6">
        {entries.map((entry) => {
          const first = entry.rank === 1;
          const profileHref = entry.profileVisible
            ? memberProfileHref(entry.username)
            : null;
          return (
            <li
              key={entry.username}
              id={entry.isCurrentUser ? VIEWER_ANCHOR : undefined}
              data-place={entry.rank}
              aria-current={entry.isCurrentUser ? "true" : undefined}
              className={cn(
                "medal flex min-w-0 scroll-mt-24 flex-col items-center text-center",
                ORDER[entry.rank] ?? "order-3",
              )}
            >
              <div className="relative mb-2">
                {first ? (
                  <Crown
                    aria-hidden="true"
                    className="absolute -top-7 left-1/2 size-5 -translate-x-1/2 fill-gold text-gold"
                  />
                ) : null}
                <Avatar
                  aria-hidden="true"
                  className={cn(
                    "medal-ring",
                    first ? "size-14 sm:size-16" : "size-12 sm:size-14",
                  )}
                >
                  {entry.avatarUrl ? (
                    <AvatarImage src={entry.avatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback className={cn("medal-disc medal-ink", "text-sm")}>
                    {initialsOf(entry.displayName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex max-w-full flex-col items-center gap-0.5">
                <p className="max-w-full truncate text-sm font-medium text-ink">
                  {profileHref ? (
                    <Link
                      href={profileHref}
                      className="underline-offset-4 hover:underline"
                    >
                      {entry.displayName}
                    </Link>
                  ) : (
                    entry.displayName
                  )}
                </p>
                <div className="flex max-w-full items-center gap-1.5">
                  <p className="max-w-full truncate text-xs text-ink-muted">
                    @{entry.username}
                  </p>
                  {entry.isCurrentUser ? (
                    <Badge variant="structure">{t("you")}</Badge>
                  ) : null}
                </div>
              </div>
              <p
                className={cn("figure mt-1 text-ink", first ? "text-xl" : "text-base")}
              >
                {t("xpValue", { xp: format.number(entry.xp) })}
              </p>
              <div className="podium-step mt-3" data-place={entry.rank}>
                <span
                  aria-label={t("podium.place", { rank: entry.rank })}
                  className="figure text-lg"
                >
                  {format.number(entry.rank)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
