"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useId, useMemo, useRef, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ActionStatus } from "@/components/app/action-status";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useActionOutcome, useValidatedSubmit } from "@/hooks/use-action-form";
import { idleResult, type ActionResult } from "@/lib/api/action-result";
import { saveDraftAction, submitApplicationAction } from "@/lib/applications/actions";
import {
  answerFieldName,
  answersFormSchema,
  answersFormValues,
} from "@/lib/applications/answers";
import type { AnswerValue } from "@/lib/applications/status";
import type { ApplicationQuestion } from "@/lib/opportunities/types";

export type AnswerField = ApplicationQuestion & { help: string };

export type AnswersFormLabels = {
  save: string;
  saving: string;
  submit: string;
  submitting: string;
  savedDraft: string;
  choose: string;
  fieldRequired: string;
  fieldInvalid: string;
  errors: Record<string, string>;
  fallback: string;
  profileLink: { href: string; label: string };
};

function serverFieldError(
  result: ActionResult,
  questionId: string,
): string[] | undefined {
  return result.status === "error" ? result.fields[`answers.${questionId}`] : undefined;
}

function isRequiredError(messages: readonly string[]): boolean {
  return messages.some((message) => /required/i.test(message));
}

export function AnswersForm({
  applicationId,
  questions,
  answers,
  labels,
}: {
  applicationId: string;
  questions: readonly AnswerField[];
  answers: Readonly<Record<string, AnswerValue>>;
  labels: AnswersFormLabels;
}) {
  const id = useId();
  const schema = useMemo(() => answersFormSchema(questions), [questions]);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: answersFormValues(questions, answers),
  });
  const [saveResult, save, saving] = useActionState(saveDraftAction, idleResult);
  const [submitResult, submit, submitting] = useActionState(
    submitApplicationAction,
    idleResult,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const submitWith = useValidatedSubmit(form, formRef);
  const busy = saving || submitting;
  const latest = submitResult.status !== "idle" ? submitResult : saveResult;

  useActionOutcome(saving, saveResult, (settled) => {
    if (settled.status === "ok") toast.success(labels.savedDraft);
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent =
      submitter instanceof HTMLButtonElement && submitter.value === "submit"
        ? submit
        : save;
    return submitWith(intent)(event);
  }

  const { register, formState } = form;

  return (
    <form
      ref={formRef}
      action={save}
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="applicationId" value={applicationId} />

      <FieldGroup className="gap-6">
        {questions.map((question, index) => {
          const name = answerFieldName(question);
          const path = name.replace(/\[\]$/, "") as `answer.${string}`;
          const current = answers[question.id];
          const clientError = formState.errors.answer?.[question.id]?.message;
          const serverErrors = serverFieldError(latest, question.id);
          const error =
            clientError !== undefined
              ? clientError === "required"
                ? labels.fieldRequired
                : labels.fieldInvalid
              : serverErrors
                ? isRequiredError(serverErrors)
                  ? labels.fieldRequired
                  : labels.fieldInvalid
                : undefined;
          const controlId = `${id}-${question.id}`;
          const helpId = `${controlId}-help`;
          const label = `${String(index + 1).padStart(2, "0")} · ${question.prompt}`;

          return (
            <Field key={question.id} invalid={Boolean(error)}>
              <FieldLabel
                id={`${controlId}-label`}
                htmlFor={question.type === "multi_select" ? undefined : controlId}
              >
                {label}
              </FieldLabel>
              {question.type === "long_text" ? (
                <Textarea
                  {...register(path)}
                  id={controlId}
                  aria-describedby={helpId}
                  aria-invalid={error ? true : undefined}
                  defaultValue={typeof current === "string" ? current : ""}
                  maxLength={question.maxLength}
                  required={question.required}
                />
              ) : question.type === "short_text" ? (
                <Input
                  {...register(path)}
                  id={controlId}
                  aria-describedby={helpId}
                  aria-invalid={error ? true : undefined}
                  defaultValue={typeof current === "string" ? current : ""}
                  maxLength={question.maxLength}
                  required={question.required}
                />
              ) : question.type === "single_select" ? (
                <NativeSelect
                  {...register(path)}
                  id={controlId}
                  aria-describedby={helpId}
                  aria-invalid={error ? true : undefined}
                  defaultValue={typeof current === "string" ? current : ""}
                  required={question.required}
                >
                  <NativeSelectOption value="">{labels.choose}</NativeSelectOption>
                  {(question.options ?? []).map((option) => (
                    <NativeSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              ) : (
                <ul
                  id={controlId}
                  role="group"
                  aria-labelledby={`${controlId}-label`}
                  aria-describedby={helpId}
                  className="flex flex-col gap-2"
                >
                  {(question.options ?? []).map((option) => (
                    <li key={option.value}>
                      <label className="flex min-h-11 items-center gap-3 text-sm text-ink">
                        <input
                          type="checkbox"
                          {...register(path)}
                          name={name}
                          value={option.value}
                          defaultChecked={
                            Array.isArray(current) && current.includes(option.value)
                          }
                          className="size-5 accent-action"
                        />
                        {option.label}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              <FieldDescription id={helpId}>{question.help}</FieldDescription>
              <FieldError>{error}</FieldError>
            </Field>
          );
        })}
      </FieldGroup>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          name="intent"
          value="save"
          variant="outline"
          disabled={busy}
          className="disabled:opacity-70"
        >
          {saving ? labels.saving : labels.save}
        </Button>
        <Button
          type="submit"
          name="intent"
          value="submit"
          formAction={submit}
          disabled={busy}
          className="disabled:opacity-70"
        >
          {submitting ? labels.submitting : labels.submit}
        </Button>
      </div>

      {latest.status === "error" ? (
        <ActionStatus tone="error">
          {labels.errors[latest.code] ?? labels.fallback}
          {latest.code === "profileRequired" ? (
            <>
              {" "}
              <a
                href={labels.profileLink.href}
                className="font-semibold text-primary-ink underline-offset-4 hover:underline"
              >
                {labels.profileLink.label}
              </a>
            </>
          ) : null}
        </ActionStatus>
      ) : null}
    </form>
  );
}
