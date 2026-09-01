import { describe, expect, it } from "vitest";
import {
  EMPTY_PROFILE,
  profileCompletion,
  profileSchema,
  type ProfileInput,
} from "./schemas";

/**
 * Profile validation and the completion model.
 *
 * The completion percentage is only permitted because its model is explicit;
 * these tests are what keep it explicit rather than drifting into a number
 * nobody can account for.
 */

function profile(overrides: Partial<ProfileInput> = {}): ProfileInput {
  return { ...EMPTY_PROFILE, ...overrides };
}

describe("profileSchema", () => {
  it("emits keys rather than English sentences for errors", () => {
    // A hard-coded English message could not be shown to a Russian or Uzbek
    // speaker; the field component translates these keys instead.
    const result = profileSchema.safeParse(profile({ fullName: "A" }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("tooShort");
  });

  it("accepts an E.164 phone number and rejects a local one", () => {
    expect(
      profileSchema.safeParse(profile({ fullName: "Aziza", phone: "+998901234567" }))
        .success,
    ).toBe(true);

    expect(
      profileSchema.safeParse(profile({ fullName: "Aziza", phone: "901234567" }))
        .success,
    ).toBe(false);
  });

  it("treats an empty phone as valid, because it is optional", () => {
    expect(
      profileSchema.safeParse(profile({ fullName: "Aziza", phone: "" })).success,
    ).toBe(true);
  });

  it("rejects a Telegram username written with the @ sigil", () => {
    expect(
      profileSchema.safeParse(profile({ fullName: "Aziza", telegram: "@aziza" }))
        .success,
    ).toBe(false);

    expect(
      profileSchema.safeParse(profile({ fullName: "Aziza", telegram: "aziza_v" }))
        .success,
    ).toBe(true);
  });

  it("rejects a link that is not a full URL", () => {
    expect(
      profileSchema.safeParse(
        profile({ fullName: "Aziza", links: ["example.com"] }),
      ).success,
    ).toBe(false);
  });
});

describe("profileCompletion", () => {
  it("is 0% and lists everything for an empty profile", () => {
    const completion = profileCompletion(EMPTY_PROFILE);

    expect(completion.percent).toBe(0);
    expect(completion.complete).toBe(false);
    expect(completion.missing).toHaveLength(6);
  });

  it("counts either contact channel, not both", () => {
    // Requiring both would force a volunteer without Telegram to hand over a
    // phone number they had no reason to give.
    const withPhone = profileCompletion(profile({ phone: "+998901234567" }));
    const withTelegram = profileCompletion(profile({ telegram: "aziza_v" }));

    expect(withPhone.missing).not.toContain("contact");
    expect(withTelegram.missing).not.toContain("contact");
  });

  it("reaches 100% once every counted field is filled", () => {
    const completion = profileCompletion(
      profile({
        fullName: "Aziza Karimova",
        bio: "Second-year student, interested in literacy work.",
        region: "tashkent-city",
        school: "Tashkent State University",
        languages: ["Uzbek", "English"],
        telegram: "aziza_v",
      }),
    );

    expect(completion.percent).toBe(100);
    expect(completion.complete).toBe(true);
    expect(completion.missing).toEqual([]);
  });

  it("does not count a whitespace-only value as filled", () => {
    expect(profileCompletion(profile({ bio: "   " })).missing).toContain("bio");
  });

  it("does not count a portfolio link toward completion", () => {
    // "Complete" means an organiser can evaluate and contact you. A link is
    // welcome but is not part of that bar.
    const withLink = profileCompletion(profile({ links: ["https://example.com"] }));
    expect(withLink.percent).toBe(0);
  });
});
