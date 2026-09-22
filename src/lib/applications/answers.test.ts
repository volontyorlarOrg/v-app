import { describe, expect, it } from "vitest";

import {
  answerFieldName,
  answersFormSchema,
  answersFormValues,
  answersFromFormData,
  essayFromFormData,
} from "@/lib/applications/answers";
import type { ApplicationQuestion } from "@/lib/opportunities/types";

describe("answersFromFormData", () => {
  it("reads single answers and multi-select answers by their field names", () => {
    const form = new FormData();
    form.set("applicationId", "a1");
    form.set("answer.q1", "Because I care.");
    form.append("answer.q2[]", "a");
    form.append("answer.q2[]", "b");

    expect(answersFromFormData(form)).toEqual({
      q1: "Because I care.",
      q2: ["a", "b"],
    });
  });

  it("leaves out blank answers so a draft does not store empty strings", () => {
    const form = new FormData();
    form.set("answer.q1", "   ");
    form.set("answer.q2", "");
    form.append("answer.q3[]", "");

    expect(answersFromFormData(form)).toEqual({});
  });
});

describe("essayFromFormData", () => {
  it("trims a written essay and omits an empty one", () => {
    const form = new FormData();
    form.set("essay", "  I want to help.  ");
    expect(essayFromFormData(form)).toBe("I want to help.");

    form.set("essay", "   ");
    expect(essayFromFormData(form)).toBeUndefined();
  });
});

const QUESTIONS: ApplicationQuestion[] = [
  { id: "why", prompt: "Why?", type: "long_text", required: true, maxLength: 20 },
  {
    id: "day",
    prompt: "Which day?",
    type: "single_select",
    required: false,
    options: [{ value: "sat", label: "Saturday" }],
  },
  {
    id: "roles",
    prompt: "Roles",
    type: "multi_select",
    required: true,
    options: [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ],
  },
];

describe("answersFormSchema", () => {
  const schema = answersFormSchema(QUESTIONS);

  it("names the form fields the way the server reads them", () => {
    expect(answerFieldName(QUESTIONS[0]!)).toBe("answer.why");
    expect(answerFieldName(QUESTIONS[2]!)).toBe("answer.roles[]");
  });

  it("mirrors required, maximum length and the offered options", () => {
    expect(
      schema.safeParse({ answer: { why: "Because", day: "", roles: ["a"] } }).success,
    ).toBe(true);
    expect(
      schema.safeParse({ answer: { why: " ", day: "", roles: ["a"] } }).success,
    ).toBe(false);
    expect(
      schema.safeParse({ answer: { why: "x".repeat(21), day: "", roles: ["a"] } })
        .success,
    ).toBe(false);
    expect(
      schema.safeParse({ answer: { why: "Because", day: "sun", roles: ["a"] } })
        .success,
    ).toBe(false);
    expect(
      schema.safeParse({ answer: { why: "Because", day: "", roles: [] } }).success,
    ).toBe(false);
  });

  it("accepts the single checkbox shapes a form control reports", () => {
    expect(
      schema.safeParse({ answer: { why: "Because", day: "", roles: "b" } }).success,
    ).toBe(true);
    expect(
      schema.safeParse({ answer: { why: "Because", day: "", roles: false } }).success,
    ).toBe(false);
  });

  it("builds default values from saved answers", () => {
    expect(
      answersFormValues(QUESTIONS, { why: "Yes", roles: ["b"] }, "My essay"),
    ).toEqual({
      answer: { why: "Yes", day: "", roles: ["b"] },
      essay: "My essay",
    });
  });

  it("requires an essay only when the vacancy asks for one", () => {
    expect(
      answersFormSchema([], true).safeParse({ answer: {}, essay: "" }).success,
    ).toBe(false);
    expect(
      answersFormSchema([], true).safeParse({
        answer: {},
        essay: "I want to contribute.",
      }).success,
    ).toBe(true);
    expect(answersFormSchema([]).safeParse({ answer: {}, essay: "" }).success).toBe(
      true,
    );
  });
});
