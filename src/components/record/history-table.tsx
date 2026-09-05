import {
  CircleCheck,
  CircleSlash,
  CircleX,
  Hourglass,
  type LucideIcon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { StateChip, type ChipTone } from "@/components/dashboard/state-chip";
import type { AttendanceOutcome, ParticipationEntry } from "@/lib/record/levels";

const PRESENTATION: Record<AttendanceOutcome, { tone: ChipTone; Icon: LucideIcon }> = {
  attended: { tone: "achievement", Icon: CircleCheck },
  excused: { tone: "neutral", Icon: CircleSlash },
  cancelled: { tone: "neutral", Icon: CircleX },
  awaiting_confirmation: { tone: "structure", Icon: Hourglass },
};

export function HistoryTable({ entries }: { entries: readonly ParticipationEntry[] }) {
  const t = useTranslations("record");
  const format = useFormatter();

  if (entries.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">{t("history.empty")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
            <th scope="col" className="px-5 py-3 font-semibold">
              {t("history.date")}
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              {t("history.event")}
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              {t("history.outcome")}
            </th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">
              {t("history.hours")}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const { tone, Icon } = PRESENTATION[entry.outcome];
            return (
              <tr key={entry.id} className="border-b border-border last:border-b-0">
                <td className="tabular px-5 py-3 whitespace-nowrap text-ink-muted">
                  <time dateTime={entry.eventDate}>
                    {format.dateTime(new Date(entry.eventDate), "day")}
                  </time>
                </td>
                <td className="px-5 py-3">
                  <p className="font-semibold text-ink">
                    {entry.opportunityTitle}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {entry.organization}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <StateChip tone={tone} icon={<Icon aria-hidden="true" />}>
                    {t(`outcomes.${entry.outcome}`)}
                  </StateChip>
                </td>
                <td className="tabular px-5 py-3 text-right text-ink">
                  {entry.hours !== undefined ? format.number(entry.hours) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
