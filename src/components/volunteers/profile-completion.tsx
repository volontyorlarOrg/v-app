import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProfileCompletion } from "@/features/profile/schemas";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";

export function ProfileCompletionCard({
  completion,
  fieldLabels,
}: {
  completion: ProfileCompletion;
  fieldLabels: string[];
}) {
  const t = useTranslations("profile.completion");

  return (
    <Surface padding="md" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-ink">{t("label")}</h2>

        {completion.complete ? (
          <Badge tone="achievementSolid" icon={<CircleCheck aria-hidden="true" />}>
            {t("value", { percent: completion.percent })}
          </Badge>
        ) : (
          <span className="text-sm font-semibold text-blue-deep tabular-nums">
            {t("value", { percent: completion.percent })}
          </span>
        )}
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completion.percent}
        aria-valuetext={t("value", { percent: completion.percent })}
        aria-label={t("label")}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-strong"
      >
        <div
          className="h-full rounded-full bg-blue-deep transition-[width] duration-500"
          style={{ width: `${completion.percent}%` }}
        />
      </div>

      {completion.complete ? (
        <p className="text-xs leading-6 text-ink-muted">{t("complete")}</p>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-xs leading-6 text-ink-muted">
            {t("missing", { fields: fieldLabels.join(", ") })}
          </p>
          <p className="text-xs leading-6 text-ink-muted">{t("why")}</p>
        </div>
      )}
    </Surface>
  );
}
