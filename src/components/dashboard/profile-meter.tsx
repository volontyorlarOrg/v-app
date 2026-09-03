import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";

import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ProfileCompletion } from "@/lib/profile/completion";
import { navHref } from "@/lib/routing/routes";

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
  const missing = completion.missing.map((field) => t(`fields.${field}`)).join(", ");

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

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completion.percent}
        aria-valuetext={value}
        aria-label={t("completion.label")}
        className="meter mt-3"
      >
        <div
          className="meter-fill"
          style={{ "--meter-progress": completion.percent / 100 } as CSSProperties}
        />
      </div>

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
          href={navHref("profile")}
          className={buttonClass({ variant: "outline", size: "sm", className: "mt-4" })}
        >
          {completion.complete ? dashboard("edit") : dashboard("cta")}
        </Link>
      ) : null}
    </div>
  );
}
