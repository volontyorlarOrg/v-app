# Design System — "Night Signal Board"

Sourced from `DESIGN.md` in the marketing repository (`volontyorlarOrg/v-web`)
so the product and the public site are recognisably one brand.

**Tokens live in one place:** [`src/app/globals.css`](../../src/app/globals.css),
as Tailwind 4 `@theme` variables. Do not introduce a colour, radius, or font
outside it.

---

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `night` | `#071719` | Page canvas, deepest inset |
| `field` | `#0D2529` | Section bands, secondary cards, hover fills |
| `panel` | `#123438` | Default raised surface |
| `panel-strong` | `#174147` | Emphasised or confirmed states |
| `signal-line` | `#285158` | Borders, dividers, timeline tracks |
| `ink` | `#F4FBFB` | Primary copy and high-value facts |
| `muted` | `#A8C0C2` | Supporting copy, metadata, inactive |
| `teal` | `#45C1C4` | Action, progress, confirmation, identity |
| `teal-hover` | `#62D1D3` | Primary hover |
| `teal-ink` | `#082326` | Copy on solid teal |
| `amber` | `#F3A94A` | Deadlines and labelled illustrative content |

### Product extensions

Not in the source `DESIGN.md`; added because the product needs them, chosen to
sit inside the night field, and marked as extensions in `globals.css`:

| Token | Value | Use |
| --- | --- | --- |
| `danger` | `#F2777A` | Destructive actions, failed saves, validation |
| `danger-ink` | `#2A0D0E` | |
| `success` | `#6FD3A2` | Accepted status |

### Two named rules

**The Signal Rarity Rule.** Teal identifies action, progress, confirmation, or
identity. Do not wash a whole section in it except for a single decisive
callout.

**The Honest Amber Rule.** Amber is for deadlines and visibly labelled
illustrative or target information. Never a generic accent. This is why the
sample-data notice is amber and nothing else on a normal page is.

### And one that overrides both

**Colour is never the only carrier of meaning.** Every status badge has an
icon and a word. A red/green distinction is invisible to a large number of
readers, and this product uses status to tell people whether they can still
apply.

## Typography

- **Display:** Bricolage Grotesque — headings only, via `--font-display`.
- **Body:** Manrope — everything else, via `--font-sans`.

Both are loaded through `next/font/google` with `display: "swap"`. Manrope
includes the **Cyrillic** subset; without it every Russian page falls back to a
system font.

| Role | Size | Weight | Notes |
| --- | --- | --- | --- |
| Page title | `text-2xl` → `text-3xl` | 600 | One `<h1>` per page |
| Section | `text-lg` | 600 | |
| Body | `1rem` / 1.75 | 400 | Measure below ~42rem |
| Label | `text-xs`, `0.14em`, uppercase | 800 | Field labels, record captions |

## Radii and spacing

`md` 8px · `lg` 12px (buttons, inputs) · `xl` 16px · `card` 24px (surfaces) ·
`feature` 28px · `callout` 32px.

Spacing follows Tailwind's scale. Section rhythm tokens
(`--spacing-section-mobile` 96px, `--spacing-section-wide` 128px) carry over
from the marketing site for long-form pages.

## Touch targets

Buttons are 44px (`md`) or 52px (`lg`). The `sm` size is 36px and is reserved
for controls inside an already-tappable row. Bottom-bar tabs are 56px.

## Motion

`motion` is installed and used sparingly: step transitions, application
progress, meaningful dialog and list feedback. Never as the only signal of a
state change.

`prefers-reduced-motion: reduce` collapses every animation and transition
globally in `globals.css`. Because motion is never load-bearing, removing it
costs nothing.

## Focus

One treatment, defined once: a 2px teal outline with a 2px offset on every
interactive element. Removing it is a regression, not a style choice.

## Assets

Logos live in `public/logo/`, copied from the marketing repository:

| File | Use |
| --- | --- |
| `volontyorlar-mark.svg` | Primary mark — header, sign-in |
| `volontyorlar-mark-white.svg` | On photographic surfaces |
| `volontyorlar-horizontal.svg` | Wide placements |
| `volontyorlar-horizontal-white.svg` | Reversed wide |
| `volontyorlar-lockup.svg` | Vertical lockup |
| `volontyorlar-mark-192.png` / `-512.png` | Raster fallbacks |

Plus `src/app/icon.svg`, `apple-icon.png`, and `[locale]/opengraph-image.png`.

The mark and wordmark recolour only as a single unit. Preserve clear space
equal to the mark's head radius. Never stretch, rotate, outline, or add glow.

The legacy `yvc.png` / `yvc-white.png` from the marketing repository are
**historical source material and are not used here**.
