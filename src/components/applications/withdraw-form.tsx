"use client";

import { useState } from "react";

import { ActionStatus } from "@/components/app/action-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useActionForm } from "@/hooks/use-action-form";
import { withdrawApplicationAction } from "@/lib/applications/actions";
import { withdrawFormSchema } from "@/lib/applications/withdraw";

export type WithdrawLabels = {
  withdraw: string;
  confirm: string;
  yes: string;
  withdrawing: string;
  cancel: string;
  errors: Record<string, string>;
  fallback: string;
};

export function WithdrawForm({
  applicationId,
  labels,
}: {
  applicationId: string;
  labels: WithdrawLabels;
}) {
  const [open, setOpen] = useState(false);
  const { form, formRef, result, pending, formProps } = useActionForm({
    schema: withdrawFormSchema,
    defaultValues: { applicationId },
    action: withdrawApplicationAction,
    onSuccess: () => setOpen(false),
  });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) setOpen(next);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {labels.withdraw}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form {...formProps} className="contents">
          <input
            type="hidden"
            {...form.register("applicationId")}
            defaultValue={applicationId}
          />
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.withdraw}</AlertDialogTitle>
            <AlertDialogDescription>{labels.confirm}</AlertDialogDescription>
          </AlertDialogHeader>
          {result.status === "error" ? (
            <ActionStatus tone="error">
              {labels.errors[result.code] ?? labels.fallback}
            </ActionStatus>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{labels.cancel}</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={pending}
              className="disabled:opacity-70"
              onClick={(event) => {
                event.preventDefault();
                formRef.current?.requestSubmit();
              }}
            >
              {pending ? labels.withdrawing : labels.yes}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
