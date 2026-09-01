import { CalendarClock } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { deadlineState } from "@/features/opportunities/deadline";

/**
 * Renders a deadline as the thing a volunteer actually needs to know: how much
 * time is left, not a raw date they have to subtract in their head.
 *
 * Amber is used here and almost nowhere else — the design system reserves it
 * for deadlines. The icon and the words carry the same information, so the
 * urgency survives greyscale and colour blindness.
 */
export function OpportunityDeadline({
  deadline,
  now,
}: {
  deadline: string;
  /** Injectable for deterministic tests. */
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
      tone={urgent ? "deadline" : "neutral"}
      icon={urgent ? <CalendarClock aria-hidden="true" /> : undefined}
    >
      {label}
    </Badge>
  );
}
