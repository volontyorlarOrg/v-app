import type { AnswerValue } from "@/lib/applications/status";

export type AnswerInput = Record<string, AnswerValue>;

export const ANSWER_FIELD_PREFIX = "answer.";
const MULTI_SUFFIX = "[]";

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

