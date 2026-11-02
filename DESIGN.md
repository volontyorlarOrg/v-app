---
name: Volontyorlar App
description: A white sheet with hairlines, one typeface, and one cobalt blue that only ever means "you can act here" or "you are here" — plus the volunteer's pass, the single large field of blue in the product.
colors:
  paper: "#FFFFFF"
  surface: "#FFFFFF"
  surface-sunk: "#F6F7F9"
  surface-soft: "#EBF2FE"
  surface-raised: "#FFFFFF"
  field: "#FFFFFF"
  ink: "#181B20"
  ink-muted: "#5E636D"
  border: "#E4E6EA"
  border-control: "#878C96"
  knockout: "#FFFFFF"
  primary: "#1853C6"
  action: "#1853C6"
  action-hover: "#0A41AD"
  accent: "#E85D30"
  danger: "#B3261E"
  danger-ink: "#8F1E18"
  danger-muted: "#F7E3E2"
  gold: "#D4A53A"
  gold-ink: "#7A5A0E"
  silver: "#B5BFCA"
  silver-ink: "#5B6774"
  bronze: "#C58256"
  bronze-ink: "#7D4A24"
  logo-blue: "#007FC2"
  logo-orange: "#E85D30"
  logo-word: "#007FC2"
typography:
  page:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem → 1.75rem"
    fontWeight: 600
    lineHeight: "2rem → 2.25rem"
    letterSpacing: "-0.02em"
  greeting:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem → 2rem"
    fontWeight: 600
    lineHeight: "2.25rem → 2.5rem"
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: "2.25rem"
    letterSpacing: "-0.02em"
  panel-title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.5rem"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
    letterSpacing: "normal"
  small:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1.125rem"
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  grid: "4px"
  sidebar: "16rem"
  aside: "22rem"
  gutter-mobile: "16px"
  gutter-wide: "40px"
  panel-gap: "24px"
  workspace: "72rem"
components:
  panel:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  sidebar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    borderColor: "{colors.border}"
    width: "{spacing.sidebar}"
  sidebar-active:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    height: "36px, 44px on touch"
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.knockout}"
    rounded: "{rounded.md}"
    height: "40px, 44px on touch"
  button-outline:
    borderColor: "{colors.border}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "36px, 44px on touch"
  control:
    backgroundColor: "{colors.field}"
    borderColor: "{colors.border-control}"
    rounded: "{rounded.md}"
    height: "40px, 44px on touch"
  switch-on:
    backgroundColor: "{colors.action}"
    borderColor: "{colors.action}"
    rounded: "{rounded.full}"
    size: "36px × 20px"
  switch-off:
    backgroundColor: "transparent"
    borderColor: "{colors.border-control}"
    rounded: "{rounded.full}"
    size: "36px × 20px"
  chip:
    backgroundColor: "{colors.surface-sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  volunteer-pass:
    backgroundColor: "{colors.action}"
    textColor: "{colors.knockout}"
    rounded: "0.75em"
---

# Design System: Volontyorlar App

## Overview

**Creative North Star: "One blue on white paper"**

The application is a white sheet. Neutrals and hairlines carry all of the
structure, one typeface carries all of the text, and one cobalt blue carries all
of the meaning. Blue is a signal, never a field: it marks what a volunteer can
act on and where they are, and nothing else. A screen is mostly white, grey and
near-black, so when something is blue it is worth looking at.

The one exception is deliberate. The volunteer's pass on the dashboard is a
solid cobalt card hanging on a strap from the top of the page: the only large
area of blue in the product, belonging to the only thing here that is truly the
volunteer's own. The whole budget for boldness is spent there, and everything
around it stays quiet.

**Key characteristics**

- A white 16rem sidebar with a hairline edge, five sections at the top, the
  identity row (the profile's link) above settings at the foot, and no top bar
  on desktop. On a phone a 56px header and a five-tab bar. Nothing in the sidebar
  collapses.
- A white workspace, up to 72rem wide. Panels are not raised off it: they are
  white boxes with a hairline edge and an 8px radius, with no shadow.
- No gradients, washes, glows, dot grids, blurs or panel shadows anywhere. The
  stylesheet has no `radial-gradient` or `linear-gradient`, and a test holds it
  to that.
- Selected is one treatment everywhere: `surface-soft` with `primary` text. The
  sidebar, the type switcher, segmented filters, pagination and language choices
  all use it, so it only has to be learned once.
- Chips share one quiet shape, `surface-sunk` at a 4px radius with an icon and a
  word. Only the small icon's hue changes between a system state and something
  the person did.
- The dark theme is neutral graphite, not navy. Radix warns against saturated
  greys for an app background, and the old navy room is what made the blue feel
  everywhere at once.

Why these values and not others is in
[`docs/ui/MINIMAL_BLUE_RESEARCH.md`](docs/ui/MINIMAL_BLUE_RESEARCH.md).

## Colour

Everything below is computed in OKLCH and pinned by
`src/app/design-tokens.test.ts`.

| Token             | Light     | Dark      | Use                                                |
| ----------------- | --------- | --------- | -------------------------------------------------- |
| `paper`/`surface` | `#FFFFFF` | `#121314` | The page and panels: one sheet                     |
| `surface-sunk`    | `#F6F7F9` | `#1D1E20` | Hover, meter track, chip, thumbnail ground         |
| `surface-soft`    | `#EBF2FE` | `#1D2638` | Selected state only, and the viewer's own row      |
| `surface-raised`  | `#FFFFFF` | `#1D1E20` | Popovers, menus, dialogs                           |
| `field`           | `#FFFFFF` | `#161719` | Inside a text field                                |
| `ink`             | `#181B20` | `#E6E8EB` | Text                                               |
| `ink-muted`       | `#5E636D` | `#A4A8AF` | Secondary text and neutral icons                   |
| `border`          | `#E4E6EA` | `#2A2B2E` | Hairlines, panel edges, secondary button edges     |
| `border-control`  | `#878C96` | `#686C73` | A field's edge, 3:1 against the page               |
| `primary`         | `#1853C6` | `#93B8FB` | Links, selected text, focus ring, small marks      |
| `action`          | `#1853C6` | `#2D63CD` | Solid fills behind a white label, meters, the pass |
| `action-hover`    | `#0A41AD` | `#386DD5` | The hover of a solid fill                          |
| `accent`          | `#E85D30` | `#E85D30` | Small marks only: see below                        |

In the light theme one value does every job: `#1853C6` passes AA both behind
white text (6.79:1) and as text on white, sunk and soft surfaces. The dark theme
has to split it, because saturated short-wavelength blue focuses poorly on a dark
ground. Its text blue is lifted and calmed to `#93B8FB`; its fill stays dark
enough to hold a white label at 5.56:1.

**Blue appears on:** primary buttons, links, the selected state, the focus ring,
meters, switches when on, the unread dot and count, the verified tick, the next
step in the levels dialog, and the pass. **It does not appear on:** icons beside
a fact, status words, deadlines, table headings, figures, or any background
larger than a selected row, apart from the pass.

**Orange is a mark, not a colour.** It belongs to the person, as it always has:
the level, a verified result, an acceptance, the XP star, a finished level. But
it now only ever draws a small icon or dot. It has no text token, never fills a
button, and never tints a surface. The logo's heart is the only other orange on
most screens, so the two read together.

**The metals** (`gold`, `silver`, `bronze`) mark the top three on the leaderboard
and nothing else: a 2px avatar ring, a 2px rule on a flat `surface-sunk` step,
the crown, and the rank numeral in the metal's `*-ink`.

**The one red**, `danger`, marks an action that leaves or destroys: the sign-out
button. It never states an error. Errors stay on `surface-sunk` in `ink`, with an
icon and a heavier weight.

**The logo keeps the kit's own values.** `logo-blue`, `logo-orange` and
`logo-word` follow `../v-web/docs/brand/BRAND_ASSETS.md` and never follow the
interface blue. On the pass the logo is the kit's white wordmark or white glyph
with the orange heart.

## Type

**Inter, and only Inter.** It is one of very few families that draws the Uzbek
letter `ʻ` (U+02BB), spaces it properly, covers Cyrillic and has real tabular
figures; the tests behind that are in the research note. It is loaded with its
optical-size axis, so headings get the tighter display cut automatically.

| Role        | Size                   | Weight | Tracking | Where                                  |
| ----------- | ---------------------- | ------ | -------- | -------------------------------------- |
| Greeting    | 28 → 32px              | 600    | −0.02em  | The dashboard's `h1`                   |
| Page title  | 24 → 28px              | 600    | −0.02em  | `PageHeader`'s `h1`                    |
| Panel title | 16px                   | 600    | −0.01em  | `h2`                                   |
| Figure      | 24 to 28px (`.figure`) | 500    | −0.02em  | Hours, XP, rank, day of the month      |
| Label       | 14px                   | 500    | normal   | Nav, buttons, row titles, field labels |
| Body        | 14px                   | 400    | normal   | Almost everything else                 |
| Small       | 12px                   | 400    | normal   | Chips, table headings, field help      |

Three weights only: 400, 500 and 600. Nothing is bold. **Nothing is ever in
capitals, and no letters are spread apart.** Capitals read badly in Uzbek and
Russian, and a tracked eyebrow above every heading is decoration. Text fields use
16px on a phone so iOS does not zoom, and 14px from the small breakpoint.

Numbers that line up use `.tabular`; a figure uses `.figure`, which includes it.

## Corners

| Radius | Value | Use                                                       |
| ------ | ----- | --------------------------------------------------------- |
| `sm`   | 4px   | Chips, thumbnails' tags, a row inside a menu              |
| `md`   | 6px   | Buttons, fields, nav items, selected states, icon buttons |
| `lg`   | 8px   | Panels, cards, popovers, menus                            |
| `xl`   | 12px  | Dialogs                                                   |
| `full` | —     | Avatars, dots, count badges, switches, and nothing else   |

The scale stops at 12px. A button is never a pill. Nested corners stay concentric:
the inner radius is the outer radius minus the gap, so a 4px row sits 4px inside
an 8px menu.

## Spacing

Everything sits on a 4px grid: 2 for tight internals, then 4, 8, 12, 16, 20, 24,
32, 40.

| Where                   | Value                                 |
| ----------------------- | ------------------------------------- |
| Page gutter             | 16px phone, 24px tablet, 40px desktop |
| Page top (`--page-top`) | 24px phone, 40px desktop              |
| Between panels          | 24px                                  |
| Panel padding           | 16px vertical, 20px horizontal        |
| Between rows in a panel | A hairline, 12px above and below      |
| Between grid cards      | 16px                                  |
| Label to field          | 6px                                   |
| Field to field          | 16px                                  |

**Control height is a variable, not a class.** `--control` and `--control-sm` are
44px on a touch screen, and 40px and 36px under a fine pointer from the large
breakpoint. A phone never loses its thumb-sized targets, and a desktop never
pays for them. Use `min-h-(--control)`, not a fixed height.

## Layout

| Region    | Desktop (≥ 64rem)                                                                                                                    | Phone                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Sidebar   | Sticky, full height, white with a right hairline: lockup and bell, the five sections, then at the foot the identity row and settings | Absent                                                                             |
| Header    | Absent                                                                                                                               | Sticky, white, bottom hairline: lockup, bell, avatar (account menu)                |
| Workspace | White, up to 72rem wide, panels in a main column and a 22rem aside                                                                   | One column, the aside stacks after the main column                                 |
| Tab bar   | Absent                                                                                                                               | Fixed, 56px, five destinations; the active one is `primary` with no pill behind it |

**The dashboard** opens with no box at all: the greeting, the level as a small
orange mark and a word, "Next: …", a thin meter, the hours to go, and "View
levels". On the right the pass hangs from the very top of the workspace on its
strap. Below it one panel of three linked figures, then whatever only appears
while it has something to say (Next up, the profile reward), and "Recent
participation" as a table of event, date, result, hours and XP. On a phone the
pass shrinks to the corner and the figures stack.

**The opportunities page** is a title with an outline "Applications" link, one
toolbar row (search, the All / Volunteering / Competitions switcher, region,
"Saved only"), and a three-column grid of photo cards. Each section is headed by
plain text with no icon tile.

**The leaderboard** is the viewer's place as a single row, three flat podium steps,
and a ranked table from fourth place. Ranks are plain numerals, not discs.

**The profile** is one read-only sheet, at most 46rem wide. **Settings** opens on
the account summary with the sign-out button, then its panels in two columns from
the extra-large breakpoint. **Sign-in** is a 24rem column on the bare white page,
with no panel around it.

## Surfaces

- **Panel** — `surface`, `border`, 8px radius, no shadow. A header row with an `h2`
  and an optional text action, then content. Lists inside use `padding="none"` and
  rows with their own 20px padding, separated by hairlines. Never nest a box in a
  panel.
- **Volunteer pass** — the solid `action` card with a 0.75em radius, a 1.5em strap
  of the same blue, a neutral clip, a white photo disc, the name and the level. It
  is flat, with no gradient or shadow, and rests at 3°. Sized in `em` so one font
  size scales it per breakpoint. The wordmark appears only at full size, where it
  clears the kit's 120px minimum; smaller passes use the white glyph.
- **Opportunity card** — the photo at 2:1, or a flat `surface-sunk` ground with the
  type's glyph; the type as a 4px chip and the bookmark as a white square over it;
  title, organiser, date and place, the deadline in `ink`, and a plain `primary`
  text link along the bottom edge.
- **Podium** — avatar with a 2px metal ring, name, handle, XP; then a flat
  `surface-sunk` step with a 2px metal rule and the rank in `*-ink`. Three heights,
  so the silhouette reads before a number does.
- **Levels dialog** — one bordered list split by hairlines rather than a stack of
  boxes. The current row is `surface-sunk`. Reached steps are an orange hexagon
  outline, the next step blue, the rest neutral.
- **Failed read** — where a listing or a panel's rows would be: a neutral glyph with
  no disc, a title, one sentence, the retry button with its countdown, and the
  request reference. The rest of the page stays up around it.
- **Participation table** — a real table from a 44rem container, stacked rows below
  it, so neither the panel nor the page scrolls sideways.

## Controls

| Control        | Shape                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Primary button | `action` fill, white label, 6px radius, no arrow, no scale on press. One per view where possible                                      |
| Outline button | `border` hairline, `ink` label; its hover is `surface-sunk`                                                                           |
| Danger outline | `border` hairline, `danger-ink` label; its hover is `danger-muted`                                                                    |
| Text link      | `primary`, weight 500, underlined on hover, no trailing arrow                                                                         |
| Field          | `field` ground, `border-control` edge, 6px radius; a focused field draws a 2px `primary` outline with no offset                       |
| Switch         | 36 × 20px. Off is an outlined track with a grey knob, on is an `action` track with a white knob. The button around it stays 44px tall |
| Segmented      | Links at 6px radius; the active one is `surface-soft` with `primary` text                                                             |
| Type switcher  | The same, with no box around the group                                                                                                |
| Save           | A square white button over the card's photo: an outline bookmark in `ink-muted`, or a filled one in `primary` once saved              |
| Focus          | A 2px `primary` outline at 2px offset, everywhere, in both themes. Nothing removes it                                                 |

Icons are Lucide at a 1.75 stroke, set once in the base layer. They are neutral
unless the icon itself is the signal.

## Motion

Almost none. Entry animations on page furniture were removed: pages simply appear.
What is left is one authored moment and a few answers to the volunteer's own
actions:

- The pass settles once on the dashboard with a short swing, which reduced motion
  removes.
- The welcome flow's pass prints a line per saved step and takes the seal at the
  end; each step panel slides in the direction the volunteer moved.
- The profile sheet's name, figures and rows arrive once, and the photo travels
  between the sheet and the editor through a `<ViewTransition>`.

Hover is a colour change at 150ms and nothing moves. No JavaScript and print see the
full page.

## Do's and don'ts

- **Do** ask of any blue: can the volunteer act here, or are they here? If neither,
  it is neutral.
- **Do** carry a state with an icon and a word before a colour.
- **Do** keep orange to a small mark for something the person did.
- **Do** open every section with `PageHeader` and compose it from `Panel`s. The
  dashboard greeting and the profile's name are the two exceptions.
- **Do** keep a filter in the URL, so a screen can be shared and reloaded.
- **Don't** put a tile, disc or tint behind an icon. An icon stands on its own.
- **Don't** add a gradient, wash, shadow on a panel, or blur.
- **Don't** set anything in capitals, spread its letters, or use a second typeface.
- **Don't** append an arrow to a link or button to make it look clickable.
- **Don't** put a literal hex value in a component, or reach for `danger` for anything
  but an action that leaves or destroys.
- **Don't** add a hover-only affordance; the audience is on a phone.
- **Don't** let a failed read blank a page: settle the read and draw the failed panel
  in its place.
- **Don't** use a metal for anything but a podium place.
