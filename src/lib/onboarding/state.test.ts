import { describe, expect, it } from "vitest";

import {
  INITIAL_ONBOARDING_STATE,
  ONBOARDING_COOKIE_NAME,
  isOnboardingOpen,
  onboardingCookieAttributes,
  onboardingPath,
  parseOnboardingState,
  readOnboardingStateFromDocument,
  resumeStep,
  serializeOnboardingState,
  writeOnboardingStateToDocument,
} from "@/lib/onboarding/state";

describe("onboarding state cookie", () => {
  it("round-trips every state through its cookie value", () => {
    for (const state of [
      INITIAL_ONBOARDING_STATE,
      { status: "pending" as const, step: "place" as const },
      { status: "skipped" as const, step: "contact" as const },
      { status: "done" as const },
    ]) {
      expect(parseOnboardingState(serializeOnboardingState(state))).toEqual(state);
    }
  });

  it("refuses a value it did not write", () => {
    expect(parseOnboardingState(undefined)).toBeNull();
    expect(parseOnboardingState("")).toBeNull();
    expect(parseOnboardingState("pending")).toBeNull();
    expect(parseOnboardingState("pending:finish")).toBeNull();
    expect(parseOnboardingState("paused:about")).toBeNull();
  });

  it("resumes where the volunteer left, and replays from the welcome otherwise", () => {
    expect(resumeStep(null)).toBe("welcome");
    expect(resumeStep({ status: "done" })).toBe("welcome");
    expect(resumeStep({ status: "pending", step: "done" })).toBe("welcome");
    expect(resumeStep({ status: "pending", step: "contact" })).toBe("contact");
    expect(resumeStep({ status: "skipped", step: "place" })).toBe("place");
  });

  it("stays open until it is done", () => {
    expect(isOnboardingOpen(null)).toBe(false);
    expect(isOnboardingOpen({ status: "done" })).toBe(false);
    expect(isOnboardingOpen({ status: "pending", step: "about" })).toBe(true);
    expect(isOnboardingOpen({ status: "skipped", step: "about" })).toBe(true);
  });

  it("builds the welcome path with the locale and an optional return path", () => {
    expect(onboardingPath("uz")).toBe("/uz/welcome");
    expect(onboardingPath("en", "/en/opportunities/book-drive")).toBe(
      "/en/welcome?next=%2Fen%2Fopportunities%2Fbook-drive",
    );
  });

  it("keeps the cookie readable by the browser and scoped to this app", () => {
    const attributes = onboardingCookieAttributes(true);
    expect(attributes.httpOnly).toBe(false);
    expect(attributes.secure).toBe(true);
    expect(attributes.sameSite).toBe("lax");
    expect(attributes.path).toBe("/");
    expect(attributes).not.toHaveProperty("domain");
  });

  it("reads back what it wrote to the document", () => {
    writeOnboardingStateToDocument({ status: "skipped", step: "contact" });
    expect(document.cookie).toContain(`${ONBOARDING_COOKIE_NAME}=skipped:contact`);
    expect(readOnboardingStateFromDocument()).toEqual({
      status: "skipped",
      step: "contact",
    });
    writeOnboardingStateToDocument({ status: "done" });
    expect(readOnboardingStateFromDocument()).toEqual({ status: "done" });
  });
});
