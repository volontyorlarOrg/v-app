import { describe, expect, it } from "vitest";

import {
  FORM_STEPS,
  FORM_STEP_COUNT,
  ONBOARDING_STEPS,
  PROFILE_STEP_FIELDS,
  completedFormSteps,
  formStepNumber,
  isFormStep,
  isOnboardingStep,
  isProfileStep,
  nextStep,
  passParts,
  previousStep,
  stepIndex,
} from "@/lib/onboarding/steps";
import { COMPLETION_FIELDS, EMPTY_PROFILE } from "@/lib/profile/completion";

describe("onboarding steps", () => {
  it("opens with a welcome, ends with done, and walks forward one step at a time", () => {
    expect(ONBOARDING_STEPS[0]).toBe("welcome");
    expect(ONBOARDING_STEPS.at(-1)).toBe("done");
    expect(nextStep("welcome")).toBe("username");
    expect(nextStep("username")).toBe("about");
    expect(nextStep("contact")).toBe("done");
    expect(nextStep("done")).toBe("done");
  });

  it("walks back inside the form steps only", () => {
    expect(previousStep("username")).toBe("welcome");
    expect(previousStep("about")).toBe("username");
    expect(previousStep("place")).toBe("about");
    expect(previousStep("welcome")).toBeNull();
    expect(previousStep("done")).toBeNull();
  });

  it("numbers the form steps from one and counts the completed ones", () => {
    expect(FORM_STEP_COUNT).toBe(4);
    expect(FORM_STEPS).toEqual(["username", "about", "place", "contact"]);
    expect(FORM_STEPS.map(formStepNumber)).toEqual([1, 2, 3, 4]);
    expect(completedFormSteps("welcome")).toBe(0);
    expect(completedFormSteps("username")).toBe(0);
    expect(completedFormSteps("about")).toBe(1);
    expect(completedFormSteps("contact")).toBe(3);
    expect(completedFormSteps("done")).toBe(4);
  });

  it("recognises the step kinds", () => {
    expect(isOnboardingStep("place")).toBe(true);
    expect(isOnboardingStep("finish")).toBe(false);
    expect(isFormStep("contact")).toBe(true);
    expect(isFormStep("username")).toBe(true);
    expect(isFormStep("welcome")).toBe(false);
    expect(isProfileStep("contact")).toBe(true);
    expect(isProfileStep("username")).toBe(false);
    expect(isProfileStep("done")).toBe(false);
    expect(stepIndex("done")).toBe(ONBOARDING_STEPS.length - 1);
  });

  it("asks for every field that counts toward profile completeness", () => {
    const covered = new Set<string>(Object.values(PROFILE_STEP_FIELDS).flat());
    for (const field of COMPLETION_FIELDS) {
      expect(covered.has(field), field).toBe(true);
    }
  });

  it("asks where the volunteer studies in one step, grade and city included", () => {
    expect(PROFILE_STEP_FIELDS.place).toEqual([
      "school",
      "gradeYear",
      "region",
      "city",
      "languages",
    ]);
  });

  it("derives the pass parts from saved data, not from the step alone", () => {
    expect(passParts(EMPTY_PROFILE, "about")).toEqual({
      name: false,
      place: false,
      languages: false,
      contact: false,
      sealed: false,
    });

    const filled = {
      ...EMPTY_PROFILE,
      fullName: "Dilnoza Karimova",
      region: "tashkent-city" as const,
      languages: ["uz"],
      telegram: "dilnoza_k",
    };
    expect(passParts(filled, "contact")).toEqual({
      name: true,
      place: true,
      languages: true,
      contact: true,
      sealed: false,
    });
    expect(passParts(filled, "done")).toMatchObject({ sealed: true });
  });

  it("treats a one-letter name as not yet printed", () => {
    expect(passParts({ ...EMPTY_PROFILE, fullName: "D" }, "place").name).toBe(false);
  });
});
