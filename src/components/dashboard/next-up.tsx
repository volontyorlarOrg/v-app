import { useTranslations } from "next-intl";

import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ApplicationSummary } from "@/lib/applications/status";
import { navHref } from "@/lib/routing/routes";

export function NextUp({
  commitments,
  saved,
  now,
}: {
  commitments: readonly ApplicationSummary[];
  saved: ReadonlySet<string>;
  now: Date;
}) {
  const t = useTranslations("dashboard.nextUp");

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
    <ul className="grid gap-4 px-5 py-5 md:grid-cols-2">
      {commitments.map((application) => (
        <li key={application.id} className="flex">
          <OpportunityCard
            opportunity={application.opportunity}
            saved={saved.has(application.opportunity.id)}
            application={{
              id: application.id,
              status: application.status,
              updatedAt: application.updatedAt,
            }}
            now={now}
          />
        </li>
      ))}
    </ul>
  );
}
