import { ChevronRight } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { PODIUM_SIZE } from "@/components/leaderboard/leaderboard-podium";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import type { Chase } from "@/lib/leaderboard/standing";
import { cn } from "@/lib/utils";

export function LeaderboardStanding({
  initials,
  avatarUrl,
  rank,
  xp,
  total,
  chase,
  href,
}: {
  initials: string;
  avatarUrl?: string;
  rank: number;
  xp: number;
  total: number;
  chase: Chase | null;
  href: string;
}) {
  const t = useTranslations("leaderboard");
  const format = useFormatter();

  const distance =
    chase?.kind === "behind"
      ? t("standing.behind", { xp: format.number(chase.xp), place: chase.place })
      : chase?.kind === "level"
        ? t("standing.level", { place: chase.place })
        : chase?.kind === "leading"
          ? t("standing.leading")
          : null;

  return (
    <section aria-labelledby="standing-title" className="">
      <Link
        href={href}
        className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 shadow-panel transition-colors hover:bg-surface-sunk sm:px-5"
      >
        <span
          data-place={rank <= PODIUM_SIZE ? rank : undefined}
          className={cn(
            "figure shrink-0 text-xl",
            rank <= PODIUM_SIZE ? "medal medal-ink" : "text-accent-ink",
          )}
        >
          #{format.number(rank)}
        </span>
        <Avatar aria-hidden="true" className="size-8 shrink-0">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2
            id="standing-title"
            className="text-sm font-medium tracking-normal text-ink"
          >
            {t("standing.rank")}
          </h2>
          <p className="flex flex-col gap-x-2 text-xs text-ink-muted sm:flex-row sm:flex-wrap">
            <span>{t("standing.of", { total })}</span>
            {distance ? (
              <>
                <span>{distance}</span>
              </>
            ) : null}
          </p>
        </div>
        <span className="figure shrink-0 text-sm text-accent-ink">
          {t("xpValue", { xp: format.number(xp) })}
        </span>
        <span className="sr-only">{t("standing.show")}</span>
        <ChevronRight
          aria-hidden="true"
          className="hidden size-4 shrink-0 text-ink-muted sm:block"
        />
      </Link>
    </section>
  );
}
