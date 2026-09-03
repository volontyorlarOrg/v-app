"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  saveDraftAction,
  submitApplicationAction,
} from "@/features/applications/actions";
import { buildAnswersSchema, type DraftAnswers } from "@/features/applications/schemas";
import { useAutosave } from "@/features/applications/use-autosave";
import type { ApplicationQuestion } from "@/features/opportunities/schemas";
import { useValidationMessage } from "@/lib/forms/use-validation-message";
import { ConfirmDialog } from "./confirm-dialog";
import { EssayField, SaveIndicator } from "./essay-field";

export function ApplicationForm({
  applicationId,
  opportunityTitle,
  questions,
  defaultAnswers,
  editable,
}: {
  applicationId: string;
  opportunityTitle: string;
  questions: ApplicationQuestion[];
  defaultAnswers: DraftAnswers;
  editable: boolean;
}) {
  const t = useTranslations("applications.form");
  const common = useTranslations("common");
  const errors = useTranslations("errors");
  const messageFor = useValidationMessage();
  const router = useRouter();

  const schema = buildAnswersSchema(questions);

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",

    defaultValues: Object.fromEntries(
      questions.map((question) => [
        question.id,
        defaultAnswers[question.id] ?? (question.type === "multi_select" ? [] : ""),
      ]),
    ),
  });

  const values = form.watch();

  const saveDraft = useAction(saveDraftAction);
  const submit = useAction(submitApplicationAction, {
    onSuccess() {
      toast.success(t("submitted"));

      router.refresh();
    },
    onError({ error }) {
      const code = error.serverError ?? "server";
      toast.error(errors(`${code}.title`), {
        description: errors(`${code}.body`),
      });
    },
  });

  const persist = useCallback(
    async (answers: Record<string, unknown>) => {
      const result = await saveDraft.executeAsync({
        applicationId,
        answers: answers as DraftAnswers,
      });

      if (result?.serverError) throw new Error(result.serverError);
    },
    [applicationId, saveDraft],
  );

  const autosave = useAutosave({
    value: values,
    onSave: persist,
    enabled: editable,
  });

  async function onSubmit(answers: Record<string, unknown>) {
    await autosave.flush();
    submit.execute({ applicationId, answers: answers as DraftAnswers });
  }

  const submitting = submit.isPending;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <Surface padding="md" className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{t("questions")}</h2>
        <p className="text-sm leading-6 text-ink-muted">{t("questionsHelp")}</p>
      </Surface>

      <div className="flex flex-col gap-6">
        {questions.map((question) => (
          <Controller
            key={question.id}
            name={question.id}
            control={form.control}
            render={({ field, fieldState }) => (
              <EssayField
                question={question}
                value={field.value as string | string[]}
                onChange={field.onChange}
                error={messageFor(fieldState.error?.message, question.maxLength)}
                saveStatus={editable ? autosave.status : undefined}
                savedAt={autosave.savedAt}
              />
            )}
          />
        ))}
      </div>

      {submit.result?.serverError ? (
        <p role="alert" className="text-sm font-bold text-danger">
          {errors(`${submit.result.serverError}.title`)}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <SaveIndicator status={autosave.status} savedAt={autosave.savedAt} />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            size="lg"
            disabled={!editable || submitting}
            onClick={() => void autosave.flush()}
          >
            {common("action.saveDraft")}
          </Button>

          <ConfirmDialog
            trigger={
              <Button size="lg" disabled={!editable || submitting}>
                {common("action.submit")}
              </Button>
            }
            title={t("submitTitle")}
            description={t("submitBody")}
            confirmLabel={t("submitConfirm")}
            cancelLabel={common("action.cancel")}
            pending={submitting}
            onConfirm={() => void form.handleSubmit(onSubmit)()}
          />
        </div>
      </div>

      <p className="sr-only">{opportunityTitle}</p>
    </form>
  );
}
