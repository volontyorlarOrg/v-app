import { beforeEach, describe, expect, it } from "vitest";

import {
  INITIAL_ONBOARDING_STATE,
  ONBOARDING_COOKIE_NAME,
  ONBOARDING_STORAGE_KEY,
  furthestOnboardingState,
  isOnboardingOpen,
  onboardingCookieAttributes,
  onboardingPath,
  parseOnboardingState,
  readOnboardingStateFromClient,
  readOnboardingStateFromDocument,
  readOnboardingStateFromStorage,
  resumeStep,
  serializeOnboardingState,
  writeOnboardingStateToClient,
  writeOnboardingStateToDocument,
  writeOnboardingStateToStorage,
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

describe("onboarding state on the client", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${ONBOARDING_COOKIE_NAME}=; path=/; max-age=0`;
  });

  it("round-trips every state through localStorage", () => {
    for (const state of [
      INITIAL_ONBOARDING_STATE,
      { status: "skipped" as const, step: "place" as const },
      { status: "done" as const },
    ]) {
      writeOnboardingStateToStorage(state);
      expect(readOnboardingStateFromStorage()).toEqual(state);
    }
  });

  it("ignores a stored value it did not write", () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "paused:about");
    expect(readOnboardingStateFromStorage()).toBeNull();
  });

  it("keeps whichever record got the furthest", () => {
    const pending = { status: "pending" as const, step: "about" as const };
    const later = { status: "pending" as const, step: "contact" as const };

    expect(furthestOnboardingState(null, null)).toBeNull();
    expect(furthestOnboardingState(pending, null)).toEqual(pending);
    expect(furthestOnboardingState(null, pending)).toEqual(pending);
    expect(furthestOnboardingState(pending, later)).toEqual(later);
    expect(furthestOnboardingState(later, pending)).toEqual(later);
    expect(furthestOnboardingState({ status: "done" }, pending)).toEqual({
      status: "done",
    });
    expect(furthestOnboardingState(pending, { status: "done" })).toEqual({
      status: "done",
    });
  });

  it("writes both stores at once, so the server and the browser agree", () => {
    writeOnboardingStateToClient({ status: "pending", step: "place" });
    expect(document.cookie).toContain(`${ONBOARDING_COOKIE_NAME}=pending:place`);
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe("pending:place");
  });

  it("copies a cookie-only state into localStorage", () => {
    writeOnboardingStateToDocument({ status: "pending", step: "contact" });

    expect(readOnboardingStateFromClient()).toEqual({
      status: "pending",
      step: "contact",
    });
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe("pending:contact");
  });

  it("puts the cookie back from localStorage once the cookie is gone", () => {
    writeOnboardingStateToStorage({ status: "pending", step: "place" });

    expect(readOnboardingStateFromClient()).toEqual({
      status: "pending",
      step: "place",
    });
    expect(document.cookie).toContain(`${ONBOARDING_COOKIE_NAME}=pending:place`);
  });

  it("does not reopen onboarding for someone localStorage says has finished", () => {
    writeOnboardingStateToStorage({ status: "done" });
    writeOnboardingStateToDocument({ status: "pending", step: "about" });

    expect(readOnboardingStateFromClient()).toEqual({ status: "done" });
    expect(isOnboardingOpen(readOnboardingStateFromClient())).toBe(false);
    expect(document.cookie).toContain(`${ONBOARDING_COOKIE_NAME}=done`);
  });

  it("reports nothing at all when neither store has a record", () => {
    expect(readOnboardingStateFromClient()).toBeNull();
  });
});
