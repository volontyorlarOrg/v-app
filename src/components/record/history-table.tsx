import {
  CircleCheck,
  CircleSlash,
  CircleX,
  Hourglass,
  type LucideIcon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { StateChip, type ChipTone } from "@/components/dashboard/state-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <Table className="min-w-[40rem]">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">{t("history.date")}</TableHead>
          <TableHead scope="col">{t("history.event")}</TableHead>
          <TableHead scope="col">{t("history.outcome")}</TableHead>
          <TableHead scope="col" className="text-right">
            {t("history.hours")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => {
          const { tone, Icon } = PRESENTATION[entry.outcome];
          return (
            <TableRow key={entry.id}>
              <TableCell className="tabular whitespace-nowrap text-ink-muted">
                <time dateTime={entry.eventDate}>
                  {format.dateTime(new Date(entry.eventDate), "day")}
                </time>
              </TableCell>
              <TableCell>
                <p className="font-semibold text-ink">{entry.opportunityTitle}</p>
                <p className="text-xs text-ink-muted">{entry.organization}</p>
              </TableCell>
              <TableCell>
                <StateChip tone={tone} icon={<Icon aria-hidden="true" />}>
                  {t(`outcomes.${entry.outcome}`)}
                </StateChip>
              </TableCell>
              <TableCell className="tabular text-right text-ink">
                {entry.hours !== undefined ? format.number(entry.hours) : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
