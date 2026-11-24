export const EDUCATION_TYPES = ["school", "university", "gap_year"] as const;
export type EducationType = (typeof EDUCATION_TYPES)[number];

export const INSTITUTION_TYPES = ["school", "university"] as const;
export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export const PLACE_FIELDS = ["region", "district", "education", "gradeYear"] as const;
export type PlaceField = (typeof PLACE_FIELDS)[number];

export const NUMBERED_SCHOOL_MAX = 399;

export type LocalizedName = { uz: string; ru: string; en: string };

export type PlaceOption = {
  id: string;
  name: LocalizedName;
};

export type DistrictOption = PlaceOption & {
  region: string;
  kind: "district" | "city";
};

export type InstitutionOption = PlaceOption & {
  type: InstitutionType;
  region: string;
  districtId: string | null;
};

export function isEducationType(value: unknown): value is EducationType {
  return (
    typeof value === "string" && (EDUCATION_TYPES as readonly string[]).includes(value)
  );
}

export function isInstitutionType(value: unknown): value is InstitutionType {
  return (
    typeof value === "string" &&
    (INSTITUTION_TYPES as readonly string[]).includes(value)
  );
}

export function localName(name: LocalizedName, locale: string): string {
  if (locale === "ru") return name.ru || name.uz;
  if (locale === "en") return name.en || name.uz;
  return name.uz;
}

export function needsInstitution(education: EducationType | "" | null): boolean {
  return education === "school" || education === "university";
}

export function onlyPlaceMissing(missing: readonly string[]): boolean {
  return (
    missing.length > 0 &&
    missing.every((field) => (PLACE_FIELDS as readonly string[]).includes(field))
  );
}

export function numberedSchoolId(districtId: string, number: number): string {
  return `school-${districtId}-${number}`;
}

export function schoolNumberQuery(query: string): number | null {
  const match =
    /^\s*(?:№\s*)?(\d{1,3})\s*(?:-?\s*(?:son|maktab|school|школа))?\s*$/i.exec(query);
  if (!match) return null;
  const number = Number(match[1]);
  return number >= 1 && number <= NUMBERED_SCHOOL_MAX && !match[1]!.startsWith("0")
    ? number
    : null;
}

export function numberedSchoolOption(
  district: DistrictOption,
  number: number,
): InstitutionOption {
  return {
    id: numberedSchoolId(district.id, number),
    type: "school",
    region: district.region,
    districtId: district.id,
    name: {
      uz: `${number}-son maktab`,
      ru: `Школа № ${number}`,
      en: `School No. ${number}`,
    },
  };
}

const APOSTROPHES = /['‘’`ʻʼ´]/g;

export function searchKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(APOSTROPHES, "")
    .replaceAll("ё", "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function matchesOption(option: PlaceOption, query: string): boolean {
  const tokens = searchKey(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;
  const words = searchKey(
    `${option.name.uz} ${option.name.ru} ${option.name.en}`,
  ).split(" ");
  return tokens.every((token) => words.some((word) => word.startsWith(token)));
}

export function sortByLocalName<T extends PlaceOption>(
  options: readonly T[],
  locale: string,
): T[] {
  const collator = new Intl.Collator(locale === "uz" ? "uz-Latn" : locale, {
    numeric: true,
    sensitivity: "base",
  });
  return [...options].sort((a, b) =>
    collator.compare(localName(a.name, locale), localName(b.name, locale)),
  );
}
