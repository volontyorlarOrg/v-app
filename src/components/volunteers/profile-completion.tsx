import { useTranslations } from "next-intl";
import type { ProfileCompletion } from "@/features/profile/schemas";
import { Surface } from "@/components/ui/surface";

/**
 * Profile completeness.
 *
 * Shown only because the completion model is explicitly defined — the fields
 * that count and why live in `features/profile/schemas.ts`. A percentage with
 * no stated rule behind it would be exactly the kind of unexplained number
 * handoff §18 rules out.
 */
export function ProfileCompletionCard({
  completion,
  fieldLabels,
}: {
  completion: ProfileCompletion;
  /** Translated names of the missing fields, resolved by the caller. */
  fieldLabels: string[];
}) {
  const t = useTranslations("profile.completion");

  return (
    <Surface padding="md" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-ink">{t("label")}</h2>
        <span className="text-sm font-bold tabular-nums text-teal">
          {t("value", { percent: completion.percent })}
        </span>
      </div>

      {/*
        A real progress element: assistive technology reads the value without
        needing the visual bar, and `aria-valuetext` gives it as a sentence
        rather than a bare number.
      */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completion.percent}
        aria-valuetext={t("value", { percent: completion.percent })}
        aria-label={t("label")}
        className="h-2 w-full overflow-hidden rounded-full bg-field"
      >
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-500"
          style={{ width: `${completion.percent}%` }}
        />
      </div>

      {completion.complete ? (
        <p className="text-xs leading-6 text-teal">{t("complete")}</p>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-xs leading-6 text-muted">
            {t("missing", { fields: fieldLabels.join(", ") })}
          </p>
          <p className="text-xs leading-6 text-muted/80">{t("why")}</p>
        </div>
      )}
    </Surface>
  );
}
