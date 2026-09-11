import { describe, expect, it } from "vitest";

import {
  COMPLETION_FIELDS,
  profileCompletion,
  type ProfileFields,
} from "@/lib/profile/completion";

const EMPTY: ProfileFields = {
  fullName: "",
  bio: "",
  region: null,
  school: "",
  languages: [],
  phone: "",
  telegram: "",
};

function profile(overrides: Partial<ProfileFields> = {}): ProfileFields {
  return { ...EMPTY, ...overrides };
}

describe("profileCompletion", () => {
  it("is 0% and lists everything for an empty profile", () => {
    const completion = profileCompletion(EMPTY);
    expect(completion.percent).toBe(0);
    expect(completion.complete).toBe(false);
    expect(completion.missing).toEqual([...COMPLETION_FIELDS]);
  });

  it("ignores a one-letter name", () => {
    expect(profileCompletion(profile({ fullName: "A" })).missing).toContain("fullName");
  });

  it("requires either a phone number or a Telegram username", () => {
    const completion = profileCompletion(
      profile({
        fullName: "Aziza Karimova",
        bio: "Second-year student, interested in literacy work.",
        region: "samarkand",
        school: "School 14",
        languages: ["uz", "en"],
      }),
    );
    expect(completion.complete).toBe(false);
    expect(completion.missing).toEqual(["contact"]);
  });

  it("reaches 100% with one usable contact method", () => {
    const completion = profileCompletion(
      profile({
        fullName: "Aziza Karimova",
        bio: "Second-year student, interested in literacy work.",
        region: "samarkand",
        school: "School 14",
        languages: ["uz", "en"],
        telegram: "aziza_k",
      }),
    );
    expect(completion.percent).toBe(100);
    expect(completion.complete).toBe(true);
    expect(completion.missing).toEqual([]);
  });
});
