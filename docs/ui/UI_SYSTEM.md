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
as a `var()` reference to a brand token, so `bg-popover` is `surface-raised`
and `text-muted-foreground` is `ink-muted` in both themes without a second
palette. `accent` is not aliased: it is the brand's one blue fill, and a menu
item's focus surface uses `muted` with `primary-ink` instead. There is no
`destructive` alias, because the palette defines no red.

Product additions: `--text-figure` for stat tiles, `--text-page-title` for
the serif `h1` of every section, `.meter` / `.meter-fill` for progress bars,
`.tab-bar` for the safe-area inset. The ground is flat everywhere: `body`
paints `paper`, the shell's column paints `surface-sunk` over it, and the
sign-in pages sit on the paper itself. There is no grid, wash or gradient,
and the token test asserts there is none.

The fills follow the marketing site's rule. `action` is the primary button
and takes an `ink-inverse` label; it is ink in the light theme and ivory in
the dark. `accent` is the one blue fill — the sign-in, apply and submit
actions, the achievement chip, the reached level, a switch that is on, the
notification badge, the meters — and takes `knockout`. `accent-soft` with
`primary-ink` is the tint behind anything selected or owned by the system.
`brand` is the mark alone. A shadcn variant that fills with `action` labels
it `ink-inverse`, never `knockout`, because `knockout` stays ivory in the
dark theme and `action` becomes ivory with it.

## Composition primitives

| Component                                                                                           | Role                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AppShell`                                                                                          | Skip link, sidebar, minimal top bar, workspace, footer, and tab bar                                                                                                                  |
| `Sidebar` / `SidebarNav`                                                                            | The desktop navigation: lockup, main sections, account routes, the user card with level, sign out                                                                                    |
| `TopBar`                                                                                            | `NotificationsMenu`, language, theme, `UserMenu`; the brand mark below the large breakpoint                                                                                          |
| `TabBar`                                                                                            | Fixed four-tab bar below the large breakpoint with icons from `route-icons.ts`                                                                                                       |
| `Panel`                                                                                             | The unit of every screen, composed from `Card`: bordered surface, optional titled header with an action link, `padding="none"` for lists                                             |
| `StatTiles`                                                                                         | A row of figures: label, serif figure, note; the text blue when the figure is the person's                                                                                                  |
| `PageHeader`                                                                                        | Eyebrow and sample chip, serif `h1`, description, actions on the right                                                                                                               |
| `Segmented`                                                                                         | Pill links for a status group filter, with counts and `aria-current`; styled by `toggleVariants`, because shadcn's toggle group is buttons and a filter must stay a URL              |
| `StateChip`                                                                                         | Icon-plus-word pill in `neutral`, `structure` or `achievement`, the matching `Badge` variants; `ApplicationStatusChip`, `OpportunityStatusChip` and the history outcomes build on it |
| `StatusChip`                                                                                        | Dashed pill for sample, preview and not-connected material; the `status` variant of `Badge`                                                                                          |
| `PreviewNote`                                                                                       | The dashed chip plus a sentence, beside every control that cannot write yet                                                                                                          |
| `Switch` / `SwitchControl`                                                                          | The labelled `role="switch"` row, uncontrolled or controlled, with an optional hidden form value; `SwitchControl` is the Radix switch inside it, as a `track` or as an `icon` button |
| `ThemeSwitch`                                                                                       | The switch bound to the real theme, for settings                                                                                                                                     |
| `Field` / `FieldLabel` / `FieldDescription` / `FieldError` with `Input`, `Textarea`, `NativeSelect` | Labelled controls at 48px with optional help and an inline error; the select stays native so a phone opens its own picker                                                            |
| `NextUp`, `ApplicationRows`, `OpportunityRows`, `ActivityFeed`                                      | Ruled row lists for panels                                                                                                                                                           |
| `RecordProgress`                                                                                    | The level rail and the next-level meter, a `Progress` with `aria-valuetext`                                                                                                          |
| `ProfileMeter`                                                                                      | The completeness bar with the missing fields, a `Progress` with `aria-valuetext`                                                                                                     |
| `OpportunityFilters`, `OpportunityCard`, `OpportunityFacts`, `SaveButton`                           | The opportunities section                                                                                                                                                            |
| `ApplicationTimeline`                                                                               | Submitted, under review, decision, with dates                                                                                                                                        |
| `HistoryTable`                                                                                      | The participation history on `Table`, scrolling inside its panel on a phone                                                                                                          |
| `ProfileForm`, `PreferenceSwitches`, `IdentityList`                                                 | The profile editor and the settings groups                                                                                                                                           |
| `AuthIntro` / `PreviewNotice` / `AuthPanel` / `AuthDivider` / `ProviderButtons` / `AuthForm`        | The sign-in surfaces                                                                                                                                                                 |
| `ImpactOrbit`                                                                                       | Lazy Three.js progress object with a static no-WebGL and reduced-motion fallback                                                                                                     |
| `Button` / `buttonClass`, `Scene`, `SplitWords`, `ThemeToggle`, `LocaleSwitcher`                    | Shared interaction and entrance utilities                                                                                                                                            |
| `DropdownMenu` / `Popover`                                                                          | The language and account menus, and the notifications panel                                                                                                                          |
| `AlertDialog`                                                                                       | The withdraw confirmation                                                                                                                                                            |
| `Avatar` / `Separator` / `Skeleton`                                                                 | Initials in the sidebar and the account menu, the rule between form sub-sections, the `loading.tsx` placeholders                                                                     |
| `Toaster`                                                                                           | Sonner, mounted once by `Providers`, themed from `src/lib/theme.ts`                                                                                                                  |

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
