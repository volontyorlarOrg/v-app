import { describe, expect, it } from "vitest";

import { initialsOf } from "@/lib/profile/initials";

describe("initialsOf", () => {
  it("takes the first letter of the first two words", () => {
    expect(initialsOf("Dilnoza Karimova")).toBe("DK");
    expect(initialsOf("  Malika   Karimova  Yusupova")).toBe("MK");
  });

  it("reads a handle's underscores as word breaks", () => {
    expect(initialsOf("dilnoza_k")).toBe("DK");
    expect(initialsOf("chilonzor.reader")).toBe("CR");
  });

  it("falls back to two letters of a single word and skips digits", () => {
    expect(initialsOf("volunteer_01")).toBe("VO");
    expect(initialsOf("Bekzod")).toBe("BE");
  });

  it("is empty for an empty name", () => {
    expect(initialsOf("   ")).toBe("");
  });
});
