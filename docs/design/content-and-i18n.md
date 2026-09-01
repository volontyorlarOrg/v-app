# Content and Internationalisation

Three locales, from day one, with server rendering.

**Code:** [`src/i18n/`](../../src/i18n/) · catalogues in `src/i18n/messages/<locale>/`

---

## Locales

| Code | Tag | Label |
| --- | --- | --- |
| `uz` | `uz-UZ` | O'zbekcha — **default** |
| `ru` | `ru-RU` | Русский |
| `en` | `en-US` | English |

`uz` is the default because YVC's volunteers are in Uzbekistan and the
handoff's own canonical example URL is `/uz/opportunities?...`. It is a product
decision, and flipping `defaultLocale` in
[`routing.ts`](../../src/i18n/routing.ts) is the only change required.

Uzbek is written in **Latin** script. Russian is Cyrillic — which is why the
Manrope font load includes the Cyrillic subset.

## Every URL carries its locale

`localePrefix: "always"`. Hiding the prefix for the default locale and
resolving it from a cookie would mean an opportunity link pasted into a
Telegram channel renders in a different language for each reader, and the same
URL is two different pages to a crawler. An explicit prefix makes a shared link
mean one thing.

## Catalogues are split by domain

`common`, `nav`, `auth`, `opportunities`, `applications`, `profile`, `record`,
`errors`, `validation` — nine files per locale, rather than one blob nobody can
review. Adding a domain means a file per locale plus one line in
[`request.ts`](../../src/i18n/request.ts).

## Server-first

`next-intl` translates in Server Components via `await getTranslations(...)`.
This is a deliberate improvement over the reference architecture's client-only
i18n, whose own documentation notes "a server component has no `t`" as a
constraint that shapes its component API.

Consequence for shared components: they take **rendered strings**, not keys,
because their callers may be on either side of the boundary.

## Validation and errors use keys, never sentences

Zod schemas carry keys (`"required"`, `"tooLong"`, `"invalidPhone"`); server
actions return error **codes**. Both are translated at render time. A backend's
English sentence is never shown to a user.

## Dates

`Intl` through next-intl's formatter, in **`Asia/Tashkent`** —
[`EVENT_TIME_ZONE`](../../src/lib/datetime.ts). Deadlines are the one thing
this product must not be ambiguous about: a volunteer opening a link from
abroad sees the local closing time, which is the one that binds them.

The same constant drives the "closes in N days" arithmetic, so the badge and
the date beneath it can never disagree.

## Enforced by tests

`src/i18n/messages.test.ts` asserts, for every namespace:

- all three locales have the same namespace files
- **identical key sets** — a key added to English and forgotten in Uzbek would
  otherwise render as `list.emptyTitle` in front of the audience the product is
  for
- no empty strings
- **identical ICU argument names** — a translation that drops `{count}` renders
  a sentence with a hole in it; one that invents an argument throws at render

The checker is depth-aware: inner braces in `{count, plural, one {# event}
other {# events}}` delimit plural branches, not arguments, and translations are
free to word those branches as their language needs.

## Adding copy

1. Add the key to `en/<namespace>.json` first.
2. Add it to `ru` and `uz`. Not later — the parity test fails.
3. Use ICU plurals for counts. Russian needs `one`/`few`/`other`; Uzbek uses
   `other`.
4. Never hard-code a user-visible string in a component.

## Not done

No translation-management tooling; catalogues are edited by hand. No RTL
support — none of the three locales needs it. The Russian and Uzbek copy is
written by the implementing agent and should be reviewed by a native speaker
before launch.
