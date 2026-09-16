import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { buttonClass } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "@/i18n/navigation";
import { COMPLETION_FIELDS, type ProfileCompletion } from "@/lib/profile/completion";
import { navHref } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

export function ProfileMeter({
  completion,
  withAction = true,
}: {
  completion: ProfileCompletion;
  withAction?: boolean;
}) {
  const t = useTranslations("profile");
  const dashboard = useTranslations("dashboard.profile");
  const value = t("completion.value", { percent: completion.percent });
  const missing = completion.missing
    .map((field) => t(`completionFields.${field}`))
    .join(", ");

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-ink">{t("completion.label")}</p>
        {completion.complete ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
            <CircleCheck aria-hidden="true" className="size-4" />
            {value}
          </span>
        ) : (
          <span className="tabular text-sm font-semibold text-primary-ink">
            {value}
          </span>
        )}
      </div>

      <Progress
        value={completion.percent}
        valueText={value}
        aria-label={t("completion.label")}
        className="mt-3"
      />

      {completion.complete ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {t("completion.complete")}
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-relaxed text-ink">
            {t("completion.missing", { fields: missing })}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {t("completion.why")}
          </p>
        </>
      )}

      {withAction ? (
        <Link
          href={navHref("profileEdit")}
          className={buttonClass({ variant: "outline", size: "sm", className: "mt-4" })}
        >
          {completion.complete ? dashboard("edit") : dashboard("cta")}
        </Link>
      ) : null}
    </div>
  );
}

export function ProfileMeterSummary({ completion }: { completion: ProfileCompletion }) {
  const t = useTranslations("profile");
  const value = t("completion.value", { percent: completion.percent });
  const missing = completion.missing
    .map((field) => t(`completionFields.${field}`))
    .join(", ");

  return (
    <>
      <div className="dashboard-hero-meter">
        <ul
          aria-label={t("completion.label")}
          className="flex flex-wrap gap-x-4 gap-y-2 text-xs leading-snug font-semibold"
        >
          {COMPLETION_FIELDS.map((field) => {
            const filled = !completion.missing.includes(field);
            return (
              <li
                key={field}
                className={cn(
                  "inline-flex items-center gap-1.5",
                  filled ? "text-ink" : "text-ink-muted",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    filled ? "bg-accent" : "border border-border-control",
                  )}
                />
                {t(`completionFields.${field}`)}
                <span className="sr-only">
                  {" "}
                  ({filled ? t("completion.filled") : t("completion.empty")})
                </span>
              </li>
            );
          })}
        </ul>
        <p
          className={cn(
            "mt-5 flex items-center gap-1.5 text-sm font-semibold",
            completion.complete ? "text-accent-ink" : "text-ink",
          )}
        >
          {completion.complete ? (
            <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
          ) : null}
          <span className="tabular">{value}</span>
        </p>
        <Progress
          value={completion.percent}
          valueText={value}
          aria-label={t("completion.label")}
          className="mt-2"
        />
      </div>

      <p className="text-sm leading-relaxed text-ink-muted">
        {completion.complete
          ? t("completion.complete")
          : t("completion.missing", { fields: missing })}
      </p>
    </>
  );
}
