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
        "overflow-hidden rounded-lg border border-border bg-surface shadow-panel",
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
                className="flex h-full items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-sunk"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-grid size-10 shrink-0 place-items-center rounded-md",
                    figure.tone === "achievement"
                      ? "bg-accent/10 text-accent"
                      : "bg-surface-soft text-primary",
                  )}
                >
                  <figure.Icon
                    className={cn(
                      "size-5",
                      figure.tone === "achievement" && "fill-accent",
                    )}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="figure block text-2xl text-ink">{figure.value}</span>
                  <span className="block text-sm text-ink-muted">
                    {figure.label}
                    {figure.note ? (
                      <span className="block text-xs">{figure.note}</span>
                    ) : null}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
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
