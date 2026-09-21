import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Progress } from "@/components/ui/progress";
import { COMPLETION_FIELDS, type ProfileCompletion } from "@/lib/profile/completion";
import { cn } from "@/lib/utils";

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
