import { describe, expect, it } from "vitest";

import {
  normalizePhone,
  placeInputFromFormData,
  profileFormSchema,
  profileFormValues,
  profileInputFromFormData,
  requiredPlaceFormSchema,
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
        hometownRegion: "bukhara",
        districtId: "1718401",
        educationType: "school",
        institutionId: "school-1718401-14",
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
    expect(input).not.toHaveProperty("hometownRegion");
    expect(input).not.toHaveProperty("city");
    expect(input).not.toHaveProperty("school");
    expect(input.districtId).toBe("1718401");
    expect(input.educationType).toBe("school");
    expect(input.institutionId).toBe("school-1718401-14");
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
    expect(input.districtId).toBeNull();
    expect(input.educationType).toBeNull();
    expect(input.institutionId).toBeNull();
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
    gradeYear: "",
    region: "",
    districtId: "",
    educationType: "",
    institutionId: "",
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

  it("accepts only a SOATO district code and a known education type", () => {
    const accepts = (fields: Partial<typeof valid>) =>
      profileFormSchema.safeParse({ ...valid, ...fields }).success;

    expect(accepts({ districtId: "1726294" })).toBe(true);
    expect(accepts({ districtId: "Chilonzor" })).toBe(false);
    expect(accepts({ educationType: "gap_year" })).toBe(true);
    expect(accepts({ educationType: "college" })).toBe(false);
  });

  it("requires region, district, education, institution and grade where the place is required", () => {
    const issues = (fields: Partial<typeof valid>) => {
      const result = requiredPlaceFormSchema.safeParse({ ...valid, ...fields });
      return result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
    };

    expect(issues({})).toEqual(["region", "districtId", "educationType"]);
    expect(
      issues({ region: "samarkand", districtId: "1718401", educationType: "school" }),
    ).toEqual(["institutionId", "gradeYear"]);
    expect(
      issues({ region: "samarkand", districtId: "1718401", educationType: "gap_year" }),
    ).toEqual([]);
  });

  it("drops the institution and the grade from a gap year", () => {
    expect(
      placeInputFromFormData(
        form({
          districtId: "1718401",
          educationType: "gap_year",
          institutionId: "school-1718401-14",
          gradeYear: "11",
        }),
      ),
    ).toEqual({
      districtId: "1718401",
      educationType: "gap_year",
      institutionId: null,
      gradeYear: "",
    });
  });

  it("turns a stored profile into the form's default values", () => {
    const values = profileFormValues({
      fullName: "Dilnoza",
      bio: "",
      gradeYear: "",
      region: null,
      districtId: null,
      educationType: "university",
      institutionId: "university-q651133",
      languages: ["uz", "ru"],
      phone: "",
      telegram: "dilnoza_k",
      instagram: "dilnoza.codes",
      linkedin: "https://www.linkedin.com/in/dilnoza-k",
      links: [],
    });
    expect(values.region).toBe("");
    expect(values.districtId).toBe("");
    expect(values.educationType).toBe("university");
    expect(values.institutionId).toBe("university-q651133");
    expect(values.languages).toEqual(["uz", "ru"]);
    expect(values.telegram).toBe("dilnoza_k");
    expect(values.instagram).toBe("dilnoza.codes");
    expect(values.linkedin).toBe("https://www.linkedin.com/in/dilnoza-k");
  });
  it("never carries a visibility choice, which Settings saves on its own", () => {
    const data = new FormData();
    data.set("fullName", "Volunteer");
    data.set("visibility", "1");
    data.set("show-bio", "on");
    data.set("confirmContactPublication", "on");

    const input = profileInputFromFormData(data);

    expect(input).not.toHaveProperty("hiddenFields");
    expect(input).not.toHaveProperty("confirmContactPublication");
  });
});
