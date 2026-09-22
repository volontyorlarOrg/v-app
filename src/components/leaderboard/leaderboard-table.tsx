import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { initialsOf } from "@/lib/profile/initials";
import { memberProfileHref } from "@/lib/profile/public-routing";
import { cn } from "@/lib/utils";

const CELL = "px-4 sm:px-5";

export function LeaderboardTable({
  entries,
}: {
  entries: readonly LeaderboardEntry[];
}) {
  const t = useTranslations("leaderboard");
  const format = useFormatter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className={cn(CELL, "w-16 sm:w-20")}>
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
          const isViewer = entry.isCurrentUser;
          const profileHref = entry.profileVisible
            ? memberProfileHref(entry.username)
            : null;
          const identity = (
            <span className="flex items-center gap-3">
              <Avatar aria-hidden="true" className="size-9">
                {entry.avatarUrl ? <AvatarImage src={entry.avatarUrl} alt="" /> : null}
                <AvatarFallback className="text-xs">
                  {initialsOf(entry.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block text-base leading-tight font-semibold break-words text-ink">
                  {entry.displayName}
                </span>
                <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-xs break-words text-ink-muted">
                    @{entry.username}
                  </span>
                  {isViewer ? <Badge variant="structure">{t("you")}</Badge> : null}
                </span>
              </span>
            </span>
          );
          return (
            <TableRow
              key={entry.username}
              aria-current={isViewer ? "true" : undefined}
              className={cn(isViewer && "bg-surface-soft")}
            >
              <TableCell className={cn(CELL, "py-2.5")}>
                <span
                  className={cn(
                    "tabular inline-grid size-8 place-items-center rounded-full text-sm font-semibold",
                    isViewer
                      ? "bg-action text-knockout"
                      : "bg-surface-sunk text-ink-muted",
                  )}
                >
                  {format.number(entry.rank)}
                </span>
              </TableCell>
              <TableCell className={cn(CELL, "py-2.5")}>
                {profileHref ? (
                  <Link
                    href={profileHref}
                    className="block rounded-lg underline-offset-4 hover:underline"
                  >
                    {identity}
                  </Link>
                ) : (
                  identity
                )}
              </TableCell>
              <TableCell
                className={cn(
                  CELL,
                  "tabular py-2.5 text-right font-semibold text-accent-ink",
                )}
              >
                {t("xpValue", { xp: format.number(entry.xp) })}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
