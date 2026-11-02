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
    <section
      aria-labelledby="standing-title"
      className="enter-rise [--enter-delay:90ms]"
    >
      <Link
        href={href}
        className="standing-card group flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:border-primary sm:gap-4 sm:px-5"
      >
        <span
          data-place={rank <= PODIUM_SIZE ? rank : undefined}
          className={cn(
            "display-face tabular shrink-0 text-2xl leading-none sm:text-3xl",
            rank <= PODIUM_SIZE ? "medal medal-ink" : "text-accent-ink",
          )}
        >
          #{format.number(rank)}
        </span>
        <Avatar aria-hidden="true" className="size-10 shrink-0 ring-2 ring-accent/70">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2
            id="standing-title"
            className="font-sans text-base leading-tight font-semibold text-ink"
          >
            {t("standing.rank")}
          </h2>
          <p className="mt-1 flex flex-col gap-x-1.5 text-xs leading-snug text-ink-muted sm:flex-row sm:flex-wrap sm:text-sm">
            <span>{t("standing.of", { total })}</span>
            {distance ? (
              <>
                <span aria-hidden="true" className="hidden sm:inline">
                  ·
                </span>
                <span className="font-semibold text-ink">{distance}</span>
              </>
            ) : null}
          </p>
        </div>
        <span className="tabular shrink-0 text-base font-semibold text-accent-ink sm:text-lg">
          {t("xpValue", { xp: format.number(xp) })}
        </span>
        <span className="sr-only">{t("standing.show")}</span>
        <ChevronRight
          aria-hidden="true"
          className="hidden size-5 shrink-0 text-ink-muted transition-colors group-hover:text-primary-ink sm:block"
        />
      </Link>
    </section>
  );
}
