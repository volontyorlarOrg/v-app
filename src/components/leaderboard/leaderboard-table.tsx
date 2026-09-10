import { useFormatter, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeaderboardEntry } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";

const PODIUM = 3;

const CELL = "px-4 sm:px-5";

export function LeaderboardTable({
  entries,
  viewerUsername,
}: {
  entries: readonly LeaderboardEntry[];
  viewerUsername: string | null;
}) {
  const t = useTranslations("leaderboard");
  const format = useFormatter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className={cn(CELL, "w-14 sm:w-20")}>
            {t("table.rank")}
          </TableHead>
          <TableHead scope="col" className={CELL}>
            {t("table.volunteer")}
          </TableHead>
          <TableHead scope="col" className={cn(CELL, "text-right")}>
            {t("table.xp")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => {
          const isViewer = viewerUsername !== null && entry.username === viewerUsername;
          return (
            <TableRow
              key={entry.username}
              aria-current={isViewer ? "true" : undefined}
              className={cn(isViewer && "bg-surface-soft")}
            >
              <TableCell
                className={cn(
                  CELL,
                  "tabular text-lg font-semibold",
                  entry.rank <= PODIUM ? "text-accent-ink" : "text-ink-muted",
                )}
              >
                {format.number(entry.rank)}
              </TableCell>
              <TableCell className={CELL}>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold break-words text-ink">
                    @{entry.username}
                  </span>
                  {isViewer ? <Badge variant="structure">{t("you")}</Badge> : null}
                </p>
                {entry.displayName ? (
                  <p className="mt-0.5 text-xs text-ink-muted">{entry.displayName}</p>
                ) : null}
              </TableCell>
              <TableCell
                className={cn(
                  CELL,
                  "tabular text-right font-semibold",
                  entry.rank <= PODIUM || isViewer ? "text-accent-ink" : "text-ink",
                )}
              >
                {format.number(entry.xp)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
