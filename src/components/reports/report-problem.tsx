"use client";

import { MessageSquareWarning } from "lucide-react";
import {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ActionStatus } from "@/components/app/action-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useActionForm } from "@/hooks/use-action-form";
import { usePathname } from "@/i18n/navigation";
import { submitReportAction } from "@/lib/reports/actions";
import { REPORT_DESCRIPTION_MAX, reportFormSchema } from "@/lib/reports/schema";

export type ReportLabels = {
  trigger: string;
  title: string;
  help: string;
  description: string;
  placeholder: string;
  privacy: string;
  page: string;
  submit: string;
  pending: string;
  cancel: string;
  close: string;
  success: string;
  fieldInvalid: string;
  failure: string;
  errors: Record<string, string>;
};
type Draft = { submissionId: string; pagePath: string; returnFocus: HTMLElement };
const ReportContext = createContext<{
  open: (returnFocus: HTMLElement) => void;
  label: string;
} | null>(null);

export function ReportProblemProvider({
  labels,
  children,
}: {
  labels: ReportLabels;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [draft, setDraft] = useState<Draft | null>(null);
  return (
    <ReportContext.Provider
      value={{
        label: labels.trigger,
        open: (returnFocus) =>
          setDraft({
            pagePath: pathname,
            submissionId: crypto.randomUUID(),
            returnFocus,
          }),
      }}
    >
      {children}
      {draft ? (
        <ReportDialog
          key={draft.submissionId}
          draft={draft}
          labels={labels}
          onClose={() => setDraft(null)}
        />
      ) : null}
    </ReportContext.Provider>
  );
}

export function ReportProblemButton({
  variant = "shell",
  onClick,
  returnFocusRef,
}: {
  variant?: "shell" | "menu";
  onClick?: () => void;
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
}) {
  const report = useContext(ReportContext);
  if (!report) return null;
  return (
    <button
      type="button"
      onClick={(event) => {
        onClick?.();
        report.open(returnFocusRef?.current ?? event.currentTarget);
      }}
      className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition-colors ${variant === "shell" ? "text-shell-muted hover:bg-shell-raised hover:text-shell-ink" : "text-ink hover:bg-surface-soft hover:text-primary-ink focus-visible:bg-surface-soft"}`}
    >
      <MessageSquareWarning
        aria-hidden="true"
        className={
          variant === "shell" ? "size-5 shrink-0" : "size-4 shrink-0 text-primary"
        }
      />
      {report.label}
    </button>
  );
}

function ReportDialog({
  draft,
  labels,
  onClose,
}: {
  draft: Draft;
  labels: ReportLabels;
  onClose: () => void;
}) {
  const id = useId();
  const { form, formProps, result, pending } = useActionForm({
    schema: reportFormSchema,
    defaultValues: { description: "" },
    action: submitReportAction,
    onSuccess: () => {
      toast.success(labels.success);
      onClose();
    },
  });
  const description = useWatch({ control: form.control, name: "description" });
  const invalid =
    Boolean(form.formState.errors.description) ||
    (result.status === "error" && Boolean(result.fields.description));
  const descriptionCode =
    form.formState.errors.description?.message ??
    (result.status === "error" ? result.fields.description?.[0] : undefined);
  const fieldError = labels.errors[descriptionCode ?? ""] ?? labels.fieldInvalid;
  const failure =
    result.status === "error" ? (labels.errors[result.code] ?? labels.failure) : null;
  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !pending) onClose();
      }}
    >
      <DialogContent
        closeLabel={labels.close}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (draft.returnFocus.isConnected) draft.returnFocus.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.help}</DialogDescription>
        </DialogHeader>
        <form {...formProps} className="flex min-w-0 flex-col gap-5">
          <input type="hidden" name="submissionId" value={draft.submissionId} />
          <input type="hidden" name="pagePath" value={draft.pagePath} />
          <Field invalid={invalid}>
            <FieldLabel htmlFor={id}>{labels.description}</FieldLabel>
            <Textarea
              {...form.register("description")}
              id={id}
              value={description}
              required
              maxLength={REPORT_DESCRIPTION_MAX}
              placeholder={labels.placeholder}
              aria-invalid={invalid || undefined}
              aria-describedby={`${id}-help${invalid ? ` ${id}-error` : ""}`}
              disabled={pending}
            />
            <FieldDescription id={`${id}-help`}>{labels.privacy}</FieldDescription>
            {invalid ? <FieldError id={`${id}-error`}>{fieldError}</FieldError> : null}
          </Field>
          <p className="min-w-0 text-xs leading-5 text-ink-muted">
            <span className="font-semibold">{labels.page}</span>{" "}
            <span className="wrap-anywhere">{draft.pagePath}</span>
          </p>
          {failure ? <ActionStatus tone="error">{failure}</ActionStatus> : null}
          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={pending}
            >
              {labels.cancel}
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? labels.pending : labels.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
