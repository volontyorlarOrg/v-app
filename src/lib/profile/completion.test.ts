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

  it("counts either contact channel, not both", () => {
    expect(
      profileCompletion(profile({ phone: "+998901234567" })).missing,
    ).not.toContain("contact");
    expect(profileCompletion(profile({ telegram: "aziza_v" })).missing).not.toContain(
      "contact",
    );
  });

  it("ignores a one-letter name", () => {
    expect(profileCompletion(profile({ fullName: "A" })).missing).toContain("fullName");
  });

  it("reaches 100% once every counted field is filled", () => {
    const completion = profileCompletion(
      profile({
        fullName: "Aziza Karimova",
        bio: "Second-year student, interested in literacy work.",
        region: "samarkand",
        school: "School 14",
        languages: ["uz", "en"],
        telegram: "aziza_v",
      }),
    );
    expect(completion.percent).toBe(100);
    expect(completion.complete).toBe(true);
    expect(completion.missing).toEqual([]);
  });
});
