---
name: Volontyorlar App
description: The marketing site's tokens and type, applied to a product panel — a navy sidebar of flat links, three sections at the top and the account at the foot, panels raised off a flat workspace washed with the two hues, blue for the institution, orange for what the volunteer did, gold, silver and bronze for the top three alone, and a navy-tinted room after dark where every panel sits a step above the floor.
colors:
  paper: "#F5F8FB"
  surface: "#FFFFFF"
  surface-sunk: "#ECF1F5"
  surface-soft: "#E7F1F9"
  ink: "#222B33"
  ink-muted: "#566270"
  border: "#DBE3EA"
  border-control: "#85909A"
  primary: "#007FC2"
  primary-ink: "#005E92"
  primary-deep: "#004A73"
  primary-muted: "#BFDCEF"
  action: "#005E92"
  action-hover: "#004A73"
  band: "#005E92"
  band-copy: "#BFDCEF"
  accent: "#E85D30"
  accent-ink: "#B34917"
  knockout: "#FFFFFF"
  shell: "#0B2340"
  shell-raised: "#14345A"
  shell-line: "#1E3F66"
  shell-ink: "#F1F6FB"
  shell-muted: "#9DB4CC"
  shell-active: "#BFDCEF"
  shell-active-ink: "#004A73"
  surface-raised: "#FFFFFF"
  field: "#FFFFFF"
  gold: "#D4A53A"
  gold-ink: "#7A5A0E"
  silver: "#B5BFCA"
  silver-ink: "#5B6774"
  bronze: "#C58256"
  bronze-ink: "#7D4A24"
typography:
  page:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "1.875rem → 2.25rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  figure:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.035em"
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
    lineHeight: 1.32
    letterSpacing: "-0.015em"
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
    letterSpacing: "0.14em"
  small:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  lead:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.5vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.008em"
  profile-name:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 8cqi, 3.75rem)"
    fontWeight: 400
    lineHeight: 1.03
    letterSpacing: "-0.03em"
  profile-name-long:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "clamp(1.75rem, 6cqi, 2.75rem)"
    fontWeight: 400
    lineHeight: 1.03
    letterSpacing: "-0.03em"
  figure-inline:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  2xl: "28px"
  full: "9999px"
spacing:
  sidebar: "16.5rem"
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
    backgroundColor: "{colors.shell}"
    textColor: "{colors.shell-ink}"
    borderColor: "{colors.shell-line}"
    width: "{spacing.sidebar}"
  sidebar-active:
    backgroundColor: "{colors.shell-active}"
    textColor: "{colors.shell-active-ink}"
    rounded: "{rounded.md}"
    height: "44px"
  workspace:
    backgroundColor: "{colors.surface-sunk}"
  switch-on:
    backgroundColor: "{colors.action}"
    borderColor: "{colors.action}"
    rounded: "{rounded.full}"
    size: "48px × 28px"
  switch-off:
    backgroundColor: "{colors.surface-sunk}"
    borderColor: "{colors.border-control}"
    rounded: "{rounded.full}"
    size: "48px × 28px"
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.knockout}"
    rounded: "{rounded.full}"
    height: "52px"
  control:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border-control}"
    rounded: "{rounded.lg}"
    height: "48px"
  state-chip:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Design System: Volontyorlar App

## Overview

**Creative North Star: "The same ink, a different room"**

The marketing site is a civic notice pinned to a whiteboard. The application
is the room where a volunteer does their own work, and it is laid out like one:
a navy sidebar that names three sections — dashboard, opportunities,
leaderboard — at the top and the account — who you are, which opens the
profile, then settings and sign out — at the foot, and a flat workspace carrying panels of content, with
no top bar between them. Every entry in the sidebar is a plain link: nothing
in it expands, and the only tray is the notification bell beside the lockup.
What used to hide inside the user card now has a place — the card itself is
the link to the profile, settings is a link beneath it, the theme switch and
the interface language are a panel on `/settings`. Anything that belongs to a
section is a tab under that section's header, never a fourth sidebar entry. It shares every
token, both typefaces, the two brand colours and their rules, the theme and the
motion system with `../v-web/DESIGN.md`, and nothing else about its layout. The
institution's blue is used as a field on the left, not only as an accent; the
volunteer's own work stays orange on the right. A volunteer coming from the
marketing site should recognise the ink; a volunteer coming from any other
product should recognise a panel.

Only the sign-in pages keep the marketing site's dot-grid ground: they are the
doorway between the two. The welcome flow a new account meets on `/welcome`
stands on the same ground as the threshold: a greeting, a lanyard pass that
gains a part per saved step, and one step panel, ending by handing the
volunteer into the room.

**Key characteristics**

- A 16.5rem navy sidebar (`shell`) with three sections at the top, the
  identity card (the profile's link) above settings and sign out at the foot,
  and no top bar on desktop; a 56px header and a four-tab bar (dashboard,
  opportunities, leaderboard, profile) on a phone. Nothing in the sidebar collapses. The active section sits on
  `shell-active` in `shell-active-ink`, a pale pill by day and a deep blue one
  after dark. The workspace is `surface-sunk` under two faint radial washes
  (blue top-right, orange bottom-left), the panels are `surface`.
- The dark theme is an elevation model, not an inversion: the floor
  (`surface-sunk`) is the darkest navy, every panel (`surface`) sits a step
  above it with a one-pixel highlight along its top edge, popovers
  (`surface-raised`) a step above that, and fields (`field`) sink below the
  panel they sit in. Every neutral is tinted toward navy rather than grey, the
  washes are halved so orange never muddies to brown, and the accent text
  values are lifted so both hues keep their AA ratios.
- Underlined section tabs under a page header, with a count on each, where a
  section has more than one listing: All, Saved and Applications under
  Opportunities.
- Washes of the two hues where a surface is the volunteer's own: the dashboard
  hero, the leaderboard's standing card and the podium stage. A wash never carries text contrast; the tokens beneath do.
- Panels, stat tiles and cards with a `border` edge and a 20px radius. Content
  inside a panel is ruled rows, never nested boxes.
- A serif page title at 30 to 36px, sans panel titles at 16px, and serif
  figures in stat tiles.
- Switches, segmented filters, selects and a search field that all clear 44px
  and take the global focus ring.
- Orange for what the person did: the level, an acceptance, a confirmed
  attendance, the record's figures, a completed profile.
- Chips that carry an icon and a word; a dashed chip for anything that is a
  sample, a preview, or not connected yet.

## Layout

| Region    | Desktop (≥ 64rem)                                                                                                                                                                          | Phone                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Sidebar   | Sticky, full height, `shell` navy: lockup and the notification bell, the three sections, then at the foot the identity card as the profile's link, settings and sign out — all plain links | Absent                                                                                                                      |
| Header    | Absent                                                                                                                                                                                     | Sticky, `surface`, bottom hairline: lockup, bell, avatar (account menu: the name as the profile's link, settings, sign out) |
| Workspace | `surface-sunk`, up to 80rem wide, 32px gutters, panels in a main column and a 22rem aside                                                                                                  | 16px gutters, one column, the aside stacks after the main column                                                            |
| Tab bar   | Absent                                                                                                                                                                                     | Fixed, 56px, four thumbs: dashboard, opportunities, leaderboard, profile                                                    |

The dashboard is the decision screen and the record: a hero that greets the
volunteer beside their pass and carries their progress in a ruled band, four
stat tiles, then the next commitment and applications side by side from the
extra-large breakpoint, and the participation history across both columns.
The band has two cells built the same way — a title and its action, a rail,
a labelled meter, one sentence — the level rail and next-level meter leading
to the leaderboard, the profile's six fields and completeness leading to the
editor. The opportunities section holds three tabs — All, Saved and
Applications — under one header, and the applications tab keeps its pill
filter inside its panel. The leaderboard opens on the viewer's standing card,
the top three on a podium stage, and the ranked table from fourth place. The
profile is the volunteer's own page: one read-only profile sheet, the same
object the public page at `volontyorlar.uz/<username>` shows, with the
volunteer's public profile details as more rows of it. Another volunteer's
visible leaderboard identity opens that sheet inside the app at `/<username>`;
editing is its own page, `/profile/edit`, a page header over the editor in titled sections
with Save and Cancel, returning to the profile once saved. Settings opens on an
account summary and an anchor index to its panels. Every other
section opens with the same `PageHeader` and composes the
same `Panel`, so the panel reads as one product rather than seven pages.

## Two faces in the product

`h1` takes the serif from the base layer at page-title size. Panel titles are
`h2` and opt into `font-sans` at 16px semibold, because a panel title is a
label, not a headline. Figures in stat tiles are serif at figure size with
`tabular-nums`, so a count reads as evidence. Nothing sets the serif bold; the
typography test refuses it.

## Where the two hues appear

**Blue** carries the sidebar's active section, the tab bar's active tab, panel
actions, the primary and segmented buttons, the notification badge, switches
when on, the meters, the "open" and "under review" chips, and the dots for
things the institution did.

**Orange** appears where a person did something, and nowhere else:

| Surface                                                                   | Treatment                          |
| ------------------------------------------------------------------------- | ---------------------------------- |
| The level in the sidebar identity card, the dashboard tile and the record | `text-accent-ink`                  |
| Events completed, hours, reliability on the record                        | `text-accent-ink` at figure size   |
| Reached nodes and labels on the level rail                                | `bg-accent` / `text-accent-ink`    |
| The "accepted" chip and the "attended" outcome                            | `border-accent/50 text-accent-ink` |
| The decision node on an accepted application's timeline                   | `bg-accent`                        |
| A completed profile, and the preview "saved" status                       | `text-accent-ink`                  |
| Activity dots for a confirmation, an acceptance, a level                  | `bg-accent`                        |

**Gold, silver and bronze** appear in exactly one place: the top three on the
leaderboard. Each place owns a metal (`gold`, `silver`, `bronze`) for its
avatar ring, its podium step and the step's crown, and a metal ink
(`*-ink`) for the numeral badge and the viewer's own rank when it is a podium
one; the badge label is `medal-label`, white by day and the page ground after
dark. The metals never label a system state or a person's action elsewhere,
and the experience figures stay orange even on the podium.

Nothing orange sits on blue and nothing blue sits on orange. The level rail's
reached nodes are orange on a `border-control` hairline. The palette still
defines no red; a validation or destructive colour is a decision for the
implementation plan. The "delete account" button is an outline button that is
disabled, not a red one.

## Surfaces

- **Panel** — `surface`, `border`, 20px radius, a header row with an `h2` and
  an optional action link, then content. Lists inside use `padding="none"` and
  rows separated by hairlines with their own 20px padding. The `id` a panel is
  given is a real DOM id, so a panel can be an anchor target.
- **Profile sheet** — the profile only, and the public page draws the same
  sheet. One `surface` box at most 46rem wide, centred in the workspace, with
  no cover, no stat band and no second panel: the avatar in its orange ring
  with the one action beside it ("Complete profile" while fields are missing,
  "Edit profile" once none are), the name as the `h1` at `profile-name` size,
  the handle and the level pill, the bio as `lead` text, one line of inline
  figures (serif `figure-inline` numerals in `accent-ink`, the words in
  `ink-muted`), and then every detail the volunteer entered as a ruled row —
  a `small` label in a 7rem column (10rem from a 34rem sheet) and its value at
  body size. Empty details have no row; an empty bio, a record with nothing in
  it, and a complete profile draw nothing at all. While the profile is
  incomplete, the sheet's top edge is a 3px meter with one sentence beneath it:
  the percentage and what is still missing. The public page row carries the
  address, broken after the host on a narrow sheet, and a copy button whose
  glyph turns into a tick.
- **Podium** — the leaderboard's top three: each place is an avatar in its
  metal ring, the handle, the experience figure, and a podium step in that
  metal, the three steps at three heights so the silhouette reads before a
  number does. Second stands left, first centre under the crown, third right.
- **Failed read** — where a listing or a panel's rows would be: a soft disc
  with a cloud-off (unreachable) or a warning (the server answered with an
  error) glyph, a title, one sentence, the retry button and a live countdown
  beneath it, and the request reference in small tabular type. The rest of the
  page stays up around it.
- **Stat tile** — the same box carrying one label, one figure and one note.
- **Card** — the opportunity card in a grid: chips, title, organiser, meta,
  then save and view actions along the bottom edge.
- **Rows** — hairline-separated, the first flush to the panel edge; the same
  row shape on the dashboard, in the applications list and in "closing soon".
- **Table** — the participation history only, scrolling inside its panel below
  40rem so the page never scrolls sideways.

The sign-in panel (`AuthPanel`, 28px radius on the dot grid) and the welcome
flow's step panel, the same 28px surface holding one step at a time, are the
two surfaces that are not a `Panel`.

## Controls

| Control          | Shape                                                                                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Switch           | 48 × 28px track, `action` when on, `surface-sunk` with a `border-control` edge when off, a white knob; the button around it is 44px tall; `role="switch"` with `aria-checked` |
| Segmented filter | Pills; the active one is `action` with a knockout label and a `band-copy` count                                                                                               |
| Select           | The 48px control with a chevron; filters use a 44px variant                                                                                                                   |
| Search           | A 44px control on the opportunities page; it submits as a plain GET so the URL carries the query                                                                              |
| Save             | A pill toggle with `aria-pressed`; filled bookmark when saved                                                                                                                 |
| Disabled action  | The real button, `disabled`, with a `PreviewNote` beside it saying what will make it work                                                                                     |

## Motion

The page header and stat tiles use the `enter-*` keyframes because they are
above the fold. Panels are always visible and never depend on JavaScript to
enter the page. The welcome pass is the one authored loop: it
pauses when offscreen or hidden, reads its colours from the tokens, and keeps a
static composition under reduced motion or without WebGL. On the dashboard the
same badge is drawn in SVG, hangs from the hero's top edge, shows the parts the
profile has filled, and settles once on arrival with a short swing that
reduced motion removes. The pass is
the flow's one authored moment: a saved step prints a line on the badge and
nudges it on its lanyard, the last screen stamps it with the orange seal, and
each step panel slides in the direction the volunteer moved. Menus open and
close without transition. No JavaScript and print see the full page.

The profile sheet has one entrance, played once on arrival and complete at
rest: the avatar's orange ring settles outward, the name rises out of its mask
word by word, the handle, bio and figures follow, and each ruled row draws its
hairline in from the left a beat after the one above. The figures roll like an
odometer: every digit is its real value in the flow of the text, with a strip
of the ten digits laid over it that runs from 0 to that value and then gives
way to it, so the number is correct before, during and after the roll, and
nothing but CSS runs. Screen readers get the number once, from a visually
hidden copy. "Edit profile" carries the photo into the editor, and "Back to
profile" and Cancel carry it back: the two avatars share a `<ViewTransition>`
name, so the circle glides between the sheet and the editor over 460ms instead
of one disappearing and another appearing. The pair forms only when the new
page commits in the same frame, which is why those links are prefetched, and
only while the photo is on screen — React leaves out a shared element that has
scrolled away, so Cancel at the foot of a long form cross-fades the page
instead. Reduced motion and print drop all of it, including the view
transition.

## Do's and don'ts

- **Do** open every section with `PageHeader` and compose it from `Panel`s. The
  profile is the one exception: the volunteer's own name is the `h1`, carried
  by the profile sheet, because the page is a person rather than a section.
- **Do** carry a state with an icon and a word before a colour.
- **Do** keep orange for a person's own action; a deadline is urgent, not an
  achievement, and stays blue or neutral.
- **Do** label anything that is sample, preview, or not connected, in words,
  and disable an action that cannot happen yet.
- **Do** keep a filter in the URL, so a screen can be shared and reloaded.
- **Don't** nest a box inside a panel; rows and hairlines carry structure.
- **Don't** bring the dot grid into the workspace; it belongs to the doorway
  and the welcome flow.
- **Don't** put a literal hex value in a component, or reach for a red.
- **Don't** add a hover-only affordance; the audience is on a phone.
- **Don't** let a failed read blank a page: settle the read and draw the failed
  panel in its place, with the retry inside it.
- **Don't** use a metal for anything but a podium place.
