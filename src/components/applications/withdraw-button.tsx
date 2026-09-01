"use client";

import { useAction } from "next-safe-action/hooks";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { withdrawApplicationAction } from "@/features/applications/actions";
import { ConfirmDialog } from "./confirm-dialog";

export function WithdrawButton({ applicationId }: { applicationId: string }) {
  const t = useTranslations("applications.detail");
  const common = useTranslations("common");
  const errors = useTranslations("errors");
  const router = useRouter();

  const withdraw = useAction(withdrawApplicationAction, {
    onSuccess() {
      toast.success(t("withdrawn"));
      router.refresh();
    },
    onError({ error }) {
      const code = error.serverError ?? "server";
      toast.error(errors(`${code}.title`), { description: errors(`${code}.body`) });
    },
  });

  return (
    <ConfirmDialog
      trigger={
        <Button variant="danger" disabled={withdraw.isPending}>
          {t("withdraw")}
        </Button>
      }
      title={t("withdrawTitle")}
      description={t("withdrawBody")}
      confirmLabel={t("withdrawConfirm")}
      cancelLabel={common("action.cancel")}
      destructive
      pending={withdraw.isPending}
      onConfirm={() => withdraw.execute({ applicationId })}
    />
  );
}
