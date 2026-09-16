import type { Locale } from "@/i18n/routing";

export const PROFILE_LANGUAGE_CODES = [
  "uz",
  "ru",
  "en",
  "kaa",
  "tg",
  "kk",
  "ky",
  "tk",
  "tt",
  "ug",
  "crh",
  "az",
  "tr",
  "fa",
  "ar",
  "zh",
  "ja",
  "ko",
  "hi",
  "ur",
  "bn",
  "pa",
  "ps",
  "ne",
  "de",
  "fr",
  "es",
  "it",
  "pt",
  "nl",
  "pl",
  "cs",
  "sk",
  "uk",
  "be",
  "ro",
  "hu",
  "sr",
  "hr",
  "bs",
  "el",
  "he",
  "sv",
  "no",
  "da",
  "fi",
  "et",
  "lv",
  "lt",
  "ka",
  "hy",
  "id",
  "ms",
  "vi",
  "th",
  "sw",
  "am",
  "so",
  "mn",
] as const;

export type ProfileLanguageCode = (typeof PROFILE_LANGUAGE_CODES)[number];

export const COMMON_PROFILE_LANGUAGES = [
  "uz",
  "ru",
  "en",
  "kaa",
  "tg",
  "kk",
  "ky",
  "tk",
] as const satisfies readonly ProfileLanguageCode[];

export const PROFILE_LANGUAGE_LIMIT = 10;

export type LanguageNames = Readonly<Record<ProfileLanguageCode, string>>;

export type LanguageOption = {
  value: string;
  label: string;
  common: boolean;
  keywords: readonly string[];
};

const CODES = new Set<string>(PROFILE_LANGUAGE_CODES);
const COMMON = new Set<string>(COMMON_PROFILE_LANGUAGES);

const SPOKEN_ALIASES: Partial<Record<ProfileLanguageCode, readonly string[]>> = {
  uz: ["ozbekcha", "uzbekcha"],
  ru: ["ruscha"],
  en: ["inglizcha"],
};

const TRAILING_WORDS = ["tili", "language", "язык"];

export function isProfileLanguageCode(value: string): value is ProfileLanguageCode {
  return CODES.has(value);
}

export function normalizeLanguageText(value: string): string {
  const words = value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[ʻʼ'‘’`]/g, "")
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length > 1 && TRAILING_WORDS.includes(words.at(-1) ?? "")) words.pop();
  return words.join(" ");
}

function autonym(code: ProfileLanguageCode): string {
  try {
    return (
      new Intl.DisplayNames([code], { type: "language", fallback: "none" }).of(code) ??
      ""
    );
  } catch {
    return "";
  }
}

export type LanguageDirectory = {
  canonical: (value: string) => string;
  canonicalList: (values: readonly string[]) => string[];
  label: (value: string, locale: Locale) => string;
  format: (values: readonly string[], locale: Locale) => string;
  options: (locale: Locale, selected?: readonly string[]) => LanguageOption[];
};

export function createLanguageDirectory(
  catalogs: Readonly<Record<Locale, LanguageNames>>,
): LanguageDirectory {
  const keywords = new Map<ProfileLanguageCode, readonly string[]>();
  const aliases = new Map<string, ProfileLanguageCode>();

  for (const code of PROFILE_LANGUAGE_CODES) {
    const words = [
      ...new Set(
        [
          code,
          ...Object.values(catalogs).map((names) => names[code]),
          autonym(code),
          ...(SPOKEN_ALIASES[code] ?? []),
        ]
          .map(normalizeLanguageText)
          .filter(Boolean),
      ),
    ];
    keywords.set(code, words);
    for (const word of words) if (!aliases.has(word)) aliases.set(word, code);
  }

  const canonical = (value: string) => {
    const trimmed = value.trim();
    if (isProfileLanguageCode(trimmed.toLowerCase())) return trimmed.toLowerCase();
    return aliases.get(normalizeLanguageText(trimmed)) ?? trimmed;
  };

  const canonicalList = (values: readonly string[]) =>
    [...new Set(values.map(canonical).filter(Boolean))].slice(
      0,
      PROFILE_LANGUAGE_LIMIT,
    );

  const label = (value: string, locale: Locale) => {
    const code = canonical(value);
    return isProfileLanguageCode(code) ? catalogs[locale][code] : code;
  };

  return {
    canonical,
    canonicalList,
    label,
    format: (values, locale) =>
      canonicalList(values)
        .map((value) => label(value, locale))
        .join(", "),
    options: (locale, selected = []) => {
      const collator = new Intl.Collator(locale);
      const rest: LanguageOption[] = [
        ...PROFILE_LANGUAGE_CODES.filter((code) => !COMMON.has(code)).map((code) => ({
          value: code,
          label: catalogs[locale][code],
          common: false,
          keywords: keywords.get(code) ?? [],
        })),
        ...canonicalList(selected)
          .filter((value) => !isProfileLanguageCode(value))
          .map((value) => ({
            value,
            label: value,
            common: false,
            keywords: [normalizeLanguageText(value)],
          })),
      ].sort((first, second) => collator.compare(first.label, second.label));

      return [
        ...COMMON_PROFILE_LANGUAGES.map((code) => ({
          value: code,
          label: catalogs[locale][code],
          common: true,
          keywords: keywords.get(code) ?? [],
        })),
        ...rest,
      ];
    },
  };
}

export function filterLanguageOptions(
  options: readonly LanguageOption[],
  query: string,
): LanguageOption[] {
  const wanted = normalizeLanguageText(query);
  if (!wanted) return [...options];

  const starts: LanguageOption[] = [];
  const contains: LanguageOption[] = [];
  for (const option of options) {
    if (option.keywords.some((word) => word.startsWith(wanted))) starts.push(option);
    else if (option.keywords.some((word) => word.includes(wanted)))
      contains.push(option);
  }
  return [...starts, ...contains];
}
