import { describe, expect, it } from "vitest";

import {
  ALWAYS_SHOWN_PROFILE_PARTS,
  DEFAULT_HIDDEN_PROFILE_PARTS,
  contactPublicationRequired,
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
  hometownRegion: "bukhara" as string | null,
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
    expect(hiddenProfileParts(["bio", "name", "phone"])).toEqual(
      new Set(["bio", "phone"]),
    );
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

  it("blanks hidden parts without hiding the name", () => {
    const shown = withoutHiddenParts(
      profile,
      new Set(["bio", "phone", "region", "links"]),
    );

    expect(shown).toMatchObject({
      fullName: "Dilnoza Karimova",
      bio: "",
      phone: "",
      region: null,
      links: [],
      city: "Samarkand",
      telegram: "dilnoza_k",
    });
  });

  it("hides the hometown and the current region independently", () => {
    expect(withoutHiddenParts(profile, new Set(["hometownRegion"]))).toMatchObject({
      region: "samarkand",
      hometownRegion: null,
    });
    expect(withoutHiddenParts(profile, new Set(["region"]))).toMatchObject({
      region: null,
      hometownRegion: "bukhara",
    });
  });
  it("shows useful details by default and keeps phone private", () => {
    const shown = withoutHiddenParts(profile, new Set(DEFAULT_HIDDEN_PROFILE_PARTS));
    expect(shown).toMatchObject({
      bio: "Hi",
      region: "samarkand",
      city: "Samarkand",
      school: "School 12",
      phone: "",
      telegram: "dilnoza_k",
      instagram: "dilnoza.codes",
      linkedin: profile.linkedin,
      links: profile.links,
    });
  });

  it("requires confirmation only when previously hidden contacts become public", () => {
    expect(contactPublicationRequired(["phone", "telegram"], ["phone"])).toBe(true);
    expect(contactPublicationRequired(["phone", "links"], ["phone"])).toBe(true);
    expect(contactPublicationRequired(["phone", "bio"], ["phone"])).toBe(false);
    expect(contactPublicationRequired(["phone"], ["phone", "telegram"])).toBe(false);
    expect(contactPublicationRequired([], [])).toBe(false);
  });
});
