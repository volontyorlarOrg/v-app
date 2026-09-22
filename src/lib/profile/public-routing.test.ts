import { describe, expect, it } from "vitest";

import {
  internalMemberProfileHref,
  internalProfileUsername,
  memberProfileHref,
  preferredProfileLocale,
  publicProfileUsername,
} from "@/lib/profile/public-routing";

describe("member profile routing", () => {
  it("accepts a root username and protects product routes", () => {
    expect(publicProfileUsername("/Dilnoza_K/")).toBe("dilnoza_k");
    expect(publicProfileUsername("/profiles")).toBeNull();
    expect(publicProfileUsername("/_vercel")).toBeNull();
    expect(publicProfileUsername("/leaderboard")).toBeNull();
    expect(publicProfileUsername("/short")).toBe("short");
    expect(publicProfileUsername("/no/slash")).toBeNull();
  });

  it("maps the public app URL to its locale-backed route", () => {
    expect(memberProfileHref("Dilnoza_K")).toBe("/dilnoza_k");
    expect(internalMemberProfileHref("en", "Dilnoza_K")).toBe("/en/profiles/dilnoza_k");
    expect(internalProfileUsername("/en/profiles/dilnoza_k")).toBe("dilnoza_k");
  });

  it("chooses the saved locale before the browser preference", () => {
    expect(preferredProfileLocale("ru", "en-US,en;q=0.9")).toBe("ru");
    expect(preferredProfileLocale(undefined, "en-US,en;q=0.9")).toBe("en");
    expect(preferredProfileLocale(undefined, "de-DE,de;q=0.9")).toBe("uz");
  });
});
