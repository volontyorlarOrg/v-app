# Design System

A white product surface carrying UN Blue structure, with orange rationed for
moments that belong to a volunteer.

**Source of truth:** [`docs/design/brand.md`](./brand.md) for the logo
specification; [`src/lib/design/palette.ts`](../../src/lib/design/palette.ts)
for the token values; [`src/app/globals.css`](../../src/app/globals.css) for the
CSS variables. A test asserts the two stay identical, and
`npm run check:contrast` asserts every ratio below.

---

## 1. Colour

Two brand colours, both from the UN Volunteers / International Volunteer Day
brand guide, plus the neutrals and one system colour the product needs.

| Token            | Hex       | On white | Use                                                 |
| ---------------- | --------- | -------- | --------------------------------------------------- |
| `canvas`         | `#FFFFFF` | —        | The page. White dominates.                          |
| `surface`        | `#F4F7FA` | —        | Cards, quiet panels                                 |
| `surface-strong` | `#EDF2F7` | —        | Hover, nested panels, skeletons                     |
| `line`           | `#DDE5EC` | 1.27:1   | Decorative dividers and card edges                  |
| `line-control`   | `#748799` | 3.70:1   | **Form control borders** — see §5                   |
| `ink`            | `#222B33` | 14.37:1  | Body copy, headings, wordmark                       |
| `ink-muted`      | `#556270` | 6.24:1   | Supporting copy, metadata                           |
| `blue`           | `#007FC2` | 4.36:1   | **Graphics only** — the mark, icons, large graphics |
| `blue-deep`      | `#005E92` | 6.96:1   | Blue **text**, filled primary buttons, focus ring   |
| `blue-tint`      | `#EAF3F9` | —        | Structural chips and panels                         |
| `orange`         | `#E85D30` | 3.48:1   | **Graphics only** — achievement graphics            |
| `orange-deep`    | `#B34917` | 5.41:1   | Orange **text**, filled achievement chips           |
| `orange-tint`    | `#FDF0EA` | —        | Achievement chips and panels                        |
| `danger`         | `#B3261E` | 6.54:1   | Destructive actions, errors, imminent deadlines     |
| `danger-tint`    | `#FCEDEB` | —        | Error and urgent panels                             |
| `knockout`       | `#FFFFFF` | —        | Text on a filled blue, orange, or danger control    |

### The role split

**Blue is the institution.** Navigation, structure, primary actions, the mark,
system messages, verification ticks, "open" status.

**Orange is the person.** A confirmed hour, a level reached, an accepted
application. Ruler 70 / Hero 30, expressed in colour.

Rationing the orange is what keeps it meaning something. In practice that means
orange appears on exactly three things today: the volunteer level, an accepted
application, and a completed profile. If a fourth candidate appears, ask whether
a person actually did something.

**60-30-10.** White dominates, blue carries structure, orange appears only where
a person did something.

### Three rules that are not negotiable

**1. The mark is never two-colour.** `#007FC2` and `#E85D30` are **1.25:1**
against each other — 1.24:1 desaturated. In greyscale, one-colour print,
embroidery, or for a viewer with colour vision deficiency, an orange dot on a
blue arc merges into one flat shape. The mark is blue, ink, or white — one
colour at a time.

**2. Never set orange text on blue, or blue text on orange.** Same 1.25:1. They
also vibrate optically at that luminance.

**3. `blue` and `orange` are graphics colours, not text colours.** `#007FC2` is
4.36:1 on white: it clears the 3:1 graphics threshold and misses the 4.5:1 text
floor. Fine for the mark and headings at 24px+ (or 18.66px+ bold). Body text,
small labels, and **any white-on-blue button** use `blue-deep`. The same logic
applies to orange: `#E85D30` for graphics, `#B34917` for text.

Rule 3 has a consequence worth stating plainly: **a primary button is
`blue-deep`, not `blue`.** White on `#007FC2` is 4.36:1 and fails AA for a
button label. `check-contrast` asserts this stays true.

### Danger is a system colour, not a brand colour

The logo specification defines a brand palette; a product also needs an error
colour. `danger` (`#B3261E`) covers destructive actions, validation and error
states, and deadlines inside the urgent window.

It is deliberately kept away from orange's meaning: orange says _you did
something_, danger says _act carefully or act now_. The two never appear as
alternatives in the same control, and both always carry an icon and a word.

### Colour is never the only carrier of meaning

Every status badge has an icon and a word. `accepted` versus `rejected`, `open`
versus `closed`, saved versus not — all readable in greyscale.

## 2. Typography

**Onest**, one family, all three locales.

It is the face the logo specification names for the wordmark, and its `latin`
subset covers **U+02BB–02BC** — the modifier letters Uzbek needs for _oʻ_ and
_gʻ_, and the tutuq belgisi in _maʼlumot_. Its `cyrillic` subset covers Russian.
One family, two subsets, three languages, and the wordmark and the interface in
the same voice.

| Role       | Size                     | Weight | Notes                         |
| ---------- | ------------------------ | ------ | ----------------------------- |
| Page title | `text-2xl` → `text-3xl`  | 700    | One `<h1>` per page           |
| Section    | `text-lg`                | 600    |                               |
| Body       | `1rem` / 1.65            | 400    | Measure below ~42rem          |
| Label      | `text-xs`, 0.14em, upper | 700    | Field labels, record captions |

Headings carry `letter-spacing: -0.02em` and `text-wrap: balance`; paragraphs
carry `text-wrap: pretty`.

## 3. Shape and space

`md` 8px · `lg` 12px (buttons, inputs) · `xl` 16px · `card` 20px (surfaces) ·
`pill` full.

Spacing follows Tailwind's scale. Section rhythm tokens are
`--spacing-section-mobile` (72px) and `--spacing-section-wide` (112px).

## 4. Touch targets

Buttons are 44px (`md`) or 52px (`lg`). `sm` is 36px and is reserved for
controls inside an already-tappable row. Bottom-bar tabs are 56px.

## 5. Borders carry an accessibility requirement

WCAG 1.4.11 requires **3:1** for the boundary of a meaningful UI component. A
form control's border is one.

That is why there are two border tokens. `line` (`#DDE5EC`, 1.27:1) is
decorative — card edges, dividers, the header rule. `line-control`
(`#748799`, 3.70:1) is what an input, textarea, or select uses. Using `line` on
a form control is an accessibility regression, and the contrast script will not
catch it because it cannot see which element a class landed on. Use `Field`'s
`Input`/`Textarea`/`Select` and this is handled.

## 6. Motion

`motion` is available and used sparingly: step transitions, application
progress, meaningful dialog and list feedback. Never as the only signal of a
state change.

`prefers-reduced-motion: reduce` collapses every animation and transition
globally. Because motion is never load-bearing, removing it costs nothing.

## 7. Focus

One treatment, defined once: a 2px `blue-deep` outline at 2px offset on every
interactive element. 6.96:1 on white, 6.48:1 on `surface`. Removing it is a
regression, not a style choice.

## 8. Enforcement

```bash
npm run check:contrast
```

35 checks: every text/surface pair against 4.5:1, every graphics and border pair
against 3:1, and five relationships that must stay _false_ — including that blue
and orange remain indistinguishable, which is the evidence for rule 1.

Two Vitest suites back it up:
[`palette.test.ts`](../../src/lib/design/palette.test.ts) checks the maths and
the rules; [`tokens.test.ts`](../../src/lib/design/tokens.test.ts) checks that
`globals.css` and the palette module cannot drift apart, and that no hard-coded
hex appears outside the token block.
