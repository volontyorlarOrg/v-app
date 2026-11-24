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
  districtId: null,
  educationType: null,
  institutionId: null,
  gradeYear: "",
  languages: [],
  phone: "",
  telegram: "",
};

const FULL: ProfileFields = {
  fullName: "Aziza Karimova",
  bio: "Second-year student, interested in literacy work.",
  region: "samarkand",
  districtId: "1718401",
  educationType: "school",
  institutionId: "school-1718401-14",
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
      "district",
      "education",
      "gradeYear",
      "languages",
      "telegram",
    ]);
  });

  it("ignores a one-letter name and blank text", () => {
    const completion = profileCompletion({ ...FULL, fullName: "A", bio: "  " });
    expect(completion.missing).toEqual(["fullName", "bio"]);
  });

  it("asks a volunteer with only the old free text to choose district and education", () => {
    expect(
      profileCompletion({
        ...FULL,
        districtId: null,
        educationType: null,
        institutionId: null,
      }).missing,
    ).toEqual(["district", "education"]);
  });

  it("needs an institution for a school or university but nothing on a gap year", () => {
    expect(
      profileCompletion({ ...FULL, educationType: "university", institutionId: null })
        .missing,
    ).toEqual(["education"]);
    expect(
      profileCompletion({
        ...FULL,
        educationType: "gap_year",
        institutionId: null,
        gradeYear: "",
      }).missing,
    ).toEqual([]);
  });

  it("allows a missing phone number but requires a Telegram username", () => {
    expect(profileCompletion({ ...FULL, phone: "" }).missing).toEqual([]);
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
    expect(profileCompletion(profile({ fullName: "Aziza Karimova" })).percent).toBe(13);
  });

  it("recognises the names of required fields", () => {
    expect(isCompletionField("telegram")).toBe(true);
    expect(isCompletionField("username")).toBe(false);
    expect(isCompletionField("contact")).toBe(false);
  });
});
