import { describe, expect, it } from "vitest";

import en from "@/i18n/messages/en.json";
import ru from "@/i18n/messages/ru.json";
import uz from "@/i18n/messages/uz.json";
import {
  COMMON_PROFILE_LANGUAGES,
  PROFILE_LANGUAGE_CODES,
  PROFILE_LANGUAGE_LIMIT,
  createLanguageDirectory,
  filterLanguageOptions,
  normalizeLanguageText,
} from "@/lib/profile/languages";

const directory = createLanguageDirectory({
  en: en.languages,
  ru: ru.languages,
  uz: uz.languages,
});

describe("the language catalog", () => {
  it("names every offered language in all three locales, and nothing else", () => {
    for (const names of [en.languages, ru.languages, uz.languages]) {
      expect(Object.keys(names).sort()).toEqual([...PROFILE_LANGUAGE_CODES].sort());
    }
  });
});

describe("normalizeLanguageText", () => {
  it("ignores case, marks, apostrophes and a trailing word for language", () => {
    expect(normalizeLanguageText("Oʻzbek tili")).toBe("ozbek");
    expect(normalizeLanguageText("O'ZBEK")).toBe("ozbek");
    expect(normalizeLanguageText("Английский язык")).toBe(
      normalizeLanguageText("английский"),
    );
    expect(normalizeLanguageText("tili")).toBe("tili");
  });
});

describe("canonical language values", () => {
  it("turns what volunteers typed before the picker into codes", () => {
    expect(
      directory.canonicalList(["Uzbek", "rus tili", "Английский", "O'zbek", "EN"]),
    ).toEqual(["uz", "ru", "en"]);
  });

  it("keeps a value it cannot recognise rather than dropping it", () => {
    expect(directory.canonicalList(["Klingon", "uz"])).toEqual(["Klingon", "uz"]);
  });

  it(`keeps no more than ${PROFILE_LANGUAGE_LIMIT}`, () => {
    expect(directory.canonicalList([...PROFILE_LANGUAGE_CODES])).toHaveLength(
      PROFILE_LANGUAGE_LIMIT,
    );
  });
});

describe("language options", () => {
  it("leads with the common languages in a fixed order, then sorts the rest by name", () => {
    const options = directory.options("en");
    const common = options.filter((option) => option.common);
    const rest = options
      .filter((option) => !option.common)
      .map((option) => option.label);

    expect(common.map((option) => option.value)).toEqual([...COMMON_PROFILE_LANGUAGES]);
    expect(options.slice(0, common.length)).toEqual(common);
    expect(rest).toEqual([...rest].sort((a, b) => a.localeCompare(b, "en")));
    expect(options).toHaveLength(PROFILE_LANGUAGE_CODES.length);
  });

  it("labels options in the interface language and keeps an unrecognised stored value", () => {
    const options = directory.options("uz", ["Klingon"]);

    expect(options[0]).toMatchObject({ value: "uz", label: "Oʻzbek tili" });
    expect(options).toContainEqual(
      expect.objectContaining({ value: "Klingon", label: "Klingon", common: false }),
    );
  });

  it("finds a language by its name in any of the three locales", () => {
    const options = directory.options("ru");

    expect(filterLanguageOptions(options, "ingliz")[0]?.value).toBe("en");
    expect(filterLanguageOptions(options, "English")[0]?.value).toBe("en");
    expect(filterLanguageOptions(options, "англ")[0]?.value).toBe("en");
    expect(filterLanguageOptions(options, "zzz")).toEqual([]);
    expect(filterLanguageOptions(options, "  ")).toHaveLength(options.length);
  });

  it("puts names that start with the query before names that only contain it", () => {
    const values = filterLanguageOptions(directory.options("en"), "tatar").map(
      (option) => option.value,
    );

    expect(values.indexOf("tt")).toBeLessThan(values.indexOf("crh"));
  });
});

describe("formatting stored languages", () => {
  it("uses the interface language, including for values stored as text", () => {
    expect(directory.format(["uz", "ru"], "en")).toBe("Uzbek, Russian");
    expect(directory.format(["uz", "Russian"], "ru")).toBe("Узбекский, Русский");
    expect(directory.format(["en"], "uz")).toBe("Ingliz tili");
  });
});
