# One blue on a soft ground: the app leaves the marketing palette

**Date:** 2026-11-02

**Softened the same day.** The first version below (cobalt `#1853C6`, pure white,
radius 4 / 6 / 8 / 12, flat pass) was on screen for an hour before the user said the
edges and the colour were "a very aggressive transition from the previous one".
The direction stayed and the distance shrank: blue `#0F66AC` at hue 250, between the
old hue 243 and cobalt's 262; white panels on a soft `#F5F7FA` ground;
the previous design's `ink`, `ink-muted` and `border-control` back; radius
6 / 10 / 14 / 18; tinted chips and icon tiles; orange text for XP and results again (`accent-ink` is
back); a pale blue sidebar, the user's own pick from three rendered options; a dark
theme with a slight blue cast rather than
neutral graphite; and a gentle gradient and shadow on the pass. **A redesign has to
read as an evolution of what people already know; check the jump against the old
screen, not only against the brief.**

## Decision

The user rejected the design outright: "I completely hate this design pattern",
the blue tone above all, and asked for it to be as minimal as possible, with close
attention to fonts, corner radius and spacing. v-app now has its own system:

- One cobalt blue, `#1853C6`, for action, link, focus and selection. Blue is a
  signal, never a field.
- White and hairlines in the light theme, neutral graphite in the dark theme. The
  navy shell, the `band`, `primary-deep`, `primary-muted` and `accent-ink` tokens,
  the washes, the dot grid and the panel shadows are gone.
- Inter as the only typeface, replacing Onest and Source Serif 4. Three weights,
  no capitals, no spread letters.
- Radius 4 / 6 / 8 / 12, spacing on a 4px grid, and control height as a variable:
  44px on touch, 40 and 36px under a fine pointer.
- Orange stays the person's colour but shrinks to a small icon or dot.

`DESIGN.md` is the system, and `docs/ui/MINIMAL_BLUE_RESEARCH.md` is the evidence.

## Why this breaks a standing rule

`adopt-the-marketing-site-patterns.md` and `docs/operations/EXTENDING.md` said the
app does not fork `v-web`'s palette, and `the-sidebar-is-the-whole-shell.md` added
the navy shell on the user's own request for "different colour combinations than
dull blue/white". The user's newer request overrides both, for this repository.

## Consequences

- **v-web and the portals still use the old palette and Onest.** A volunteer moving
  from the marketing site into the app now sees two looks. Porting is a separate
  decision for the user.
- The logo is unchanged: the kit's `#007FC2` and its rules still apply. At logo size
  hue 243 reads as the same family as the interface's hue 262.
- `src/app/design-tokens.test.ts` and `typography.test.ts` no longer assert the
  marketing site's values. They now pin this system, including negative assertions:
  no gradients, no capitals, no serif, no radius above 12px, no retired tokens.
- The profile sheet, the leaderboard and other screens in `../v-web` that mirror
  these designs were not touched.

## Traps found on the way

- **Do not pick a font from a coverage list.** Next's font data says Geist, Manrope
  and Golos Text have Cyrillic, which is true, but they do not draw U+02BB, the
  Uzbek `ʻ`, so it falls back mid-word. Test the glyph in a browser.
- **Onest's tabular `1`** sits in a cell almost twice its width, so `12` reads as
  `1 2` wherever `.tabular` is set. It was invisible until the serif figures went.
- **`outline-none` was hiding focus.** The switch and the toggle variants both carried
  it. Both now draw the standard ring.

See [[adopt-the-marketing-site-patterns]] and [[the-sidebar-is-the-whole-shell]].
