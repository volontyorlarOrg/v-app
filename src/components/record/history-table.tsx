import {
  CircleCheck,
  CircleSlash,
  CircleX,
  Hourglass,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { EmptyState } from "@/components/app/empty-state";
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
  no_show: { tone: "neutral", Icon: UserX },
  awaiting_confirmation: { tone: "structure", Icon: Hourglass },
};

export function HistoryTable({ entries }: { entries: readonly ParticipationEntry[] }) {
  const t = useTranslations("record");
  const format = useFormatter();

  if (entries.length === 0) {
    return <EmptyState body={t("history.empty")} />;
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
          <TableHead scope="col" className="text-right">
            {t("history.xp")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => {
          const manual = entry.source === "manual";
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
                <p className="text-xs text-ink-muted">
                  {entry.organization} ·{" "}
                  {manual ? t("history.adminAdded") : t(`history.kinds.${entry.kind}`)}
                </p>
              </TableCell>
              <TableCell>
                <StateChip
                  tone={manual && !entry.countsTowardProgress ? "neutral" : tone}
                  icon={<Icon aria-hidden="true" />}
                >
                  {manual ? t("history.manual") : t(`outcomes.${entry.outcome}`)}
                </StateChip>
                {manual ? (
                  <p className="mt-1 text-xs text-ink-muted">
                    {entry.countsTowardProgress
                      ? t("history.counted")
                      : t("history.notCounted")}
                  </p>
                ) : null}
                {entry.placement && entry.kind === "competition" ? (
                  <p className="mt-1 text-xs text-ink-muted">
                    {t(`history.placements.${entry.placement}`)}
                  </p>
                ) : null}
              </TableCell>
              <TableCell className="tabular text-right text-ink">
                {entry.hours !== undefined ? format.number(entry.hours) : "—"}
              </TableCell>
              <TableCell className="tabular text-right font-semibold text-accent-ink">
                {manual && !entry.countsTowardProgress
                  ? "—"
                  : entry.xpAwarded === undefined
                    ? "—"
                    : entry.xpAwarded > 0
                      ? `+${entry.xpAwarded}`
                      : entry.xpAwarded < 0
                        ? `−${Math.abs(entry.xpAwarded)}`
                        : "0"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
