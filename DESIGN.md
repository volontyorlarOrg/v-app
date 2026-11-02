---
name: Volontyorlar App
description: White panels on a soft ground, a pale blue sidebar, one typeface, moderate corners, and one calm blue that keeps the logo's family — with orange for what the volunteer did, and the volunteer's pass as the single large field of blue.
colors:
  paper: "#F5F7FA"
  surface: "#FFFFFF"
  surface-sunk: "#F1F4F8"
  surface-soft: "#E6F2FE"
  surface-raised: "#FFFFFF"
  field: "#FFFFFF"
  ink: "#222B33"
  ink-muted: "#566270"
  border: "#E2E7ED"
  border-control: "#85909A"
  knockout: "#FFFFFF"
  sidebar: "#E9F1F9"
  sidebar-line: "#D8E3EE"
  sidebar-hover: "#DDE8F3"
  sidebar-active: "#FFFFFF"
  primary: "#0F66AC"
  action: "#0F66AC"
  action-hover: "#005494"
  accent: "#E85D30"
  accent-ink: "#B34917"
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
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "18px"
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
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.ink-muted}"
    borderColor: "{colors.sidebar-line}"
    width: "{spacing.sidebar}"
  sidebar-active:
    backgroundColor: "{colors.sidebar-active}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    height: "36px, 44px on touch"
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.knockout}"
    rounded: "{rounded.md}"
    height: "40px, 44px on touch"
  button-outline:
    backgroundColor: "{colors.surface}"
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
  chip-structure:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  chip-achievement:
    backgroundColor: "accent at 10%"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  chip-neutral:
    backgroundColor: "{colors.surface-sunk}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  volunteer-pass:
    backgroundColor: "{colors.action}, with a gentle gradient"
    textColor: "{colors.knockout}"
    rounded: "1.25em"
---

# Design System: Volontyorlar App

## Overview

**Creative North Star: "One blue, soft edges"**

The application is a set of white panels on a pale ground, beside a pale blue sidebar.
Hairlines carry the structure, one typeface carries the text, and one calm blue carries
the action. Soft tints of that blue and of the volunteer's orange add warmth in small
areas, so a screen stays quiet without feeling empty.

It is meant to feel like the product people already know, tidied up. The blue stays in
the logo's family, the ink is the same ink, orange still marks what the person did, and
corners are still gentle, because an abrupt jump in colour and edges reads as a different
product.

The volunteer's pass on the
dashboard is a blue card hanging on a strap from the top of the page: the only large
area of blue in the product, belonging to the only thing here that is truly the
volunteer's own.

**Key characteristics**

- A pale blue 16rem sidebar with a hairline edge, five sections at the top, the identity
  row (the profile's link) above settings at the foot, and no top bar on desktop. On
  a phone a 56px header and a five-tab bar. Nothing in the sidebar collapses.
- A pale `paper` ground, up to 72rem wide, carrying white panels with a hairline edge,
  a 14px radius and the faintest shadow.
- No radial washes, glows, dot grids or blurs. The stylesheet's only gradient is the
  gentle one on the pass, and a test holds it to that.
- Selected is `primary` text on a lighter ground: white in the sidebar, `surface-soft` in
  the type switcher, segmented filters, pagination and language choices.
- Chips and icon tiles are small soft tints: pale blue for a system state, pale orange
  for something the person did, grey for the rest.
- The dark theme keeps a slight blue cast with panels a step above the floor, but it is
  far less saturated than the old navy room.

Why these values and not others is in
[`docs/ui/MINIMAL_BLUE_RESEARCH.md`](docs/ui/MINIMAL_BLUE_RESEARCH.md).

## Colour

Everything below is computed in OKLCH and pinned by
`src/app/design-tokens.test.ts`.

| Token            | Light     | Dark      | Use                                                                                   |
| ---------------- | --------- | --------- | ------------------------------------------------------------------------------------- |
| `paper`          | `#F5F7FA` | `#0B1015` | The ground behind everything                                                          |
| `surface`        | `#FFFFFF` | `#13191F` | Panels, the phone header and tab bar                                                  |
| `surface-sunk`   | `#F1F4F8` | `#1D252D` | Hover, neutral chip, thumbnail ground                                                 |
| `surface-soft`   | `#E6F2FE` | `#1C2D3F` | The selected state, system chips, icon tiles, the viewer's own row                    |
| `surface-raised` | `#FFFFFF` | `#1D252D` | Popovers, menus, dialogs                                                              |
| `field`          | `#FFFFFF` | `#0F1318` | Inside a text field                                                                   |
| `ink`            | `#222B33` | `#E4E8ED` | Text                                                                                  |
| `ink-muted`      | `#566270` | `#A6AFB9` | Secondary text and neutral icons                                                      |
| `border`         | `#E2E7ED` | `#272F37` | Hairlines, panel edges, secondary button edges, meter track                           |
| `border-control` | `#85909A` | `#69737D` | A field's edge, 3:1 against the panel                                                 |
| `sidebar`        | `#E9F1F9` | `#15222E` | The sidebar's ground; `sidebar-line`, `sidebar-hover` and `sidebar-active` go with it |
| `primary`        | `#0F66AC` | `#83BDF8` | Links, selected text, focus ring, icons beside a fact                                 |
| `action`         | `#0F66AC` | `#196CB3` | Solid fills behind a white label, meters, the pass                                    |
| `action-hover`   | `#005494` | `#2575BD` | The hover of a solid fill                                                             |
| `accent`         | `#E85D30` | `#E85D30` | Orange icons and marks for what the person did                                        |
| `accent-ink`     | `#B34917` | `#F5A278` | Orange text: XP, verified, accepted, the level                                        |

In the light theme one value does every job: `#0F66AC` passes AA both behind white text
(5.97:1) and as text on the sunk and soft surfaces (5.41:1 and 5.26:1). The dark theme has
to split it, because saturated short-wavelength blue focuses poorly on a dark ground. Its
text blue is lifted and calmed to `#83BDF8`, and its fill stays dark
enough to hold a white label.

**Blue appears on:** primary buttons, links, the selected state, the focus ring, meters,
switches when on, system-state chips, icon tiles, icons beside a fact, open deadlines, the
unread dot and count, the verified tick, the next step in the levels dialog, and the pass.
**It does not appear on:** table headings, figures, or any solid background larger than a
button, apart from the pass.

**Orange is the person's.** It marks the level, a verified result, an acceptance, XP, a
finished level, a saved opportunity and the ring around the volunteer's own photo. Icons
use `accent`, text uses `accent-ink`, and chips and tiles use a pale 10% tint. It never
fills a button or a large surface.

**The metals** (`gold`, `silver`, `bronze`) mark the top three on the leaderboard and
nothing else: a 2px avatar ring, a 2px rule on a `surface-sunk` step, the crown, and
the rank numeral in the metal's `*-ink`.

**The one red**, `danger`, marks an action that leaves or destroys: the sign-out
button. It never states an error. Errors stay on `surface-sunk` in `ink`, with an icon
and a heavier weight.

**The logo keeps the kit's own values.** `logo-blue`, `logo-orange` and `logo-word`
follow `../v-web/docs/brand/BRAND_ASSETS.md` and never follow the interface blue. On
the pass the logo is the kit's white wordmark or white glyph with the orange heart.

## Type

**Inter, and only Inter.** It is one of very few families that draws the Uzbek letter
`ʻ` (U+02BB), spaces it properly, covers Cyrillic and has real tabular figures; the
tests behind that are in the research note. It is loaded with its optical-size axis,
so headings get the tighter display cut automatically.

| Role        | Size                   | Weight | Tracking | Where                                  |
| ----------- | ---------------------- | ------ | -------- | -------------------------------------- |
| Greeting    | 28 → 32px              | 600    | −0.02em  | The dashboard's `h1`                   |
| Page title  | 24 → 28px              | 600    | −0.02em  | `PageHeader`'s `h1`                    |
| Panel title | 16px                   | 600    | −0.01em  | `h2`                                   |
| Figure      | 24 to 28px (`.figure`) | 500    | −0.02em  | Hours, XP, rank, day of the month      |
| Label       | 14px                   | 500    | normal   | Nav, buttons, row titles, field labels |
| Body        | 14px                   | 400    | normal   | Almost everything else                 |
| Small       | 12px                   | 400    | normal   | Chips, table headings, field help      |

Three weights only: 400, 500 and 600. Nothing is bold. **Nothing is ever in capitals,
and no letters are spread apart.** Capitals read badly in Uzbek and Russian. Text
fields use 16px on a phone so iOS does not zoom, and 14px from the small breakpoint.

Numbers that line up use `.tabular`; a figure uses `.figure`, which includes it.

## Corners

| Radius | Value | Use                                                                  |
| ------ | ----- | -------------------------------------------------------------------- |
| `sm`   | 6px   | Chips, tags over photos                                              |
| `md`   | 10px  | Buttons, fields, nav items, selected states, icon buttons, menu rows |
| `lg`   | 14px  | Panels, cards, popovers, menus                                       |
| `xl`   | 18px  | Dialogs, the sign-in panel                                           |
| `full` | —     | Avatars, dots, count badges, switches, and nothing else              |

The scale stops at 18px, and a button is not a pill. Nested corners stay concentric:
the inner radius is the outer radius minus the gap, so a 10px row sits 4px inside a
14px menu.

## Spacing

Everything sits on a 4px grid: 2 for tight internals, then 4, 8, 12, 16, 20, 24, 32, 40.

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

**Control height is a variable, not a class.** `--control` and `--control-sm` are 44px
on a touch screen, and 40px and 36px under a fine pointer from the large breakpoint. A
phone never loses its thumb-sized targets, and a desktop never pays for them. Use
`min-h-(--control)`, not a fixed height.

## Layout

| Region    | Desktop (≥ 64rem)                                                                                                                        | Phone                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Sidebar   | Sticky, full height, pale blue with a right hairline: lockup and bell, the five sections, then at the foot the identity row and settings | Absent                                                                             |
| Header    | Absent                                                                                                                                   | Sticky, white, bottom hairline: lockup, bell, avatar (account menu)                |
| Workspace | `paper`, up to 72rem wide, panels in a main column and a 22rem aside                                                                     | One column, the aside stacks after the main column                                 |
| Tab bar   | Absent                                                                                                                                   | Fixed, 56px, five destinations; the active one is `primary` with no pill behind it |

**The dashboard** opens with no box at all: the greeting, the level as a pale orange chip, "Next: …", a thin meter, the hours to go, and "View levels". On the right the
pass hangs from the very top of the workspace on its strap. Below it one panel of three
linked figures, then whatever only appears while it has something to say (Next up, the
profile reward), and "Recent participation" as a table of event, date, result, hours
and XP. On a phone the pass shrinks to the corner and the figures stack.

**The opportunities page** is a title with an outline "Applications" link, one toolbar
row (search, the All / Volunteering / Competitions switcher, region, "Saved only"), and
a three-column grid of photo cards. Each section is headed by plain text.

**The leaderboard** is the viewer's place as a single row, three podium steps, and a
ranked table from fourth place. Ranks are plain numerals.

**The profile** is one read-only sheet, at most 46rem wide. **Settings** opens on the
account summary with the sign-out button, then its panels in two columns from the
extra-large breakpoint. **Sign-in** is a white 18px-radius panel, 24rem wide, on the
ground.

## Surfaces

- **Panel** — `surface`, `border`, 14px radius, the faint `shadow-panel`. A header row
  with an `h2` and an optional text action, then content. Lists inside use
  `padding="none"` and rows with their own 20px padding, separated by hairlines. Never
  nest a box in a panel.
- **Volunteer pass** — a blue card with a 1.25em radius, a gentle gradient from a
  slightly lighter to a slightly deeper `action`, and a soft shadow. A 1.75em strap, a
  neutral clip, a white photo disc, the name and the level, resting at 4°. Sized in
  `em` so one font size scales it per breakpoint. The wordmark appears only at full
  size, where it clears the kit's 120px minimum; smaller passes use the white glyph.
- **Opportunity card** — the photo at 2:1, or a flat `surface-soft` ground with the type's
  blue glyph; the type as a chip and the bookmark as a white square over it; title,
  organiser, date and place, the open deadline in `primary`, and a plain `primary` text link
  along the bottom edge.
- **Podium** — avatar with a 2px metal ring, name, handle, XP; then a `surface-sunk`
  step with soft top corners, a 2px metal rule and the rank in `*-ink`. Three heights,
  so the silhouette reads before a number does.
- **Levels dialog** — one bordered list split by hairlines rather than a stack of
  boxes. The current row is `surface-sunk`. Reached steps are an orange hexagon outline,
  the next step blue, the rest neutral.
- **Failed read** — where a listing or a panel's rows would be: a neutral glyph, a title,
  one sentence, the retry button with its countdown, and the request reference. The rest
  of the page stays up around it.
- **Participation table** — a real table from a 44rem container, stacked rows below it,
  so neither the panel nor the page scrolls sideways.

## Controls

| Control        | Shape                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Primary button | `action` fill, white label, 10px radius, no arrow, no scale on press. One per view where possible                                     |
| Outline button | `surface` fill, `border` hairline, `ink` label; its hover is `surface-sunk`                                                           |
| Danger outline | `surface` fill, `border` hairline, `danger-ink` label; its hover is `danger-muted`                                                    |
| Text link      | `primary`, weight 500, underlined on hover, no trailing arrow                                                                         |
| Field          | `field` ground, `border-control` edge, 10px radius; a focused field draws a 2px `primary` outline with no offset                      |
| Switch         | 36 × 20px. Off is an outlined track with a grey knob, on is an `action` track with a white knob. The button around it stays 44px tall |
| Segmented      | Links at 10px radius; the active one is `surface-soft` with `primary` text                                                            |
| Type switcher  | The same, with no box around the group                                                                                                |
| Save           | A square white button over the card's photo: an outline bookmark in `ink-muted`, or a filled orange one once saved                    |
| Focus          | A 2px `primary` outline at 2px offset, everywhere, in both themes. Nothing removes it                                                 |

Icons are Lucide at a 1.75 stroke, set once in the base layer. They are neutral unless
the icon itself is the signal.

## Motion

Almost none. Entry animations on page furniture were removed: pages simply appear. What
is left is one authored moment and a few answers to the volunteer's own actions:

- The pass settles once on the dashboard with a short swing, which reduced motion
  removes.
- The welcome flow's pass prints a line per saved step and takes the seal at the end;
  each step panel slides in the direction the volunteer moved.
- The profile sheet's name, figures and rows arrive once, and the photo travels between
  the sheet and the editor through a `<ViewTransition>`.

Hover is a colour change at 150ms and nothing moves. No JavaScript and print see the full
page.

## Do's and don'ts

- **Do** keep solid blue for actions, and soft tints for everything else that is blue.
- **Do** carry a state with an icon and a word before a colour.
- **Do** keep orange for something the person did, in small areas.
- **Do** open every section with `PageHeader` and compose it from `Panel`s. The dashboard
  greeting and the profile's name are the two exceptions.
- **Do** keep a filter in the URL, so a screen can be shared and reloaded.
- **Do** compare a design change against the screen people know today. A big jump in
  colour or edges reads as a different product, even when each value is defensible.
- **Don't** spread icon tiles beyond figures and dates; most icons stand on their own.
- **Don't** add a radial wash or a blur, or a gradient anywhere but the pass.
- **Don't** set anything in capitals, spread its letters, or use a second typeface.
- **Don't** append an arrow to a link or button to make it look clickable.
- **Don't** put a literal hex value in a component, or reach for `danger` for anything but
  an action that leaves or destroys.
- **Don't** add a hover-only affordance; the audience is on a phone.
- **Don't** let a failed read blank a page: settle the read and draw the failed panel in
  its place.
- **Don't** use a metal for anything but a podium place.
