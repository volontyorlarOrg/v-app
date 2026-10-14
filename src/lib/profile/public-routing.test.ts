import { describe, expect, it } from "vitest";

import {
  internalMemberProfileHref,
  internalProfileUsername,
  memberProfileHref,
  publicProfileUsername,
} from "@/lib/profile/public-routing";
import { appRoutes } from "@/lib/routing/routes";

describe("member profile routing", () => {
  it("accepts a root username and protects product routes", () => {
    expect(publicProfileUsername("/Dilnoza_K/")).toBe("dilnoza_k");
    expect(publicProfileUsername("/profiles")).toBeNull();
    expect(publicProfileUsername("/_vercel")).toBeNull();
    expect(publicProfileUsername("/leaderboard")).toBeNull();
    expect(publicProfileUsername("/short")).toBe("short");
    expect(publicProfileUsername("/no/slash")).toBeNull();
  });

  it("never reads a language or a short word as a username", () => {
    for (const path of ["/uz", "/ru", "/en", "/api", "/four", `/${"a".repeat(33)}`]) {
      expect(publicProfileUsername(path), path).toBeNull();
    }
    expect(publicProfileUsername("/apiuser1")).toBe("apiuser1");
    expect(publicProfileUsername("/_next_user")).toBe("_next_user");
  });

  it("never lets a username shadow a top-level page of the app", () => {
    for (const route of appRoutes) {
      const segment = route.path.split("/")[1] ?? "";
      expect(publicProfileUsername(`/${segment}`), route.path).toBeNull();
    }
  });

  it("maps the public app URL to its locale-backed route", () => {
    expect(memberProfileHref("Dilnoza_K")).toBe("/dilnoza_k");
    expect(internalMemberProfileHref("Dilnoza_K")).toBe("/profiles/dilnoza_k");
    expect(internalProfileUsername("/profiles/dilnoza_k")).toBe("dilnoza_k");
    expect(internalProfileUsername("/profiles/four")).toBeNull();
  });
});
