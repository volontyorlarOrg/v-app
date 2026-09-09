import { describe, expect, it } from "vitest";

import { profileLink, profileLinks } from "@/lib/profile/links";

describe("profileLink", () => {
  it("keeps the destination and shows the host without the scheme or www", () => {
    expect(profileLink("https://www.example.uz/cv")).toEqual({
      href: "https://www.example.uz/cv",
      label: "example.uz/cv",
    });
  });

  it("assumes https for a bare host, because the backend accepts one", () => {
    expect(profileLink("example.uz")?.href).toBe("https://example.uz/");
    expect(profileLink("example.uz")?.label).toBe("example.uz");
  });

  it("refuses anything that is not an http destination", () => {
    expect(profileLink("javascript:alert(1)")).toBeNull();
    expect(profileLink("mailto:a@example.uz")).toBeNull();
    expect(profileLink("   ")).toBeNull();
  });

  it("drops what it cannot render rather than guessing", () => {
    expect(profileLinks(["https://a.example", "javascript:void(0)"])).toHaveLength(1);
  });
});
