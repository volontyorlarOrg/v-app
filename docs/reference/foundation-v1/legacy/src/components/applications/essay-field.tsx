"use client";

import { Check, CircleAlert, Loader2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Field, Input, Textarea } from "@/components/ui/field";
import type { SaveStatus } from "@/features/applications/use-autosave";
import type { ApplicationQuestion } from "@/features/opportunities/schemas";
import { cn } from "@/lib/utils";

export function EssayField({
  question,
  value,
  onChange,
  error,
  saveStatus,
  savedAt,
}: {
  question: ApplicationQuestion;
  value: string | string[];
  onChange: (value: string | string[]) => void;

  error?: string | undefined;
  saveStatus?: SaveStatus;
  savedAt?: Date | null;
}) {
  const t = useTranslations("applications.essay");
  const common = useTranslations("common");

  if (question.type === "multi_select") {
    const selected = Array.isArray(value) ? value : [];

    return (
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-bold text-ink">{question.prompt}</legend>
        {question.helpText ? (
          <p className="text-xs leading-5 text-ink-muted">{question.helpText}</p>
        ) : null}

        <div className="flex flex-col gap-2 pt-1">
          {(question.options ?? []).map((option) => (
            <label
              key={option.value}
              className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                aria-invalid={error ? true : undefined}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selected, option.value]
                      : selected.filter((item) => item !== option.value),
                  )
                }
                className="size-4 accent-[var(--color-blue-deep)]"
              />
              {option.label}
            </label>
          ))}
        </div>

        {error ? (
          <p role="alert" className="text-xs font-bold text-danger">
            {error}
          </p>
        ) : null}
      </fieldset>
    );
  }

  const text = typeof value === "string" ? value : "";
  const over = question.maxLength !== undefined && text.length > question.maxLength;

  return (
    <Field
      label={question.prompt}
      help={question.helpText}
      error={error}
      required={question.required}
      optionalLabel={common("meta.optional")}
    >
      {(field) => (
        <div className="flex flex-col gap-1.5">
          {question.type === "long_text" ? (
            <Textarea
              {...field}
              value={text}
              onChange={(event) => onChange(event.target.value)}
              rows={8}
            />
          ) : (
            <Input
              {...field}
              value={text}
              onChange={(event) => onChange(event.target.value)}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {saveStatus ? (
              <SaveIndicator status={saveStatus} savedAt={savedAt ?? null} />
            ) : (
              <span />
            )}

            {question.maxLength !== undefined ? (
              <span
                aria-live="polite"
                className={cn(
                  "tabular-nums",
                  over ? "font-bold text-danger" : "text-ink-muted",
                )}
              >
                {over
                  ? t("charactersOver", { count: text.length - question.maxLength })
                  : t("charactersUsed", {
                      count: text.length,
                      max: question.maxLength,
                    })}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </Field>
  );
}

export function SaveIndicator({
  status,
  savedAt,
}: {
  status: SaveStatus;
  savedAt: Date | null;
}) {
  const t = useTranslations("applications.essay");
  const format = useFormatter();

  if (status === "saving" || status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-ink-muted">
        <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
        {t("autosaveSaving")}
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span
        role="alert"
        className="inline-flex items-center gap-1.5 font-bold text-danger"
      >
        <CircleAlert aria-hidden="true" className="size-3.5" />
        {t("autosaveFailed")}
      </span>
    );
  }

  if (status === "saved" && savedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-blue-deep">
        <Check aria-hidden="true" className="size-3.5" />
        {t("autosaveSaved", { time: format.dateTime(savedAt, "time") })}
      </span>
    );
  }

  return <span className="text-ink-muted">{t("autosaveIdle")}</span>;
}
