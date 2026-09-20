import { Crown } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardEntry } from "@/lib/api/schemas";
import { initialsOf } from "@/lib/profile/initials";
import { publicProfileHref } from "@/lib/seo/origin";
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
      <ol className="grid grid-cols-3 items-end gap-2 px-3 pt-12 sm:gap-5 sm:px-8">
        {entries.map((entry) => {
          const first = entry.rank === 1;
          const profileHref = entry.profileVisible
            ? publicProfileHref(entry.username)
            : null;
          return (
            <li
              key={entry.username}
              data-place={entry.rank}
              aria-current={entry.isCurrentUser ? "true" : undefined}
              className={cn(
                "medal flex min-w-0 flex-col items-center text-center",
                ORDER[entry.rank] ?? "order-3",
              )}
            >
              <div className="relative mb-3">
                {first ? (
                  <Crown
                    aria-hidden="true"
                    className="absolute -top-9 left-1/2 size-7 -translate-x-1/2 fill-gold text-gold"
                    strokeWidth={1.5}
                  />
                ) : null}
                <Avatar
                  aria-hidden="true"
                  className={cn(
                    "medal-ring ring-4 ring-surface",
                    first ? "size-20 sm:size-24" : "size-16 sm:size-20",
                  )}
                >
                  {entry.avatarUrl ? (
                    <AvatarImage src={entry.avatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback
                    className={cn(
                      "medal-disc medal-ink",
                      first ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
                    )}
                  >
                    {initialsOf(entry.displayName)}
                  </AvatarFallback>
                </Avatar>
                <span
                  aria-label={t("podium.place", { rank: entry.rank })}
                  className="medal-badge tabular absolute -right-1 -bottom-1 inline-grid size-7 place-items-center rounded-full border-2 border-surface text-xs font-bold"
                >
                  {format.number(entry.rank)}
                </span>
              </div>
              <div className="flex max-w-full flex-col items-center gap-0.5">
                <p className="max-w-full truncate text-sm font-semibold text-ink sm:text-base">
                  {profileHref ? (
                    <a
                      href={profileHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 hover:underline"
                    >
                      {entry.displayName}
                    </a>
                  ) : (
                    entry.displayName
                  )}
                </p>
                <div className="flex max-w-full items-center gap-1.5">
                  <p className="max-w-full truncate text-xs text-ink-muted sm:text-sm">
                    @{entry.username}
                  </p>
                  {entry.isCurrentUser ? (
                    <Badge variant="structure">{t("you")}</Badge>
                  ) : null}
                </div>
              </div>
              <p
                className={cn(
                  "display-face tabular mt-1.5 text-accent-ink",
                  first ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
                )}
              >
                {t("xpValue", { xp: format.number(entry.xp) })}
              </p>
              <div
                aria-hidden="true"
                className="podium-step mt-4"
                data-place={entry.rank}
              >
                <span className="display-face tabular text-3xl leading-none sm:text-4xl">
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
