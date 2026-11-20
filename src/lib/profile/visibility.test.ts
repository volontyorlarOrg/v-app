import { describe, expect, it } from "vitest";

import {
  ALWAYS_SHOWN_PROFILE_PARTS,
  CONTACT_PROFILE_PARTS,
  DEFAULT_HIDDEN_PROFILE_PARTS,
  OPTIONAL_PROFILE_PARTS,
  REQUIRED_PROFILE_PARTS,
  contactPublicationRequired,
  hiddenProfileParts,
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

const everyOldPart = [
  "bio",
  "region",
  "hometownRegion",
  "city",
  "school",
  "gradeYear",
  "languages",
  "phone",
  "telegram",
  "instagram",
  "linkedin",
  "links",
  "joined",
  "activity",
];

describe("profile visibility", () => {
  it("keeps the header and the required parts out of what a volunteer can hide", () => {
    for (const part of ALWAYS_SHOWN_PROFILE_PARTS) {
      expect(OPTIONAL_PROFILE_PARTS as readonly string[]).not.toContain(part);
    }
    expect(hiddenProfileParts(["bio", "name", "phone"])).toEqual(new Set(["phone"]));
  });

  it("always shows the biography, location, study place, languages, portfolio links and joined date", () => {
    expect(REQUIRED_PROFILE_PARTS).toEqual([
      "bio",
      "region",
      "city",
      "school",
      "languages",
      "links",
      "joined",
    ]);
    expect(OPTIONAL_PROFILE_PARTS).toEqual([
      "hometownRegion",
      "gradeYear",
      "phone",
      "telegram",
      "instagram",
      "linkedin",
      "activity",
    ]);
    for (const part of REQUIRED_PROFILE_PARTS) {
      expect(ALWAYS_SHOWN_PROFILE_PARTS as readonly string[]).toContain(part);
    }
  });

  it("ignores a stored choice to hide a required part", () => {
    expect(
      hiddenProfileParts(["region", "languages", "joined", "city", "gradeYear"]),
    ).toEqual(new Set(["gradeYear"]));
  });

  it("treats a profile that hid every old part as hiding only the optional ones", () => {
    const hidden = hiddenProfileParts(everyOldPart);

    expect(hidden.size).toBe(OPTIONAL_PROFILE_PARTS.length);

    expect(withoutHiddenParts(profile, hidden)).toMatchObject({
      fullName: "Dilnoza Karimova",
      bio: "Hi",
      region: "samarkand",
      city: "Samarkand",
      school: "School 12",
      languages: ["uz", "en"],
      links: ["https://a.example"],
      hometownRegion: null,
      gradeYear: "",
      phone: "",
      telegram: "",
      instagram: "",
      linkedin: "",
    });
  });

  it("keeps contact details optional", () => {
    for (const part of CONTACT_PROFILE_PARTS) {
      expect(OPTIONAL_PROFILE_PARTS as readonly string[]).toContain(part);
    }
  });

  it("blanks hidden parts without hiding the name", () => {
    const shown = withoutHiddenParts(profile, new Set(["phone", "gradeYear"]));

    expect(shown).toMatchObject({
      fullName: "Dilnoza Karimova",
      phone: "",
      gradeYear: "",
      bio: "Hi",
      region: "samarkand",
      telegram: "dilnoza_k",
    });
  });

  it("hides the hometown without touching the current region", () => {
    expect(withoutHiddenParts(profile, new Set(["hometownRegion"]))).toMatchObject({
      region: "samarkand",
      hometownRegion: null,
    });
  });

  it("shows useful details by default and keeps phone private", () => {
    const shown = withoutHiddenParts(profile, new Set(DEFAULT_HIDDEN_PROFILE_PARTS));
    expect(shown).toMatchObject({
      bio: "Hi",
      region: "samarkand",
      city: "Samarkand",
      school: "School 12",
      gradeYear: "10",
      phone: "",
      telegram: "dilnoza_k",
      instagram: "dilnoza.codes",
      linkedin: profile.linkedin,
      links: profile.links,
    });
  });

  it("requires confirmation only when previously hidden contacts become public", () => {
    expect(contactPublicationRequired(["phone", "telegram"], ["phone"])).toBe(true);
    expect(contactPublicationRequired(["phone", "linkedin"], ["phone"])).toBe(true);
    expect(contactPublicationRequired(["phone", "gradeYear"], ["phone"])).toBe(false);
    expect(contactPublicationRequired(["phone"], ["phone", "telegram"])).toBe(false);
    expect(contactPublicationRequired([], [])).toBe(false);
  });

  it("does not treat a legacy hidden portfolio link as a contact to confirm", () => {
    expect(contactPublicationRequired(["phone", "links"], ["phone"])).toBe(false);
  });
});
