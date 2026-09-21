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

The same block aliases the token set under the names shadcn/ui components
expect — `background`, `foreground`, `card`, `popover`, `muted`,
`muted-foreground`, `input`, `ring`, `primary-foreground` and `radius` — each
as a `var()` reference to a brand token, so `bg-popover` is `surface` and
`text-muted-foreground` is `ink-muted` in both themes without a second palette.
`accent` is not aliased: it is the orange brand token, and a menu item's focus
surface uses `muted` with `primary-ink` instead. There is no `destructive`
alias, because the palette defines no red.

Product additions: `--text-figure` for stat tiles, `.meter` / `.meter-fill`
for progress bars, `.tab-bar` for the safe-area inset. The workspace's flat
ground is `bg-surface-sunk` on the shell's column, which covers the `body`
dot grid; the sign-in pages have no such wrapper and keep the grid.

## Composition primitives

| Component                                                                                                                                          | Role                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppShell`                                                                                                                                         | Skip link, sidebar, phone header, workspace, footer, and tab bar                                                                                                                                                                                                                                                                                                                                                                 |
| `Sidebar` / `SidebarNav`                                                                                                                           | The desktop shell on `shell` navy: lockup and `NotificationsMenu` (the `shell` variant), the three sections (dashboard, opportunities, leaderboard) lit by `isSectionActive`, then at the foot a second `SidebarNav` led by `SidebarIdentity` — the identity card as the profile's link, lit on `/profile` and `/profile/edit` — with settings, above sign out. `SidebarNav` renders both groups, so every entry is a plain link |
| `SectionTabs` / `OpportunitySectionTabs`                                                                                                           | Underlined tabs under a page header; the opportunities section uses them for All, Saved and Applications, each with a count                                                                                                                                                                                                                                                                                                      |
| `LoadErrorPanel` / `LoadErrorRows` / `RetryControls`                                                                                               | What a failed read renders in place of a listing or inside a panel: unreachable or failed copy, the request reference, a retry button and a three-round automatic countdown                                                                                                                                                                                                                                                      |
| `MobileHeader`                                                                                                                                     | Below the large breakpoint: the lockup, the bell, and the avatar that opens `AccountMenu`                                                                                                                                                                                                                                                                                                                                        |
| `AccountMenu`                                                                                                                                      | The phone header's avatar popover, holding a `nav` named "Account menu": the name, handle and level as the profile's link, then settings and sign out. It has no desktop counterpart — the sidebar names those routes as links                                                                                                                                                                                                   |
| `LeaderboardStanding` / `LeaderboardPodium` / `LeaderboardTable`                                                                                   | The viewer's card with rank and experience, the top three on gold, silver and bronze podium steps with the crown on first place, and the ranked table from fourth place on                                                                                                                                                                                                                                                       |
| `AccountSummary` / `SettingsIndex`                                                                                                                 | The settings page's opening card (name, handle, email, level, connected ways in) and the anchor list to its sections, a row of pills on a phone and a sticky column on desktop                                                                                                                                                                                                                                                   |
| `TabBar`                                                                                                                                           | Fixed four-tab bar below the large breakpoint with icons from `route-icons.ts`                                                                                                                                                                                                                                                                                                                                                   |
| `Panel`                                                                                                                                            | The unit of every screen, composed from `Card`: bordered surface, optional titled header with an action link, `padding="none"` for lists                                                                                                                                                                                                                                                                                         |
| `StatTiles`                                                                                                                                        | A row of figures: label, serif figure, note; orange when the figure is the person's                                                                                                                                                                                                                                                                                                                                              |
| `PageHeader`                                                                                                                                       | Eyebrow and sample chip, serif `h1`, description, actions on the right                                                                                                                                                                                                                                                                                                                                                           |
| `Segmented`                                                                                                                                        | Pill links for a status group filter, with counts and `aria-current`; styled by `toggleVariants`, because shadcn's toggle group is buttons and a filter must stay a URL                                                                                                                                                                                                                                                          |
| `StateChip`                                                                                                                                        | Icon-plus-word pill in `neutral`, `structure` or `achievement`, the matching `Badge` variants; `ApplicationStatusChip`, `OpportunityStatusChip` and the history outcomes build on it                                                                                                                                                                                                                                             |
| `StatusChip`                                                                                                                                       | Dashed pill for sample, preview and not-connected material; the `status` variant of `Badge`                                                                                                                                                                                                                                                                                                                                      |
| `PreviewNote`                                                                                                                                      | The dashed chip plus a sentence, beside every control that cannot write yet                                                                                                                                                                                                                                                                                                                                                      |
| `Switch` / `SwitchControl`                                                                                                                         | The labelled `role="switch"` row, uncontrolled or controlled, with an optional hidden form value; `SwitchControl` is the Radix switch inside it, as a `track` or as an `icon` button                                                                                                                                                                                                                                             |
| `Field` / `FieldLabel` / `FieldDescription` / `FieldError` with `Input`, `Textarea`, `NativeSelect`                                                | Labelled controls at 48px with optional help and an inline error carrying an alert icon and a heavier weight, because the palette has no red; an invalid control takes an `ink` edge, the caret is `primary-ink`, and the select stays native so a phone opens its own picker                                                                                                                                                    |
| `NextUp`, `ApplicationRows`, `OpportunityRows`, `ActivityFeed`                                                                                     | Ruled row lists for panels                                                                                                                                                                                                                                                                                                                                                                                                       |
| `RecordProgress`                                                                                                                                   | The level rail and the next-level meter in the dashboard hero's band; the sentence under the meter appears only when it adds something the fraction does not say (a reliability or review requirement)                                                                                                                                                                                                                           |
| `HeroCell`                                                                                                                                         | One cell of the dashboard hero's band: an `h2` with its `PanelAction` link, then a body and a sentence that line up with the other cell's on a subgrid                                                                                                                                                                                                                                                                           |
| `VolunteerPassBadge`                                                                                                                               | The SVG pass shared by the welcome flow's no-WebGL fallback and the dashboard hero, where it hangs from the top edge and shows the parts the profile has filled                                                                                                                                                                                                                                                                  |
| `LanguagePicker`                                                                                                                                   | The profile's languages as removable chips and a combobox over a listbox with checkbox rows: the common languages grouped first, search across all three locales' names, arrow keys, Enter, Escape and Backspace, a stated limit of ten, and one hidden `languages` input per choice                                                                                                                                             |
| `ProfileMeterSummary`                                                                                                                              | The completeness summary in the dashboard hero's band: a rail of the six fields named by `profile.completionFields` (short on purpose because they read as a list), the meter and one sentence                                                                                                                                                                                                                                   |
| `OpportunityFilters`, `OpportunityCard`, `OpportunityFacts`, `SaveButton`                                                                          | The opportunities section                                                                                                                                                                                                                                                                                                                                                                                                        |
| `ApplicationTimeline`                                                                                                                              | Submitted, under review, decision, with dates                                                                                                                                                                                                                                                                                                                                                                                    |
| `HistoryTable`                                                                                                                                     | The participation history on `Table`, scrolling inside its panel on a phone                                                                                                                                                                                                                                                                                                                                                      |
| `ProfileSheet` / `PublicPageLink`                                                                                                                  | The profile, as one sheet: the avatar in its orange ring beside the one action, the name as `h1`, the handle and level, the bio, one line of rolling figures, then every entered detail as a ruled row; a thin completeness meter along the top edge while fields are missing; the public page row's address and copy button                                                                                                     |
| `RollingNumber` / `SharedElement`                                                                                                                  | Motion primitives in `src/components/motion/`: a figure whose digits roll from 0 in CSS over the real value, and a `<ViewTransition>` wrapper that lets one element (the profile photo) travel between two routes                                                                                                                                                                                                                |
| `ProfileForm`                                                                                                                                      | The profile editor, one `Panel` of hairline-ruled sub-sections; contact and links are labelled optional                                                                                                                                                                                                                                                                                                                          |
| `AuthIntro` / `AuthPanel` / `AuthStatus` / `ProviderButtons` / `AuthDivider` / `CredentialsSection` / `LogInForm` / `SignUpForm` / `PasswordInput` | The sign-in surfaces: the mark and title, the panel on the dot grid, a status line for a refused hand-off, the provider buttons above a labelled rule, and the email form below it with its reveal toggle                                                                                                                                                                                                                        |
| `OnboardingFlow` / `ProfileStepForm` / `StepRail` / `OnboardingResume`                                                                             | The welcome flow: the split stage with the greeting, the pass and the rail beside the step panel; one profile step form that posts the whole profile with the other fields hidden; the ordered list of steps with `aria-current="step"`, vertical beside the pass at wide widths and a strip of nodes elsewhere; the dashboard row that leads back, carrying the same strip                                                      |
| `PassStage`                                                                                                                                        | Lazy Three.js lanyard badge that gains a part per saved step, with an inline SVG of the same badge for no WebGL, no JavaScript, and print                                                                                                                                                                                                                                                                                        |
| `Button` / `buttonClass`, `Scene`, `SplitWords`, `ThemeToggle`, `LocaleSwitcher`                                                                   | Shared interaction and entrance utilities                                                                                                                                                                                                                                                                                                                                                                                        |
| `DropdownMenu` / `Popover`                                                                                                                         | The language and account menus, and the notifications panel                                                                                                                                                                                                                                                                                                                                                                      |
| `AlertDialog`                                                                                                                                      | The withdraw confirmation                                                                                                                                                                                                                                                                                                                                                                                                        |
| `Avatar` / `Separator` / `Skeleton`                                                                                                                | Initials in the sidebar and the account menu, the rule between form sub-sections, the `loading.tsx` placeholders                                                                                                                                                                                                                                                                                                                 |
| `Toaster`                                                                                                                                          | Sonner, mounted once by `Providers`, themed from `src/lib/theme.ts`                                                                                                                                                                                                                                                                                                                                                              |

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
- The base layer restores `cursor: pointer` on `button`, `[role="button"]`
  and `summary`. Tailwind 4 no longer ships v3's pointer rule in Preflight, so
  without this every control sits under the browser arrow. The `:not(:disabled)`
  guard keeps a disabled control from claiming to be clickable, and anchors are
  untouched because the browser already points at them.
- Controls clear 44px: buttons, switches (the 28px track sits in a 44px
  button), selects, the search field, tab-bar targets at 56px.
- Every disclosure (language, notifications, account) sets `aria-expanded` and
  `aria-controls`, closes on Escape with focus returned, and closes on an
  outside pointer. The language and account menus are Radix menus, so arrow
  keys move between items; the notifications panel is a labelled dialog.
- A saved profile or draft is announced by a toast in a live region; a failed
  action stays an inline alert beside the control.
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
- Reduced motion is honoured globally. Panels are always visible; the
  dashboard pass does not swing and entry movement is removed.

## Responsive rules

- Mobile is the primary composition. `body` clips horizontal overflow, the
  history table scrolls inside its panel, and the smoke suite asserts
  `scrollWidth === clientWidth` on four screens at phone width.
- The workspace is one column until the extra-large breakpoint. From there
  the profile gains a 22rem aside and the dashboard sets the next commitment
  beside the applications; panel order never changes.
- The sidebar appears at the large breakpoint; below it the sections live in
  the tab bar (dashboard, opportunities, leaderboard, profile) and the account
  routes and sign out in the account menu behind the header avatar. The theme
  and the interface language are on `/settings` at every width.
- Search exists only on Opportunities, where it remains available at every
  width and alongside the Saved view.
- The lockup drops to the icon alone below 360px. The wordmark never shrinks
  below the logo kit's 120px minimum, so the lockup is sized from one variable,
  `--logo: 2.65rem`, and the header drops the wordmark instead of squeezing it.
  On the navy sidebar and in the dark theme the wordmark is white and the heart
  stays orange.
