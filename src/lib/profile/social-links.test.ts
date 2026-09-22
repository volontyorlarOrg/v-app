import { describe, expect, it } from "vitest";

import { linkedinProfileUrl, profileSocialLinks } from "@/lib/profile/social-links";

describe("profile social links", () => {
  it("normalizes a LinkedIn handle and profile URL", () => {
    expect(linkedinProfileUrl("@dilnoza-k")).toBe(
      "https://www.linkedin.com/in/dilnoza-k",
    );
    expect(linkedinProfileUrl("linkedin.com/in/dilnoza-k/")).toBe(
      "https://www.linkedin.com/in/dilnoza-k",
    );
  });

  it("rejects non-profile and non-LinkedIn URLs", () => {
    expect(linkedinProfileUrl("https://linkedin.com/company/volontyorlar")).toBeNull();
    expect(linkedinProfileUrl("https://example.com/in/dilnoza-k")).toBeNull();
  });

  it("builds safe public links only for populated platforms", () => {
    expect(
      profileSocialLinks({
        telegram: "@dilnoza_k",
        instagram: "dilnoza.codes",
        linkedin: "https://www.linkedin.com/in/dilnoza-k",
      }),
    ).toEqual([
      {
        platform: "telegram",
        handle: "dilnoza_k",
        href: "https://t.me/dilnoza_k",
      },
      {
        platform: "instagram",
        handle: "dilnoza.codes",
        href: "https://www.instagram.com/dilnoza.codes/",
      },
      {
        platform: "linkedin",
        handle: "dilnoza-k",
        href: "https://www.linkedin.com/in/dilnoza-k",
      },
    ]);
  });
});
