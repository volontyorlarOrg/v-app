import { describe, expect, it } from "vitest";

import {
  APPLICATION_PROFILE_FIELDS,
  applicationReadiness,
  type ApplicantProfile,
} from "@/lib/applications/readiness";

const complete: ApplicantProfile = {
  fullName: "Dilnoza Karimova",
  bio: "I read to younger pupils every Saturday.",
  region: "tashkent-city",
  school: "School 143",
  languages: ["uz", "ru"],
  phone: "",
  telegram: "dilnoza",
};

describe("applicationReadiness", () => {
  it("lets a complete profile apply", () => {
    expect(applicationReadiness(complete)).toEqual({ ready: true, missing: [] });
  });

  it("asks for everything when there is no profile yet", () => {
    expect(applicationReadiness(null).missing).toEqual([
      ...APPLICATION_PROFILE_FIELDS,
    ]);
  });

  it("names each field the organiser needs, not a single failure", () => {
    const { missing } = applicationReadiness({
      ...complete,
      bio: "  ",
      languages: [],
    });
    expect(missing).toEqual(["bio", "languages"]);
  });

  it("accepts a phone number in place of a Telegram username", () => {
    expect(
      applicationReadiness({ ...complete, telegram: "", phone: "+998901234567" }).ready,
    ).toBe(true);
  });

  it("refuses a profile the organiser could not contact", () => {
    expect(
      applicationReadiness({ ...complete, telegram: "", phone: "" }).missing,
    ).toEqual(["contact"]);
  });

  it("refuses a one-letter name, as the API does", () => {
    expect(applicationReadiness({ ...complete, fullName: "D" }).missing).toEqual([
      "fullName",
    ]);
  });
});
