# Onest covers Uzbek, Russian, and English in two subsets

The logo specification says the wordmark needs "a licensed face with U+02BB
support (Onest is verified)".

U+02BB is MODIFIER LETTER TURNED COMMA — the character in Uzbek Latin's **oʻ**
and **gʻ**. Its sibling U+02BC (MODIFIER LETTER APOSTROPHE) is the _tutuq
belgisi_ in words like _maʼlumot_ and _eʼlon_.

Checking Google Fonts directly: Onest's **`latin`** subset declares
`U+02BB-02BC`, and it ships a full **`cyrillic`** subset. So one family covers
all three locales with two subsets, and the wordmark and the interface share a
voice.

That is why `src/app/[locale]/layout.tsx` loads exactly one font with
`subsets: ["latin", "cyrillic"]`.

## The bug this surfaced

The Uzbek catalogues had been written with ASCII apostrophes — `O'zbekcha`,
`ko'ngillilik`, `ma'lumot`. That is wrong orthography, not a typographic
nicety: `'` is a quotation mark, `ʻ` and `ʼ` are letters.

Fixed across all nine Uzbek namespace files and the locale endonym in
`src/i18n/routing.ts`. The rule when adding Uzbek copy:

- after `o`/`O`/`g`/`G` → `ʻ` (U+02BB)
- glottal stop elsewhere → `ʼ` (U+02BC)
- never `'` (U+0027)
