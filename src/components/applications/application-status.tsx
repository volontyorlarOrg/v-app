import {
  CircleCheck,
  CircleSlash,
  CircleX,
  Eye,
  FileEdit,
  Send,
  Undo2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/features/applications/schemas";

const PRESENTATION: Record<
  ApplicationStatus,
  { tone: "neutral" | "structure" | "achievement"; Icon: typeof Send }
> = {
  draft: { tone: "neutral", Icon: FileEdit },
  submitted: { tone: "structure", Icon: Send },
  under_review: { tone: "structure", Icon: Eye },
  accepted: { tone: "achievement", Icon: CircleCheck },
  rejected: { tone: "neutral", Icon: CircleX },
  withdrawn: { tone: "neutral", Icon: Undo2 },
  closed: { tone: "neutral", Icon: CircleSlash },
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const t = useTranslations("applications.status");
  const { tone, Icon } = PRESENTATION[status];

  return (
    <Badge tone={tone} icon={<Icon aria-hidden="true" />}>
      {t(status)}
    </Badge>
  );
}

export function ApplicationStatusHelp({ status }: { status: ApplicationStatus }) {
  const t = useTranslations("applications.statusHelp");
  return <p className="text-sm leading-6 text-ink-muted">{t(status)}</p>;
}
