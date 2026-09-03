import { CircleDot, CircleSlash, Timer, Users, type LucideIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { StateChip, type ChipTone } from "@/components/dashboard/state-chip";
import {
  deadlineState,
  displayStatus,
  type DisplayStatus,
} from "@/lib/opportunities/deadline";
import type { OpportunitySummary } from "@/lib/opportunities/types";

const PRESENTATION: Record<DisplayStatus, { tone: ChipTone; Icon: LucideIcon }> = {
  open: { tone: "structure", Icon: CircleDot },
  closingSoon: { tone: "structure", Icon: Timer },
  closed: { tone: "neutral", Icon: CircleSlash },
  full: { tone: "neutral", Icon: Users },
};

export function OpportunityStatusChip({
  opportunity,
  now,
}: {
  opportunity: Pick<OpportunitySummary, "status" | "applicationDeadline">;
  now: Date;
}) {
  const t = useTranslations("opportunities.status");
  const status = displayStatus(opportunity, now);
  const { tone, Icon } = PRESENTATION[status];

  return (
    <StateChip tone={tone} icon={<Icon aria-hidden="true" />}>
      {t(status)}
    </StateChip>
  );
}

export function DeadlineText({ deadline, now }: { deadline: string; now: Date }) {
  const t = useTranslations("opportunities.deadline");
  const format = useFormatter();
  const state = deadlineState(deadline, now);

  const label =
    state.kind === "passed"
      ? t("passed")
      : state.kind === "today"
        ? t("today")
        : state.kind === "tomorrow"
          ? t("tomorrow")
          : state.kind === "soon"
            ? t("inDays", { days: state.days })
            : t("on", { date: format.dateTime(state.date, "day") });

  return (
    <time dateTime={deadline} className="tabular">
      {label}
    </time>
  );
}
