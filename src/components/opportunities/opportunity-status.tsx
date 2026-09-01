import { CircleCheck, CircleSlash, Clock, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  displayStatus,
  type DisplayStatus,
} from "@/features/opportunities/deadline";
import type { OpportunitySummary } from "@/features/opportunities/schemas";

const PRESENTATION: Record<
  DisplayStatus,
  { tone: "signal" | "deadline" | "neutral"; Icon: typeof Clock }
> = {
  open: { tone: "signal", Icon: CircleCheck },
  closingSoon: { tone: "deadline", Icon: Clock },
  closed: { tone: "neutral", Icon: CircleSlash },
  full: { tone: "neutral", Icon: Users },
};

/**
 * The opportunity's status as displayed.
 *
 * Derived through `displayStatus`, not read straight off the record, so a
 * listing whose deadline has passed cannot still claim to be open.
 */
export function OpportunityStatusBadge({
  opportunity,
  now,
}: {
  opportunity: Pick<OpportunitySummary, "status" | "applicationDeadline">;
  now?: Date;
}) {
  const t = useTranslations("opportunities.status");
  const status = displayStatus(opportunity, now);
  const { tone, Icon } = PRESENTATION[status];

  return (
    <Badge tone={tone} icon={<Icon aria-hidden="true" />}>
      {t(status)}
    </Badge>
  );
}
