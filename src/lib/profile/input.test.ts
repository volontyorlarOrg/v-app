import { describe, expect, it } from "vitest";

import { profileInputFromFormData } from "@/lib/profile/input";

function form(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe("profileInputFromFormData", () => {
  it("trims text, splits lists and strips the Telegram at-sign", () => {
    const input = profileInputFromFormData(
      form({
        fullName: "  Dilnoza Karimova ",
        bio: "Hi",
        languages: "uz, ru,,en",
        skills: "translation",
        telegram: "@dilnoza_k",
        region: "samarkand",
        links: "https://a.example, https://b.example, https://c.example, https://d.example",
      }),
    );

    expect(input.fullName).toBe("Dilnoza Karimova");
    expect(input.languages).toEqual(["uz", "ru", "en"]);
    expect(input.telegram).toBe("dilnoza_k");
    expect(input.region).toBe("samarkand");
    expect(input.links).toHaveLength(3);
  });

  it("turns an unknown or empty region into null and missing fields into empty values", () => {
    const input = profileInputFromFormData(form({ fullName: "D", region: "atlantis" }));
    expect(input.region).toBeNull();
    expect(input.bio).toBe("");
    expect(input.languages).toEqual([]);
  });
});
