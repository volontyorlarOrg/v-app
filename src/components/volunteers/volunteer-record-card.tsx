import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import {
  isReliabilityMeaningful,
  levelProgress,
  reliabilityPercent,
  type RecordCounts,
} from "@/features/record/levels";

/**
 * The volunteer record.
 *
 * Displays only what the record actually supports. Reliability is shown as
 * "not enough confirmed events yet" rather than a percentage until there are
 * enough resolved events for the number to mean anything — one absence out of
 * two events is not a 50% reliability rating, it is noise.
 *
 * No stars, no score, no ranking against other volunteers. Every number here
 * traces to a counted, organiser-confirmed event.
 */
export function VolunteerRecordCard({
  counts,
  hours,
  hoursVerified,
}: {
  counts: RecordCounts;
  hours?: number | undefined;
  hoursVerified?: boolean;
}) {
  const t = useTranslations("record");
  const progress = levelProgress(counts);
  const percent = reliabilityPercent(counts);
  const meaningful = isReliabilityMeaningful(counts);

  return (
    <Surface padding="md" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-extrabold tracking-[0.14em] text-muted uppercase">
            {t("level.label")}
          </span>
          <span className="font-display text-2xl font-semibold text-teal">
            {t(`level.${progress.current}`)}
          </span>
        </div>

        {progress.next ? (
          <div className="flex flex-col items-end gap-1 text-right">
            <Badge tone="signalQuiet">
              {t("level.nextLevel", { level: t(`level.${progress.next}`) })}
            </Badge>
            {progress.eventsNeeded !== null ? (
              <span className="text-xs text-muted">
                {t("level.nextLevelNeeds", { events: progress.eventsNeeded })}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <Stat label={t("stats.eventsCompleted")} value={String(counts.attended)} />

        <Stat
          label={t("stats.reliability")}
          value={meaningful && percent !== null ? `${percent}%` : "—"}
          help={meaningful ? t("stats.reliabilityHelp") : t("stats.reliabilityPending")}
        />

        {hours !== undefined ? (
          <Stat
            label={t("stats.hours")}
            value={String(hours)}
            help={hoursVerified ? undefined : t("stats.hoursUnverified")}
          />
        ) : null}
      </dl>

      {counts.acceptedUnconfirmed > 0 ? (
        // The single most important sentence on this page: an organiser who
        // never confirms must not cost the volunteer anything.
        <p className="rounded-lg bg-field p-3 text-xs leading-6 text-muted">
          {t("attendance.awaitingHelp")}
        </p>
      ) : null}

      <p className="text-xs leading-6 text-muted/80">{t("level.explain")}</p>
    </Surface>
  );
}

function Stat({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help?: string | undefined;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-extrabold tracking-[0.14em] text-muted uppercase">
        {label}
      </dt>
      <dd className="font-display text-xl font-semibold tabular-nums text-ink">
        {value}
      </dd>
      {help ? <p className="text-xs leading-5 text-muted">{help}</p> : null}
    </div>
  );
}
