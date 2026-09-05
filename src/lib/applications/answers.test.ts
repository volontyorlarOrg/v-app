import { describe, expect, it } from "vitest";

import { answersFromFormData } from "@/lib/applications/answers";

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
