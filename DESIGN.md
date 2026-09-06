---
name: Volontyorlar App
description: The marketing site's tokens and type, applied to a product panel — a sidebar and top bar, white panels on warm ivory, ink for weight, one muted blue for what is selected, achieved, or the next thing to do, and the same panel after dark.
colors:
  paper: "#FAF9F5"
  surface: "#FFFFFF"
  surface-raised: "#FFFFFF"
  surface-sunk: "#F0EEE6"
  surface-soft: "#E9EEF2"
  ink: "#141413"
  ink-muted: "#5E5D59"
  ink-inverse: "#FAF9F5"
  border: "#E6E4DA"
  border-control: "#87867F"
  knockout: "#FAF9F5"
  brand: "#007FC2"
  primary: "#3B82B8"
  primary-ink: "#23608C"
  primary-deep: "#194A70"
  primary-muted: "#C5D8E8"
  action: "#141413"
  action-hover: "#30302E"
  band: "#141413"
  band-copy: "#B0AEA5"
  accent: "#2A6A9C"
  accent-ink: "#23608C"
  accent-soft: "#DDE8F1"
typography:
  page:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 1.5rem + 1.6vw, 2.75rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.03em"
  panel-title:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  title:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  full: "9999px"
spacing:
  sidebar: "16rem"
  aside: "22rem"
  gutter-mobile: "16px"
  gutter-wide: "32px"
  panel-gap: "24px"
  workspace: "80rem"
components:
  panel:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.xl}"
    padding: "16px 20px"
  stat-tile:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.xl}"
    padding: "16px 20px"
  sidebar:
    backgroundColor: "{colors.paper}"
    borderColor: "{colors.border}"
    width: "{spacing.sidebar}"
  workspace:
    backgroundColor: "{colors.surface-sunk}"
  switch-on:
    backgroundColor: "{colors.accent}"
    borderColor: "{colors.accent}"
    rounded: "{rounded.full}"
    size: "48px × 28px"
  switch-off:
    backgroundColor: "{colors.surface-sunk}"
    borderColor: "{colors.border-control}"
    rounded: "{rounded.full}"
    size: "48px × 28px"
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.ink-inverse}"
    rounded: "{rounded.full}"
    height: "52px"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.knockout}"
    rounded: "{rounded.full}"
    height: "52px"
  control:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border-control}"
    rounded: "{rounded.md}"
    height: "48px"
  state-chip:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  state-chip-achievement:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.knockout}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Design System: Volontyorlar App

## Overview

**Creative North Star: "The same ink, a different room"**

The marketing site is a notice set in ink on ivory paper. The application is
the room where a volunteer does their own work, and it is laid out like one:
a sidebar that names the sections, a top bar with notifications and account
controls, and a warm workspace carrying white panels of content. It shares
every token, both typefaces, the one blue and its rules, the theme and the
motion system with `../v-web/DESIGN.md`, and nothing else about its layout. A
volunteer coming from the marketing site should recognise the ink; a volunteer
coming from any other product should recognise a panel.

The register is the one claude.ai uses for its own product — ivory ground,
white panels with a warm hairline, near-black type, one accent hue — with blue
in the place of its terracotta. Ink carries weight: the primary button is
near-black in the light theme and ivory in the dark. Blue does the accent's
jobs: the selected section, the chip for a state the system owns, the pill
for a thing the volunteer achieved, the one apply or sign-in action on a
screen.

The sign-in pages sit directly on the paper, with the panel as a white card;
they are the doorway between the two products.

**Key characteristics**

- A 16rem sidebar on paper and a 56px top bar on desktop; a top bar and a
  four-tab bar on a phone. The workspace is `surface-sunk`, the panels are
  `surface`, and the ground is flat — no grid, no wash.
- Panels, stat tiles and cards with a `border` hairline and a 24px radius.
  Content inside a panel is ruled rows, never nested boxes.
- A serif page title at 36 to 44px, sans panel titles at 16px, and serif
  figures in stat tiles.
- Switches, segmented filters, selects and a search field that all clear 44px
  and take the global focus ring.
- One blue. A tinted pill means a state the institution owns or a thing that
  is selected; a filled pill means the person achieved it; a filled button
  means the one thing to do next.
- Chips that carry an icon and a word; a dashed chip for anything that is a
  sample, a preview, or not connected yet.

## Layout

| Region    | Desktop (≥ 64rem)                                                                                                                | Phone                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Sidebar   | Sticky, full height, `paper`, right hairline: lockup, main sections, account routes, the user card with level and sign out       | Absent                                                                    |
| Top bar   | Sticky, `paper` at 95% with a blur, bottom hairline: notifications, language, theme, account menu                                | Same controls plus the brand mark                                         |
| Workspace | `surface-sunk`, up to 80rem wide, 32px gutters, panels in a main column and a 22rem aside                                        | 16px gutters, one column, the aside stacks after the main column          |
| Tab bar   | Absent                                                                                                                           | Fixed, 56px, `paper`, four thumbs: dashboard, opportunities, applications, profile |

The dashboard is the decision screen: a progress orbit, three stat tiles, then
three panels for the next commitment, applications, and progress. Every other
section opens with the same `PageHeader` and composes the
same `Panel`, so the panel reads as one product rather than seven pages.

## Two faces in the product

`h1` takes the serif from the base layer at page-title size, with the calm
leading and light tracking the marketing site moved to. Panel titles are `h2`
and opt into `font-sans` at 16px semibold, because a panel title is a label,
not a headline. Figures in stat tiles are serif at figure size with
`tabular-nums`, so a count reads as evidence. Nothing sets the serif bold; the
typography test refuses it.

## Where the blue appears

Ink carries the weight: the primary button (`action` with an `ink-inverse`
label — near-black in the light theme, ivory in the dark), the active
segmented filter, the "done" node on a timeline. There is one blue, and it
appears in three strengths that each mean one thing.

**A tint (`accent-soft` with `primary-ink`)** marks what is selected or what
the institution owns: the sidebar's active section, the active language, the
"open", "under review" and "awaiting confirmation" chips, the info status, the
saved bookmark, the avatar, the date tile in "next up", the linked-identity
icons.

**A fill (`accent` with `knockout`)** marks what the person achieved or the
one thing to do next: the "accepted" chip and the "attended" outcome, the
reached nodes on the level rail, the decision node on an accepted
application's timeline, a switch that is on, the notification badge, the
progress meters, and the one filled action on a screen — "Continue with
Telegram", "Apply", "Submit application".

**Text (`primary-ink` / `accent-ink`, one value)** marks the person's own
figures and links: the level in the sidebar user card, the dashboard tile and
the record, events completed, hours and reliability, a complete profile, panel
action links, the tab bar's active tab.

**Graphics (`primary`)** are the small marks: the verified tick, the orbit's
nodes, the requirement bullets, the eyebrow rule, the current node's ring on a
timeline. `brand` is the mark and nothing else.

| Surface                                                               | Treatment                              |
| --------------------------------------------------------------------- | -------------------------------------- |
| The level in the sidebar user card, the dashboard tile and the record | `text-accent-ink`                      |
| Events completed, hours, reliability on the record                    | `text-accent-ink` at figure size       |
| Reached nodes and labels on the level rail                            | `bg-accent` / `text-accent-ink`        |
| The "accepted" chip and the "attended" outcome                        | `bg-accent text-knockout`              |
| The decision node on an accepted application's timeline               | `bg-accent text-knockout`              |
| Any other done node on a timeline                                     | `bg-ink text-ink-inverse`              |
| A complete profile, and a "saved" status                              | `text-accent-ink`                      |
| A chip for a state the system owns                                    | `bg-accent-soft text-primary-ink`      |
| The one apply, submit or sign-in action on a screen                   | `buttonClass({ variant: "accent" })`   |

Nothing on a screen is filled blue twice for the same reason. The palette
still defines no red; a validation or destructive colour is a decision for the
implementation plan. The "delete account" button is an outline button that is
disabled, not a red one.

## Surfaces

- **Panel** — `surface`, `border`, 24px radius, a header row with an `h2` and
  an optional action link, then content. Lists inside use `padding="none"` and
  rows separated by hairlines with their own 20px padding.
- **Stat tile** — the same box carrying one label, one figure and one note.
- **Card** — the opportunity card in a grid: chips, title, organiser, meta,
  then save and view actions along the bottom edge.
- **Rows** — hairline-separated, the first flush to the panel edge; the same
  row shape on the dashboard, in the applications list and in "closing soon".
- **Table** — the participation history only, scrolling inside its panel below
  40rem so the page never scrolls sideways.
- **Menus** — `surface-raised`, 24px radius, a hairline and the one whisper of
  shadow in the system, because they float.

The dashboard hero is a flat `surface` panel with a hairline; the orbit inside
it draws its rings from `primary-muted` and its core from `accent-soft`, and
casts no glow. The sign-in panel (`AuthPanel`, 24px radius on the paper) is the
one surface that is not a `Panel`.

## Controls

| Control          | Shape                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Switch           | 48 × 28px track, `accent` when on, `surface-sunk` with a `border-control` edge when off, a knockout knob; the button around it is 44px tall; `role="switch"` with `aria-checked` |
| Segmented filter | Pills; the active one is `action` with an `ink-inverse` label and count                                                                                                        |
| Select           | The 48px control with a chevron and a 12px radius; filters use a 44px variant                                                                                                  |
| Search           | A 44px control on the opportunities page; it submits as a plain GET so the URL carries the query                                                                               |
| Save             | A pill toggle with `aria-pressed`; `accent-soft` with a filled bookmark when saved                                                                                              |
| Disabled action  | The real button, `disabled`, with a `PreviewNote` beside it saying what will make it work                                                                                      |

## Motion

The page header and stat tiles use the `enter-*` keyframes because they are
above the fold. Panels are always visible and never depend on JavaScript to
enter the page. The dashboard orbit is the one authored loop: it pauses when
offscreen or hidden, while reduced motion and missing WebGL keep a static orbit.
Menus open and close without transition. No JavaScript and print see the full
page.

## Do's and don'ts

- **Do** open every section with `PageHeader` and compose it from `Panel`s.
- **Do** carry a state with an icon and a word before a colour.
- **Do** keep the blue fill for what the person achieved and the one next
  action; a deadline is urgent, not an achievement, and stays a tinted chip
  with words.
- **Do** put a label on a fill with the fill's own pair: `ink-inverse` on
  `action` and `ink`, `knockout` on `accent`.
- **Do** label anything that is sample, preview, or not connected, in words,
  and disable an action that cannot happen yet.
- **Do** keep a filter in the URL, so a screen can be shared and reloaded.
- **Don't** nest a box inside a panel; rows and hairlines carry structure.
- **Don't** paint a grid, a wash or a gradient anywhere; the ground is flat.
- **Don't** put a literal hex value in a component, reach for a red, or add a
  second hue.
- **Don't** add a hover-only affordance; the audience is on a phone.
