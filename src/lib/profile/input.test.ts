import { describe, expect, it } from "vitest";

import {
  profileFormSchema,
  profileFormValues,
  profileInputFromFormData,
} from "@/lib/profile/input";

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
        telegram: "@dilnoza_k",
        region: "samarkand",
        links:
          "https://a.example, https://b.example, https://c.example, https://d.example",
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

describe("profileFormSchema", () => {
  const valid = {
    fullName: "Dilnoza Karimova",
    bio: "",
    school: "",
    gradeYear: "",
    region: "",
    city: "",
    languages: "",
    phone: "",
    telegram: "",
    links: "",
  };

  it("mirrors the form's own constraints: a name of at least two characters, bounded text", () => {
    expect(profileFormSchema.safeParse(valid).success).toBe(true);
    expect(profileFormSchema.safeParse({ ...valid, fullName: " " }).success).toBe(
      false,
    );
    expect(profileFormSchema.safeParse({ ...valid, fullName: "D" }).success).toBe(
      false,
    );
    expect(
      profileFormSchema.safeParse({ ...valid, bio: "x".repeat(601) }).success,
    ).toBe(false);
    expect(profileFormSchema.safeParse({ ...valid, region: "samarkand" }).success).toBe(
      true,
    );
    expect(profileFormSchema.safeParse({ ...valid, region: "atlantis" }).success).toBe(
      false,
    );
  });

  it("turns a stored profile into the form's default values", () => {
    const values = profileFormValues({
      fullName: "Dilnoza",
      bio: "",
      school: "",
      gradeYear: "",
      region: null,
      city: "",
      languages: ["uz", "ru"],
      phone: "",
      telegram: "dilnoza_k",
      links: [],
    });
    expect(values.region).toBe("");
    expect(values.languages).toBe("uz, ru");
    expect(values.telegram).toBe("dilnoza_k");
  });
});
