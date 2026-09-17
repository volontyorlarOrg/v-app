import { Lock } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { PODIUM_SIZE } from "@/components/leaderboard/leaderboard-podium";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { navHref } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

export function LeaderboardStanding({
  name,
  initials,
  username,
  rank,
  xp,
  total,
  scoring,
  handleEditable,
}: {
  name: string;
  initials: string;
  username: string;
  rank: number;
  xp: number;
  total: number;
  scoring: { event: number; hour: number };
  handleEditable: boolean;
}) {
  const t = useTranslations("leaderboard");
  const settings = useTranslations("settings.username");
  const format = useFormatter();

  return (
    <section
      aria-labelledby="standing-title"
      className="standing-card enter-rise rounded-xl border border-border [--enter-delay:90ms]"
    >
      <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar aria-hidden="true" className="size-14 shrink-0 ring-2 ring-accent/70">
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2
              id="standing-title"
              className="font-sans text-base font-semibold text-ink"
            >
              {name}
            </h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              {t("standing.appearAs")}{" "}
              <span className="font-semibold text-ink">@{username}</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {t("scoring", { event: scoring.event, hour: scoring.hour })}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 lg:shrink-0">
          <div className="min-w-0">
            <dt className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
              {t("standing.rank")}
            </dt>
            <dd
              data-place={rank <= PODIUM_SIZE ? rank : undefined}
              className={cn(
                "display-face tabular mt-1 text-3xl leading-none sm:text-4xl",
                rank <= PODIUM_SIZE ? "medal medal-ink" : "text-accent-ink",
              )}
            >
              #{format.number(rank)}
            </dd>
            <dd className="mt-1 text-xs text-ink-muted">
              {t("standing.of", { total })}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
              {t("standing.xp")}
            </dt>
            <dd className="display-face tabular mt-1 text-3xl leading-none text-accent-ink sm:text-4xl">
              {format.number(xp)}
            </dd>
            <dd className="mt-1 text-xs text-ink-muted">{t("standing.xpHelp")}</dd>
          </div>
        </dl>
      </div>
      <div className="border-t border-border/70 px-5 py-3 sm:px-6">
        {handleEditable ? (
          <Link
            href={navHref("settings")}
            className={buttonClass({ variant: "outline", size: "sm" })}
          >
            {t("standing.changeHandle")}
          </Link>
        ) : (
          <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
            <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{settings("managed")}</span>
          </p>
        )}
      </div>
    </section>
  );
}
