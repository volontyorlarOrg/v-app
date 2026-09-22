import { z } from "zod";

import type { AnswerValue } from "@/lib/applications/status";
import type { ApplicationQuestion } from "@/lib/opportunities/types";

export type AnswerInput = Record<string, AnswerValue>;

export const ANSWER_FIELD_PREFIX = "answer.";
export const MAX_ESSAY_LENGTH = 5000;
const MULTI_SUFFIX = "[]";

export function essayFromFormData(formData: FormData): string | undefined {
  const value = formData.get("essay");
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function answersFromFormData(formData: FormData): AnswerInput {
  const answers: AnswerInput = {};

  for (const key of new Set(formData.keys())) {
    if (!key.startsWith(ANSWER_FIELD_PREFIX)) continue;

    if (key.endsWith(MULTI_SUFFIX)) {
      const questionId = key.slice(ANSWER_FIELD_PREFIX.length, -MULTI_SUFFIX.length);
      const values = formData
        .getAll(key)
        .filter((item): item is string => typeof item === "string" && item !== "");
      if (values.length > 0) answers[questionId] = values;
      continue;
    }

    const value = formData.get(key);
    if (typeof value === "string" && value.trim() !== "") {
      answers[key.slice(ANSWER_FIELD_PREFIX.length)] = value;
    }
  }

  return answers;
}

export function answerFieldName(question: ApplicationQuestion): string {
  return `${ANSWER_FIELD_PREFIX}${question.id}${
    question.type === "multi_select" ? MULTI_SUFFIX : ""
  }`;
}

function textAnswer(question: ApplicationQuestion) {
  let schema = z.string().trim();
  if (question.maxLength) schema = schema.max(question.maxLength, "tooLong");
  return question.required ? schema.min(1, "required") : schema;
}

function selectionAnswer(question: ApplicationQuestion) {
  const values = (question.options ?? []).map((option) => option.value);
  const allowed = z.string().refine((value) => value === "" || values.includes(value), {
    message: "invalid",
  });
  return question.required
    ? allowed.refine((value) => value !== "", "required")
    : allowed;
}

function selectionsAnswer(question: ApplicationQuestion) {
  const values = new Set((question.options ?? []).map((option) => option.value));
  const list = z.preprocess(
    (value) =>
      Array.isArray(value)
        ? value
        : typeof value === "string" && value !== ""
          ? [value]
          : [],
    z.array(z.string().refine((value) => values.has(value), { message: "invalid" })),
  );
  return question.required
    ? list.refine((value) => value.length > 0, "required")
    : list;
}

export function answersFormSchema(
  questions: readonly ApplicationQuestion[],
  essayRequired = false,
) {
  return z.object({
    answer: z.object(
      Object.fromEntries(
        questions.map((question) => [
          question.id,
          question.type === "multi_select"
            ? selectionsAnswer(question)
            : question.type === "single_select"
              ? selectionAnswer(question)
              : textAnswer(question),
        ]),
      ),
    ),
    essay: essayRequired
      ? z.string().trim().min(1, "required").max(MAX_ESSAY_LENGTH, "tooLong")
      : z.string().trim().max(MAX_ESSAY_LENGTH, "tooLong").optional(),
  });
}

export function answersFormValues(
  questions: readonly ApplicationQuestion[],
  answers: Readonly<Record<string, AnswerValue>>,
  essay = "",
): { answer: Record<string, string | string[]>; essay: string } {
  return {
    answer: Object.fromEntries(
      questions.map((question) => {
        const current = answers[question.id];
        return [
          question.id,
          question.type === "multi_select"
            ? Array.isArray(current)
              ? current
              : []
            : typeof current === "string"
              ? current
              : "",
        ];
      }),
    ),
    essay,
  };
}
