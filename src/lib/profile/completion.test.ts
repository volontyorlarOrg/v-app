import { describe, expect, it } from "vitest";

import {
  COMPLETION_FIELDS,
  isCompletionField,
  profileCompletion,
  type ProfileFields,
} from "@/lib/profile/completion";

const EMPTY: ProfileFields = {
  fullName: "",
  bio: "",
  region: null,
  city: "",
  school: "",
  gradeYear: "",
  languages: [],
  phone: "",
  telegram: "",
};

const FULL: ProfileFields = {
  fullName: "Aziza Karimova",
  bio: "Second-year student, interested in literacy work.",
  region: "samarkand",
  city: "Samarkand",
  school: "School 14",
  gradeYear: "11",
  languages: ["uz", "en"],
  phone: "+998 90 123 45 67",
  telegram: "aziza_k",
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

  it("asks for the same fields the backend requires before applying", () => {
    expect(COMPLETION_FIELDS).toEqual([
      "fullName",
      "bio",
      "region",
      "city",
      "school",
      "gradeYear",
      "languages",
      "phone",
      "telegram",
    ]);
  });

  it("ignores a one-letter name and blank text", () => {
    const completion = profileCompletion({ ...FULL, fullName: "A", city: "  " });
    expect(completion.missing).toEqual(["fullName", "city"]);
  });

  it("requires both a phone number and a Telegram username", () => {
    expect(profileCompletion({ ...FULL, phone: "" }).missing).toEqual(["phone"]);
    expect(profileCompletion({ ...FULL, telegram: "" }).missing).toEqual(["telegram"]);
  });

  it("requires the grade as well as the school", () => {
    expect(profileCompletion({ ...FULL, gradeYear: "" }).missing).toEqual([
      "gradeYear",
    ]);
  });

  it("reaches 100% with every required field and nothing optional", () => {
    const completion = profileCompletion(FULL);
    expect(completion.percent).toBe(100);
    expect(completion.complete).toBe(true);
    expect(completion.missing).toEqual([]);
  });

  it("rounds the share of filled fields", () => {
    expect(profileCompletion(profile({ fullName: "Aziza Karimova" })).percent).toBe(11);
  });

  it("recognises the names of required fields", () => {
    expect(isCompletionField("telegram")).toBe(true);
    expect(isCompletionField("username")).toBe(false);
    expect(isCompletionField("contact")).toBe(false);
  });
});
