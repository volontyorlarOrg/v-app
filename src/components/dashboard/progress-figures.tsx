import { ChevronRight, Clock3, Star, Trophy, type LucideIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { LoadErrorRows, type LoadErrorLabels } from "@/components/app/load-error";
import { Link } from "@/i18n/navigation";
import type { Loaded } from "@/lib/api/load.server";
import type { Progress } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";

export type FigureLinks = { hours: string; xp: string; rank: string };

type Figure = {
  id: "hours" | "xp" | "rank";
  value: string;
  label: string;
  note?: string;
  href: string;
  Icon: LucideIcon;
  tone: "structure" | "achievement";
};

export function ProgressFigures({
  progress,
  links,
  errorLabels,
  className,
}: {
  progress: Loaded<Progress>;
  links: FigureLinks;
  errorLabels: LoadErrorLabels;
  className?: string;
}) {
  const t = useTranslations("dashboard.figures");
  const format = useFormatter();

  return (
    <section
      aria-label={t("label")}
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface",
        className,
      )}
    >
      {progress.status === "failed" ? (
        <LoadErrorRows failure={progress.failure} labels={errorLabels} />
      ) : (
        <ul className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {figuresOf(progress.data).map((figure) => (
            <li key={figure.id} className="min-w-0">
              <Link
                href={figure.href}
                className="flex h-full items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-sunk"
              >
                <span className="min-w-0">
                  <span className="figure block text-3xl text-ink">{figure.value}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                    <figure.Icon
                      aria-hidden="true"
                      className={cn(
                        "size-3.5 shrink-0",
                        figure.tone === "achievement" && "fill-accent text-accent",
                      )}
                    />
                    {figure.label}
                  </span>
                  {figure.note ? (
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      {figure.note}
                    </span>
                  ) : null}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-ink-muted"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  function figuresOf(data: Progress): Figure[] {
    return [
      {
        id: "hours",
        value: t("hoursValue", {
          hours: format.number(data.verifiedHours, { maximumFractionDigits: 2 }),
        }),
        label: t("hours"),
        href: links.hours,
        Icon: Clock3,
        tone: "structure",
      },
      {
        id: "xp",
        value: format.number(data.xp),
        label: t("xp"),
        href: links.xp,
        Icon: Star,
        tone: "achievement",
      },
      {
        id: "rank",
        value:
          data.rank === null ? "—" : t("rankValue", { rank: format.number(data.rank) }),
        label: t("rank"),
        ...(data.rank === null ? { note: t("unranked") } : {}),
        href: links.rank,
        Icon: Trophy,
        tone: "structure",
      },
    ];
  }
}
