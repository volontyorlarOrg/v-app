import { describe, expect, it } from "vitest";

import {
  normalizePhone,
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
  it("trims text, splits lists and normalizes social profiles", () => {
    const input = profileInputFromFormData(
      form({
        fullName: "  Dilnoza Karimova ",
        bio: "Hi",
        languages: "uz, ru,,en",
        telegram: "@dilnoza_k",
        instagram: "@dilnoza.codes",
        linkedin: "linkedin.com/in/dilnoza-k",
        region: "samarkand",
        links:
          "https://a.example, https://b.example, https://c.example, https://d.example",
      }),
    );

    expect(input.fullName).toBe("Dilnoza Karimova");
    expect(input.languages).toEqual(["uz", "ru", "en"]);
    expect(input.telegram).toBe("dilnoza_k");
    expect(input.instagram).toBe("dilnoza.codes");
    expect(input.linkedin).toBe("https://www.linkedin.com/in/dilnoza-k");
    expect(input.region).toBe("samarkand");
    expect(input.links).toHaveLength(3);
  });

  it("sends a phone number the way the backend stores it, whatever the volunteer typed between the digits", () => {
    expect(profileInputFromFormData(form({ phone: " +998 90 123-45-67 " })).phone).toBe(
      "+998901234567",
    );
    expect(profileInputFromFormData(form({ phone: "(+998) 90.123.45.67" })).phone).toBe(
      "+998901234567",
    );
    expect(normalizePhone("00998901234567")).toBe("+998901234567");
    expect(normalizePhone("")).toBe("");
  });

  it("turns an unknown or empty region into null and missing fields into empty values", () => {
    const input = profileInputFromFormData(form({ fullName: "D", region: "atlantis" }));
    expect(input.region).toBeNull();
    expect(input.bio).toBe("");
    expect(input.languages).toEqual([]);
  });

  it("keeps selected language values distinct while supporting the previous comma-separated form shape", () => {
    const selected = new FormData();
    selected.append("languages", "uz");
    selected.append("languages", "en");
    selected.append("languages", "uz");
    const input = profileInputFromFormData(selected);

    expect(input.languages).toEqual(["uz", "en"]);
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
    languages: [],
    phone: "",
    telegram: "",
    instagram: "",
    linkedin: "",
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
    expect(
      profileFormSchema.safeParse({ ...valid, languages: Array(11).fill("en") })
        .success,
    ).toBe(false);
    expect(
      profileFormSchema.safeParse({ ...valid, instagram: "not a handle!" }).success,
    ).toBe(false);
    expect(
      profileFormSchema.safeParse({ ...valid, linkedin: "https://example.com/me" })
        .success,
    ).toBe(false);
  });

  it("accepts the phone and Telegram formats the backend accepts, and nothing else", () => {
    const accepts = (fields: Partial<typeof valid>) =>
      profileFormSchema.safeParse({ ...valid, ...fields }).success;

    expect(accepts({ phone: "+998 90 123 45 67" })).toBe(true);
    expect(accepts({ phone: "+998901234567" })).toBe(true);
    expect(accepts({ phone: "90 123 45 67" })).toBe(false);
    expect(accepts({ phone: "+0 123 456 789" })).toBe(false);
    expect(accepts({ phone: "call me" })).toBe(false);
    expect(accepts({ telegram: "@dilnoza_k" })).toBe(true);
    expect(accepts({ telegram: "abc" })).toBe(false);
    expect(accepts({ telegram: "dilnoza.k" })).toBe(false);
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
      instagram: "dilnoza.codes",
      linkedin: "https://www.linkedin.com/in/dilnoza-k",
      links: [],
    });
    expect(values.region).toBe("");
    expect(values.languages).toEqual(["uz", "ru"]);
    expect(values.telegram).toBe("dilnoza_k");
    expect(values.instagram).toBe("dilnoza.codes");
    expect(values.linkedin).toBe("https://www.linkedin.com/in/dilnoza-k");
  });
});
