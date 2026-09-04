import { useFormatter, useLocale, useTranslations } from "next-intl";

import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { ApplicationSummary } from "@/lib/applications/status";
import { localized, type OpportunitySummary } from "@/lib/opportunities/types";
import { navHref, opportunityHref } from "@/lib/routing/routes";

export function placeOf(
  opportunity: OpportunitySummary,
  locale: Locale,
  t: (key: string) => string,
): string {
  if (opportunity.format === "remote") return t(`format.${opportunity.format}`);
  const named = opportunity.locationName ?? opportunity.city;
  return named ? localized(named, locale) : t(`regions.${opportunity.region}`);
}

export function NextUp({
  commitments,
}: {
  commitments: readonly ApplicationSummary[];
}) {
  const t = useTranslations("dashboard.nextUp");
  const opportunities = useTranslations("opportunities");
  const format = useFormatter();
  const locale = useLocale() as Locale;

  if (commitments.length === 0) {
    return (
      <div className="px-5 py-6">
        <p className="max-w-prose text-sm leading-relaxed text-ink-muted">
          {t("empty")}
        </p>
        <Link
          href={navHref("opportunities")}
          className={buttonClass({ variant: "outline", size: "sm", className: "mt-4" })}
        >
          {t("cta")}
        </Link>
      </div>
    );
  }

  return (
    <ol>
      {commitments.map(({ id, opportunity }) => {
        const starts = new Date(opportunity.startsAt);
        const ends = opportunity.endsAt ? new Date(opportunity.endsAt) : null;

        return (
          <li
            key={id}
            className="grid grid-cols-[3.5rem_1fr] gap-x-4 border-t border-border px-5 py-4 first:border-t-0"
          >
            <div className="rounded-lg bg-surface-soft py-2 text-center">
              <time
                dateTime={opportunity.startsAt}
                className="display-face tabular block text-3xl leading-none text-primary-ink"
              >
                {format.dateTime(starts, { day: "numeric" })}
              </time>
              <span className="mt-1 block text-xs font-semibold tracking-[0.1em] text-primary-ink uppercase">
                {format.dateTime(starts, { month: "short" })}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-balance">
                <Link
                  href={opportunityHref(opportunity.slug)}
                  className="text-ink hover:text-primary-ink"
                >
                  {localized(opportunity.title, locale)}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                {localized(opportunity.organization.name, locale)} ·{" "}
                {placeOf(opportunity, locale, opportunities)}
              </p>
              <p className="tabular mt-1 text-sm text-ink-muted">
                {format.dateTime(starts, "weekday")}, {format.dateTime(starts, "time")}
                {ends ? `–${format.dateTime(ends, "time")}` : null}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
