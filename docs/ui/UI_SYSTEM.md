# Applied UI System

The token values, typography scale, and named rules live in
[`../../DESIGN.md`](../../DESIGN.md) and, for everything it inherits, in
`../v-web/DESIGN.md`. This page records how they are applied in code, plus the
localization and accessibility behaviour that goes with them.

## Where tokens live

`src/app/globals.css` declares every semantic token in a Tailwind 4 `@theme`
block, copied from the marketing site. The dark theme is the same token names
with different values under `:root[data-theme="dark"]`.
`src/app/design-tokens.test.ts` asserts the whole contrast contract in both
themes, and `src/app/typography.test.ts` refuses a bold display face and a
literal hex anywhere under `src/`.

Product additions: `--text-figure` for stat tiles, `.meter` / `.meter-fill`
for progress bars, `.tab-bar` for the safe-area inset. The workspace's flat
ground is `bg-surface-sunk` on the shell's column, which covers the `body`
dot grid; the sign-in pages have no such wrapper and keep the grid.

## Composition primitives

| Component                                                                                    | Role                                                                                                                                                  |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppShell`                                                                                   | Skip link, sidebar, minimal top bar, workspace, footer, and tab bar                                                                                   |
| `Sidebar` / `SidebarNav`                                                                     | The desktop navigation: lockup, main sections, account routes, the user card with level, sign out                                                     |
| `TopBar`                                                                                     | `NotificationsMenu`, language, theme, `UserMenu`; the brand mark below the large breakpoint                                                           |
| `TabBar`                                                                                     | Fixed four-tab bar below the large breakpoint with icons from `route-icons.ts`                                                                        |
| `Panel`                                                                                      | The unit of every screen: bordered surface, optional titled header with an action link, `padding="none"` for lists                                    |
| `StatTiles`                                                                                  | A row of figures: label, serif figure, note; orange when the figure is the person's                                                                   |
| `PageHeader`                                                                                 | Eyebrow and sample chip, serif `h1`, description, actions on the right                                                                                |
| `Segmented`                                                                                  | Pill links for a status group filter, with counts and `aria-current`                                                                                  |
| `StateChip`                                                                                  | Icon-plus-word pill in `neutral`, `structure` or `achievement`; `ApplicationStatusChip`, `OpportunityStatusChip` and the history outcomes build on it |
| `StatusChip`                                                                                 | Dashed pill for sample, preview and not-connected material                                                                                            |
| `PreviewNote`                                                                                | The dashed chip plus a sentence, beside every control that cannot write yet                                                                           |
| `Switch`                                                                                     | A `role="switch"` toggle, uncontrolled or controlled, with an optional hidden form value                                                              |
| `ThemeSwitch`                                                                                | The switch bound to the real theme, for settings                                                                                                      |
| `Field` / `Input` / `Textarea` / `Select`                                                    | Labelled controls at 48px with optional help and a trailing link                                                                                      |
| `NextUp`, `ApplicationRows`, `OpportunityRows`, `ActivityFeed`                               | Ruled row lists for panels                                                                                                                            |
| `RecordProgress`                                                                             | The level rail and the next-level meter                                                                                                               |
| `ProfileMeter`                                                                               | The completeness bar with the missing fields                                                                                                          |
| `OpportunityFilters`, `OpportunityCard`, `OpportunityFacts`, `SaveButton`                    | The opportunities section                                                                                                                             |
| `ApplicationTimeline`                                                                        | Submitted, under review, decision, with dates                                                                                                         |
| `HistoryTable`                                                                               | The participation history, scrolling inside its panel on a phone                                                                                      |
| `ProfileForm`, `PreferenceSwitches`, `IdentityList`                                          | The profile editor and the settings groups                                                                                                            |
| `AuthIntro` / `PreviewNotice` / `AuthPanel` / `AuthDivider` / `ProviderButtons` / `AuthForm` | The sign-in surfaces                                                                                                                                  |
| `ImpactOrbit`                                                                                | Lazy Three.js progress object with a static no-WebGL and reduced-motion fallback                                                                      |
| `buttonClass`, `Scene`, `SplitWords`, `ThemeToggle`, `LocaleSwitcher`                        | Shared interaction and entrance utilities                                                                                                             |

## Localization behaviour

- Three locales, `uz` (default), `ru`, `en`, one per URL, prefix always present,
  no locale cookie, no language in storage.
- The client provider carries locale context with `messages={null}`; every
  client component receives its labels as props, including the notification
  texts and the filter labels.
- One catalog per locale in `src/i18n/messages/`; `messages.test.ts` enforces
  key parity, ICU argument parity, no placeholders, the Uzbek turned comma,
  and Cyrillic Russian. Uzbek plurals use `other` alone; Russian carries
  `one`, `few`, `other`.
- Sample content (titles, organisers, places, descriptions, requirements,
  questions, answers, history) is `LocalizedText` picked per locale, so every
  screen reads correctly in all three languages.
- Dates use the named formats in `src/i18n/request.ts`; relative times come
  from `useFormatter().relativeTime` with an explicit `now`.
- Russian runs longest. Panel titles, chips and buttons are checked at 360px
  in all three languages.

## Accessibility

- One `h1` per page from `PageHeader`; panel titles are `h2`, row titles `h3`.
- A skip link is the first focusable element of every page.
- The base layer gives every focusable element a 3px `primary-ink` outline at
  3px offset; nothing removes it.
- Controls clear 44px: buttons, switches (the 28px track sits in a 44px
  button), selects, the search field, tab-bar targets at 56px.
- Every disclosure (language, notifications, account) sets `aria-expanded` and
  `aria-controls`, closes on Escape with focus returned, and closes on an
  outside pointer.
- Status is never carried by colour alone: every chip has an icon and a word,
  the meters are `progressbar`s with `aria-valuetext`, the level rail names the
  current level, the timeline states its dates or "not yet" in words.
- The notification badge is duplicated into the bell's accessible name.
- Filters are real form controls with labels; the switch submits a hidden
  value only while on.
- A disabled action is `disabled`, so it is announced as unavailable, and the
  `PreviewNote` beside it says why.
- Decorative marks, rules, dots and provider glyphs are `aria-hidden`; the
  verified tick carries an `aria-label`.
- Reduced motion is honoured globally. Panels are always visible; the orbit
  becomes a static CSS composition and entry movement is removed.

## Responsive rules

- Mobile is the primary composition. `body` clips horizontal overflow, the
  history table scrolls inside its panel, and the smoke suite asserts
  `scrollWidth === clientWidth` on four screens at phone width.
- The workspace is one column until the extra-large breakpoint, then a main
  column and a 22rem aside; panel order never changes.
- The sidebar appears at the large breakpoint; below it the sections live in
  the tab bar and the account routes in the user menu, with sign out also in
  the footer.
- Search exists only on Opportunities, where it remains available at every
  width and alongside the Saved view.
- The lockup drops to the mark alone below 360px.
