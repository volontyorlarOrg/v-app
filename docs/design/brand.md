# Brand and Logo

The canonical record of the mark, its construction, and every asset in
`public/brand/`. Colour usage lives in
[`design-system.md`](./design-system.md).

---

## The mark

A circle above an open arc. It reads simultaneously as a person with raised
arms, the letter V, and a smile.

**Primary colour:** `#007FC2` — UN Blue, from the UN Volunteers / International
Volunteer Day brand guide.

## Construction (200 × 200 unit square)

|                            |                                 |
| -------------------------- | ------------------------------- |
| Arc centre                 | (100, 72)                       |
| Arc radius                 | 59                              |
| Arc stroke width           | 13                              |
| Arc endpoints              | (41.74, 81.30), (158.26, 81.30) |
| Arc sweep                  | 161.86°                         |
| Caps                       | round                           |
| Dot centre                 | (100, 76)                       |
| Dot radius                 | 20                              |
| Gap, dot to arc inner edge | 28.5 units                      |

As an SVG path the arc is:

```svg
<circle cx="100" cy="76" r="20" fill="#007FC2"/>
<path d="M 41.74 81.30 A 59 59 0 0 0 158.26 81.30"
      fill="none" stroke="#007FC2" stroke-width="13" stroke-linecap="round"/>
```

Everything derives from three numbers — the arc radius, the stroke width, and
the dot radius. **Change one and re-derive the rest.** Do not nudge parts
independently.

## Sizes and clear space

- **Minimum size:** 16 px. Verified at 16, 24, and 32 px with no simplification.
- **Clear space:** one dot radius (20 units at this scale) on every side. It
  scales with the mark.

The 200 × 200 viewBox includes that clear space, so the visible mark occupies
roughly 65% of the box's width. When placing it in the interface, size the box
rather than the ink: the header renders it at 40px, which puts the visible mark
at about 26px.

## Files

All under [`public/brand/`](../../public/brand).

| File                      | Use                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `mark-blue.svg`           | **Primary.** Stroked path, smallest file, best for web. Used in-app.                                                                       |
| `mark-blue-outlined.svg`  | Stroke converted to a filled path — trademark filing, print, laser cutting, embroidery, and any system that cannot render strokes reliably |
| `mark-black-outlined.svg` | One-colour black, outlined — trademark filings usually want black-and-white                                                                |
| `mark-ink.svg`            | Dark version (`#222B33`)                                                                                                                   |
| `mark-white.svg`          | Knockout version                                                                                                                           |
| `icon-blue.svg`           | Rounded-square app icon, mark at 78%                                                                                                       |
| `icon-white.svg`          | Knockout app icon                                                                                                                          |
| `lockup-horizontal.svg`   | Mark plus wordmark                                                                                                                         |
| `png/`                    | Rasters, 16 → 1024 px                                                                                                                      |
| `favicon.ico`             | Multi-resolution, 16 → 256 px                                                                                                              |

Wired into the application at:

- `src/app/icon.svg` — `icon-blue.svg`
- `src/app/apple-icon.png` — `png/icon-blue-180.png`
- `src/app/favicon.ico`
- `src/app/[locale]/opengraph-image.png` — the lockup on white, 1200 × 630

## The wordmark

The interface sets the wordmark as **live text in Onest bold**, not as an image.

That is deliberate. The supplied `lockup-horizontal.svg` sets the wordmark in a
system fallback face — the specification notes it "is currently set in a system
fallback, not final type". Rendering that file in the header would look
different on every operating system. Live text in the webfont is consistent,
selectable, and scales with the layout.

`brandWordmark` is a translation key with the same value in all three
catalogues, because a wordmark is a proper noun rather than copy.

**Still outstanding:** the wordmark needs a licensed face with U+02BB support
(Onest is verified) and then custom letterform adjustment. A descriptive name
means the wordmark has to carry the distinctiveness the word cannot.

## Rules

- The mark and wordmark recolour only **as a single unit**.
- Never stretch, rotate, outline, or add a glow.
- The mark is never two-colour — see
  [`design-system.md`](./design-system.md) §1, rule 1, and the contrast check
  that proves why.

## Before filing a trademark

Carried over from the specification, and not yet done:

1. Reverse-image search the mark, and search the WIPO Global Brand Database. A
   circle above an arc is a common construction — confirm it is clear in the
   relevant classes first.
2. File the **composite** (mark plus wordmark) as a figurative mark, and the
   word mark separately.
3. Use `mark-black-outlined.svg` for the filing artwork.
4. Uzbekistan is first-to-file. Register the domain and file in the same week,
   before any public announcement.

## Superseded

The earlier teal "Night Signal Board" identity — a dark canvas with
`#45C1C4` teal and `#F3A94A` amber, set in Bricolage Grotesque and Manrope — is
replaced entirely. Its assets (`volontyorlar-mark.svg` and siblings under the
old `public/logo/`) are removed from this repository. The marketing repository
still carries them; it needs the same migration.
