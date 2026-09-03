# Component Library

Reuse before you create. Check this page, then the route-local `_components`.

---

## Primitives — `src/components/ui/`

| Component                                 | Tree   | Notes                                                                                                                                                                                   |
| ----------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                  | either | `primary` \| `secondary` \| `ghost` \| `danger`; `sm` 36 / `md` 44 / `lg` 52px; `asChild` for links. Defaults to `type="button"` so an unlabelled button is never an accidental submit. |
| `Surface`                                 | either | The raised panel. `panel` \| `field` \| `accent` \| `quiet`.                                                                                                                            |
| `Badge`                                   | either | `neutral` \| `signal` \| `signalQuiet` \| `deadline` \| `danger` \| `success` \| `sample`. Always pair with a word.                                                                     |
| `Field` + `Input` / `Textarea` / `Select` | client | **Every** input goes through `Field`. See `../architecture/FORMS.md` §5.                                                                                                                |
| `EmptyState` / `ErrorState`               | either | Require a title; a body and action are optional but nearly always wanted.                                                                                                               |
| `Skeleton` / `LoadingRegion`              | either | `Skeleton` is `aria-hidden`; the region announces.                                                                                                                                      |
| `PageHeader`                              | either | Renders the page's single `<h1>`.                                                                                                                                                       |
| `Pagination`                              | either | Real anchors — crawlable, middle-clickable, works before hydration.                                                                                                                     |

## Shared — `src/components/shared/`

`AppShell` (header, main, footer, mobile tab bar) · `NavLink` / `TabLink` ·
`LanguageSwitcher` · `SignOutButton` · `SampleDataNotice` · `ApiErrorState`.

## Domain

**`opportunities/`** — `OpportunityCard` (whole card is one link: one tap
target, one tab stop) · `OpportunityStatusBadge` (derives status, so a passed
deadline cannot display as open) · `OpportunityDeadline` (relative, amber only
when urgent) · `OpportunityFiltersBar` (URL-backed).

**`applications/`** — `ApplicationForm` · `EssayField` + `SaveIndicator` ·
`ApplicationStatusBadge` / `ApplicationStatusHelp` · `ConfirmDialog` ·
`WithdrawButton`.

**`volunteers/`** — `ProfileForm` · `ProfileCompletionCard` ·
`VolunteerRecordCard`.

## Rules

1. **Server-safe by default.** Add `"use client"` only for a listed reason
   (`../architecture/RENDERING_AND_STATE.md` §1). A card that renders forty
   times should cost no JavaScript.
2. **Shared components take rendered strings, not keys** — their callers may be
   server or client.
3. **Do not promote to `shared/` because something was used twice by
   accident.** Route-local until genuinely cross-domain.
4. **Compose, do not fork.** A new visual treatment usually means a new
   `Surface` tone or `Button` variant, not a new component.
5. **Tokens only.** No arbitrary colour, radius, or font. `globals.css` is the
   only file allowed to contain a hex value, and a test enforces it.
6. **Respect the colour roles.** Blue is structure; orange is a volunteer's own
   achievement and appears on exactly three things today (level, accepted
   application, completed profile). Adding a fourth needs an argument.
