import {
  CalendarClock,
  ChevronRight,
  CircleCheck,
  CircleSlash,
  CircleX,
  Clock3,
  HandHeart,
  History,
  Trophy,
  UserX,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { opportunityImageUrl } from "@/lib/opportunities/image";
import type { OpportunityKind } from "@/lib/opportunities/types";
import type { ParticipationEntry } from "@/lib/record/levels";
import {
  isPending,
  participationHref,
  participationRole,
  participationStatus,
  type ParticipationStatus,
} from "@/lib/record/participation";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<OpportunityKind, LucideIcon> = {
  volunteering: HandHeart,
  competition: Trophy,
};

const STATUS_ICON: Record<ParticipationStatus, LucideIcon> = {
  verified: CircleCheck,
  historyOnly: History,
  awaiting: Clock3,
  upcoming: CalendarClock,
  excused: CircleSlash,
  cancelled: CircleX,
  no_show: UserX,
};

const STATUS_TONE: Record<
  ParticipationStatus,
  "achievement" | "structure" | "neutral"
> = {
  verified: "achievement",
  historyOnly: "neutral",
  awaiting: "structure",
  upcoming: "structure",
  excused: "neutral",
  cancelled: "neutral",
  no_show: "neutral",
};

export function ParticipationTable({
  entries,
  now,
  label,
}: {
  entries: readonly ParticipationEntry[];
  now: Date;
  label: string;
}) {
  const t = useTranslations("record.participation");

  return (
    <div className="participation">
      <table role="table" aria-label={label} className="participation-table">
        <thead role="rowgroup">
          <tr role="row">
            <th role="columnheader" scope="col">
              {t("event")}
            </th>
            <th role="columnheader" scope="col">
              {t("date")}
            </th>
            <th role="columnheader" scope="col">
              {t("result")}
            </th>
            <th role="columnheader" scope="col" data-numeric="">
              {t("hours")}
            </th>
            <th role="columnheader" scope="col" data-numeric="">
              {t("xp")}
            </th>
            <th role="columnheader" scope="col">
              <span className="sr-only">{t("details")}</span>
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {entries.map((entry) => (
            <ParticipationRow
              key={`${entry.source}-${entry.id}`}
              entry={entry}
              now={now}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ParticipationRow({ entry, now }: { entry: ParticipationEntry; now: Date }) {
  const t = useTranslations("record.participation");
  const history = useTranslations("record.history");
  const format = useFormatter();

  const status = participationStatus(entry, now);
  const pending = isPending(status);
  const href = participationHref(entry);
  const role = participationRole(entry);
  const tone = STATUS_TONE[status];
  const StatusIcon = STATUS_ICON[status];
  const counted = status !== "historyOnly";

  const roleText =
    status !== "verified"
      ? null
      : role.type === "pastEvent"
        ? t("pastEvent")
        : role.type === "placement"
          ? history(`placements.${role.placement}`)
          : history(`kinds.${role.kind}`);

  const hours = pending
    ? t("pending")
    : entry.hours !== undefined && entry.hours > 0 && entry.kind === "volunteering"
      ? t("hoursValue", {
          hours: format.number(entry.hours, { maximumFractionDigits: 2 }),
        })
      : "—";

  const xp = pending
    ? t("pending")
    : !counted || entry.xpAwarded === undefined || entry.xpAwarded === 0
      ? "—"
      : entry.xpAwarded > 0
        ? `+${format.number(entry.xpAwarded)}`
        : `−${format.number(Math.abs(entry.xpAwarded))}`;

  return (
    <tr
      role="row"
      data-linked={href ? "" : undefined}
      data-pending={pending ? "" : undefined}
      className="participation-row"
    >
      <td role="cell" className="participation-event">
        <div className="participation-event-body">
          <EventThumb entry={entry} />
          <div className="min-w-0">
            {href ? (
              <Link
                href={href}
                className="participation-link font-semibold text-ink"
                aria-label={t("open", { title: entry.opportunityTitle })}
              >
                {entry.opportunityTitle}
              </Link>
            ) : (
              <p className="font-semibold text-ink">{entry.opportunityTitle}</p>
            )}
            <p className="text-sm text-ink-muted">{entry.organization}</p>
          </div>
        </div>
      </td>
      <td role="cell" className="participation-date">
        <time dateTime={entry.eventDate}>
          {format.dateTime(new Date(entry.eventDate), "dayYear")}
        </time>
      </td>
      <td role="cell" className="participation-result">
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <StatusIcon
            aria-hidden="true"
            className={cn(
              "size-5 shrink-0",
              tone === "achievement" && "fill-accent text-surface",
              tone === "structure" && "text-primary-ink",
              tone === "neutral" && "text-ink-muted",
            )}
          />
          <span
            className={cn(
              "font-semibold",
              tone === "achievement" && "text-accent-ink",
              tone === "structure" && "text-primary-ink",
              tone === "neutral" && "text-ink-muted",
            )}
          >
            {t(`status.${status}`)}
          </span>
          {roleText ? (
            <span className="text-ink-muted">
              <span aria-hidden="true" className="mr-2">
                ·
              </span>
              {roleText}
            </span>
          ) : null}
        </span>
      </td>
      <td role="cell" data-numeric="" className="participation-hours">
        {hours}
      </td>
      <td
        role="cell"
        data-numeric=""
        className={cn(
          "participation-xp",
          !pending && xp.startsWith("+") ? "text-accent-ink" : "text-ink-muted",
        )}
      >
        {xp}
        {!pending && xp !== "—" ? (
          <span className="participation-unit"> {t("xp")}</span>
        ) : null}
      </td>
      <td role="cell" className="participation-chevron">
        {href ? <ChevronRight aria-hidden="true" className="size-5" /> : null}
      </td>
    </tr>
  );
}

function EventThumb({ entry }: { entry: ParticipationEntry }) {
  const photo = opportunityImageUrl(entry.imageUrl);
  if (photo) {
    return (
      <Image
        unoptimized
        src={photo}
        alt=""
        width={96}
        height={96}
        className="participation-thumb object-cover"
      />
    );
  }
  const Icon = entry.source === "manual" ? History : KIND_ICON[entry.kind];
  return (
    <span
      aria-hidden="true"
      className="participation-thumb inline-grid place-items-center bg-surface-soft text-primary-ink"
    >
      <Icon className="size-5" />
    </span>
  );
}
