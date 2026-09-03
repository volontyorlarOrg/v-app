import { CalendarClock } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { deadlineState } from "@/features/opportunities/deadline";

export function OpportunityDeadline({
  deadline,
  now,
}: {
  deadline: string;
  now?: Date;
}) {
  const t = useTranslations("opportunities.deadline");
  const format = useFormatter();
  const state = deadlineState(deadline, now);

  if (state.kind === "passed") {
    return <Badge tone="neutral">{t("passed")}</Badge>;
  }

  const urgent =
    state.kind === "today" || state.kind === "tomorrow" || state.kind === "soon";

  const label =
    state.kind === "today"
      ? t("today")
      : state.kind === "tomorrow"
        ? t("tomorrow")
        : state.kind === "soon"
          ? t("inDays", { days: state.days })
          : t("on", { date: format.dateTime(state.date, "short") });

  return (
    <Badge
      tone={urgent ? "urgent" : "neutral"}
      icon={urgent ? <CalendarClock aria-hidden="true" /> : undefined}
    >
      {label}
    </Badge>
  );
}
