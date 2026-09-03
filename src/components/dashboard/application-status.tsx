import {
  CircleCheck,
  CircleSlash,
  CircleX,
  Eye,
  SquarePen,
  Send,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { StateChip, type ChipTone } from "@/components/dashboard/state-chip";
import type { ApplicationStatus } from "@/lib/applications/status";

const PRESENTATION: Record<ApplicationStatus, { tone: ChipTone; Icon: LucideIcon }> = {
  draft: { tone: "neutral", Icon: SquarePen },
  submitted: { tone: "structure", Icon: Send },
  under_review: { tone: "structure", Icon: Eye },
  accepted: { tone: "achievement", Icon: CircleCheck },
  rejected: { tone: "neutral", Icon: CircleX },
  withdrawn: { tone: "neutral", Icon: Undo2 },
  closed: { tone: "neutral", Icon: CircleSlash },
};

export function ApplicationStatusChip({ status }: { status: ApplicationStatus }) {
  const t = useTranslations("applications.status");
  const { tone, Icon } = PRESENTATION[status];

  return (
    <StateChip tone={tone} icon={<Icon aria-hidden="true" />}>
      {t(status)}
    </StateChip>
  );
}
