"use client";

import { useActionState } from "react";

import { ActionStatus } from "@/components/app/action-status";
import { buttonClass } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { idleResult, type ActionResult } from "@/lib/api/action-result";
import { saveDraftAction, submitApplicationAction } from "@/lib/applications/actions";
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

const FIELD_PREFIX = "answer.";

function fieldName(question: ApplicationQuestion): string {
  return `${FIELD_PREFIX}${question.id}${question.type === "multi_select" ? "[]" : ""}`;
}

function fieldError(result: ActionResult, questionId: string): string[] | undefined {
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
  const [saveResult, save, saving] = useActionState(saveDraftAction, idleResult);
  const [submitResult, submit, submitting] = useActionState(
    submitApplicationAction,
    idleResult,
  );
  const busy = saving || submitting;
  const latest = submitResult.status !== "idle" ? submitResult : saveResult;

  return (
    <form action={save} className="flex flex-col gap-6">
      <input type="hidden" name="applicationId" value={applicationId} />

      {questions.map((question, index) => {
        const name = fieldName(question);
        const current = answers[question.id];
        const errors = fieldError(latest, question.id);

        return (
          <Field
            key={question.id}
            label={`${String(index + 1).padStart(2, "0")} · ${question.prompt}`}
            help={question.help}
            group={question.type === "multi_select"}
          >
            {(control) => (
              <div>
                {question.type === "long_text" ? (
                  <Textarea
                    {...control}
                    name={name}
                    defaultValue={typeof current === "string" ? current : ""}
                    maxLength={question.maxLength}
                    required={question.required}
                    aria-invalid={errors ? true : undefined}
                  />
                ) : question.type === "short_text" ? (
                  <Input
                    {...control}
                    name={name}
                    defaultValue={typeof current === "string" ? current : ""}
                    maxLength={question.maxLength}
                    required={question.required}
                    aria-invalid={errors ? true : undefined}
                  />
                ) : question.type === "single_select" ? (
                  <Select
                    {...control}
                    name={name}
                    defaultValue={typeof current === "string" ? current : ""}
                    required={question.required}
                    aria-invalid={errors ? true : undefined}
                  >
                    <option value="">{labels.choose}</option>
                    {(question.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <ul {...control} className="flex flex-col gap-2">
                    {(question.options ?? []).map((option) => (
                      <li key={option.value}>
                        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
                          <input
                            type="checkbox"
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
                {errors ? (
                  <p role="alert" className="mt-1.5 text-sm text-ink">
                    {isRequiredError(errors)
                      ? labels.fieldRequired
                      : labels.fieldInvalid}
                  </p>
                ) : null}
              </div>
            )}
          </Field>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className={buttonClass({
            variant: "outline",
            className: "disabled:opacity-70",
          })}
        >
          {saving ? labels.saving : labels.save}
        </button>
        <button
          type="submit"
          formAction={submit}
          formNoValidate
          disabled={busy}
          className={buttonClass({ className: "disabled:opacity-70" })}
        >
          {submitting ? labels.submitting : labels.submit}
        </button>
      </div>

      {saveResult.status === "ok" && submitResult.status === "idle" ? (
        <ActionStatus tone="done">{labels.savedDraft}</ActionStatus>
      ) : null}
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
