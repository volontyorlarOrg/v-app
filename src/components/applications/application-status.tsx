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

/**
 * Application status.
 *
 * Every status carries its own icon as well as a tone, so "accepted" and
 * "rejected" are distinguishable without colour vision — which matters here
 * more than usual, since this badge is often the only thing a volunteer scans
 * for down a list.
 */
const PRESENTATION: Record<
  ApplicationStatus,
  { tone: "neutral" | "signal" | "signalQuiet" | "success" | "danger"; Icon: typeof Send }
> = {
  draft: { tone: "neutral", Icon: FileEdit },
  submitted: { tone: "signalQuiet", Icon: Send },
  under_review: { tone: "signalQuiet", Icon: Eye },
  accepted: { tone: "success", Icon: CircleCheck },
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

/** The one-line explanation of what a status means for the volunteer. */
export function ApplicationStatusHelp({ status }: { status: ApplicationStatus }) {
  const t = useTranslations("applications.statusHelp");
  return <p className="text-sm leading-6 text-muted">{t(status)}</p>;
}
