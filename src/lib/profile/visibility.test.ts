import { describe, expect, it } from "vitest";

import {
  ALWAYS_SHOWN_PROFILE_PARTS,
  OPTIONAL_PROFILE_PARTS,
  VISIBILITY_MARKER,
  hiddenPartsFromFormData,
  hiddenProfileParts,
  visibilityFieldName,
  withoutHiddenParts,
} from "@/lib/profile/visibility";

const profile = {
  fullName: "Dilnoza Karimova",
  bio: "Hi",
  region: "samarkand" as string | null,
  city: "Samarkand",
  school: "School 12",
  gradeYear: "10",
  languages: ["uz", "en"],
  phone: "+998901234567",
  telegram: "dilnoza_k",
  instagram: "dilnoza.codes",
  linkedin: "https://www.linkedin.com/in/dilnoza-k",
  links: ["https://a.example"],
};

describe("profile visibility", () => {
  it("keeps the header parts out of what a volunteer can hide", () => {
    for (const part of ALWAYS_SHOWN_PROFILE_PARTS) {
      expect(OPTIONAL_PROFILE_PARTS as readonly string[]).not.toContain(part);
    }
    expect(hiddenProfileParts(["bio", "name", "phone"])).toEqual(new Set(["phone"]));
  });

  it("reads a form with every switch on as nothing hidden", () => {
    const data = new FormData();
    data.set(VISIBILITY_MARKER, "1");
    for (const part of OPTIONAL_PROFILE_PARTS) data.set(visibilityFieldName(part), "1");

    expect(hiddenPartsFromFormData(data)).toEqual([]);
  });

  it("hides exactly the parts whose switch is off", () => {
    const data = new FormData();
    data.set(VISIBILITY_MARKER, "1");
    for (const part of OPTIONAL_PROFILE_PARTS) {
      if (part !== "phone" && part !== "activity") {
        data.set(visibilityFieldName(part), "1");
      }
    }

    expect(hiddenPartsFromFormData(data)).toEqual(["phone", "activity"]);
  });

  it("leaves the stored choice alone when a form carries no switches", () => {
    const data = new FormData();
    data.set("fullName", "Dilnoza");

    expect(hiddenPartsFromFormData(data)).toBeUndefined();
  });

  it("blanks hidden parts and never the name or the bio", () => {
    const shown = withoutHiddenParts(profile, new Set(["phone", "region", "links"]));

    expect(shown).toMatchObject({
      fullName: "Dilnoza Karimova",
      bio: "Hi",
      phone: "",
      region: null,
      links: [],
      city: "Samarkand",
      telegram: "dilnoza_k",
    });
  });
});
