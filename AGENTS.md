# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

# Volontyorlar App — Agent Guide

This repository is the authenticated **Volontyorlar** product application: where
a volunteer signs in, keeps a reusable profile, applies to opportunities, and
builds a participation record. Read this file before meaningful work, then use
[`docs/README.md`](docs/README.md) to load only the context the task needs.

It follows the same codebase patterns and system design as the marketing site
in `../v-web`: the same tokens, typefaces, theme and motion system, route
registry, catalog layout, documentation layout, and verification loop. When the
two disagree, check whether `v-web` moved first; the design system is sourced
from there.

It is not the marketing site's layout. The signed-in product is a **panel**: a
navy sidebar that carries everything on desktop — the lockup and the
notification bell, three sections (dashboard, opportunities, leaderboard), and
at the foot the identity card, which is itself the profile's link, above
settings and sign out — with no top bar; a slim header and a four-destination
tab bar on a phone; and panels of content on a flat workspace. **Every
sidebar entry is a plain link — nothing in it collapses**, and the bell is the
only tray. The theme switch and the
interface language are a panel on `/settings`, not shell controls.
Applications and saved items are tabs inside the opportunities section, not
sections of their own. Only the sign-in pages keep the marketing site's
whiteboard ground. See [`DESIGN.md`](DESIGN.md).

## Product identity

**Volontyorlar** helps high school students in Uzbekistan find volunteering that
is real and worth their time. Volontyorlar finds opportunities, contacts
organisers, sources events, builds partnerships, supplies volunteers, and is
building regional operations toward all 14 regions.

Do not call the product "Youth Volunteer Club", "YVC", "Youth Volunteering
Community", or "Volontyor"; all four names are retired. The logo is the
Volontyorlar web logo kit, drawn inline by `src/components/brand/logo.tsx` from
the kit's own paths exactly as `../v-web` draws it; how it is installed and used
is in `../v-web/docs/brand/BRAND_ASSETS.md`. The wordmark is outlined artwork,
never set as text, and never narrower than the kit's 120px minimum.

Verified facts live in the marketing repository (`../v-web/PRODUCT.md` and its
`src/lib/content/org.ts`) and are summarised in [`PRODUCT.md`](PRODUCT.md).
Nothing outside those sources may be presented as fact: no extra partners,
statistics, testimonials, awards, offices, addresses, or integrations.

## The one thing to know first

**Every screen behind sign-in reads `v-backend`; nothing is a sample.** So:

- **Three ways in, one session cookie.** `/login` and `/signup` both offer
  "Continue with Telegram" and "Continue with Google" above a rule, and an
  email and password form below it. **Telegram** sends the browser to
  Telegram's own OpenID Connect page: phone number, confirmation in the app,
  back to `/api/auth/telegram/callback`. **Google** is OpenID Connect too, but
  the browser asks `accounts.google.com` for an **ID token**
  (`response_type=id_token`, `response_mode=form_post`) posted straight back to
  `/api/auth/google/callback`, so no authorization code is exchanged, no Google
  client secret exists in either repository, and no third-party script is
  loaded; the button renders `disabled` with a note until
  `VOLONTYORLAR_GOOGLE_CLIENT_ID` is set, and
  [`docs/operations/GOOGLE_SIGN_IN_SETUP.md`](docs/operations/GOOGLE_SIGN_IN_SETUP.md)
  is how it is set. **Email and password** are two Server Actions over
  `POST /auth/password/login` and `POST /auth/password/signup`; a new password
  is at least 15 characters because the backend measures its strength. The
  backend creates the account on the first sign-in. There is still no password
  reset and no email verification — the backend has neither — so nothing on
  screen offers one and `/forgot-password` is a 404. A **new** account (the
  email sign-up, or Telegram and Google when the backend says `isNewUser`)
  lands on `/welcome`, the four-step welcome flow described in
  [`docs/product/ONBOARDING.md`](docs/product/ONBOARDING.md); its only state
  is a readable, app-only progress cookie, and every step saves through the
  existing profile action;
- **the app needs `VOLONTYORLAR_API_URL` and `VOLONTYORLAR_SESSION_SECRET`.**
  Both are server-only. `src/proxy.ts` guards every `(volunteer)` route whether
  or not they are set; unset, no session can exist and the Telegram handoff
  returns to `/login?telegram=unavailable`. There is no preview mode;
- every read is a function in `src/lib/api/<domain>.server.ts`, parsed by a
  schema in `src/lib/api/schemas.ts`. A response the schema rejects is an
  error, never a guess. The frontend type is the schema's output;
- every write — apply, save or submit a draft, withdraw, save an opportunity,
  save the profile, mark notifications read, sign out — is a Server Action in
  `src/lib/<domain>/actions.ts` returning the
  `ActionResult` envelope from `src/lib/api/action-result.ts`. Errors are
  backend codes the catalog translates, never sentences from a server;
- a read that fails does not take the page down. Pages wrap each read in
  `settle()` from `src/lib/api/load.server.ts` and render `LoadErrorPanel` (a
  whole listing) or `LoadErrorRows` (inside a panel) in its place, with the
  rest of the page standing; the panel says whether the server was unreachable
  or answered with an error, shows the request reference, and retries on its
  own three times (5, 10, 20 seconds) before leaving the button to the
  volunteer. `GET` requests also retry once on a transient failure inside the
  client. `PanelErrorBoundary` only catches a render that throws. The palette
  still defines no red: error states use the soft surface and ink;
- **one account, two ways in.** `/settings` is the account page: it reads
  `/me` and `/me/account-merge-requests` on the server and shows Telegram,
  Google and email as separate connection states. A Google-owned address is
  already an email connection even before a password exists. The password
  section sets the first password for a Google- or Telegram-only account and
  changes it when one exists. Connecting an identity nobody
  owns completes at once; connecting one another account owns raises a merge
  request that the other account must approve after signing in again, and the
  requesting account is the one that survives. Approval returns the canonical
  session, which the Server Action writes into the same encrypted cookie.
  Nothing is unlinked, unmerged, exported or deleted here;
- **the leaderboard is the backend's arithmetic, shown.** `/leaderboard` is a
  sidebar section and a phone tab reading `GET /leaderboard`; every
  rank and every experience total arrives from the backend and none is ever
  computed here, pagination is rendered from the response's own `page`,
  `pageSize` and `total`, and `viewer` shows the signed-in volunteer their
  place even from a page they are not on. Each account has a public `username`
  with a `source`: every username is renamed through
  `PUT /me/username` from `/settings` and from the welcome flow's first step,
  while a valid Telegram username is only the initial value and stops syncing
  after the volunteer chooses a custom one. It is all
  described in [`docs/product/LEADERBOARD.md`](docs/product/LEADERBOARD.md),
  and what was known about the contract when it was written is in
  `.agent-memory/decisions/leaderboard-contract-is-built-blind.md`;
- the plan that got here, and the phase still open (hardening), is
  [`docs/plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md`](docs/plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md);
  the keys and the bot are set up from
  [`../v-backend/docs/operations/TELEGRAM_BOT_SETUP.md`](../v-backend/docs/operations/TELEGRAM_BOT_SETUP.md).

Do not invent a contract or claim a behaviour works because the code was
written; a backend shape lives in `src/lib/api/schemas.ts` and nowhere else.

**The profile is the volunteer's own page, not a settings screen.** `/profile`
opens on `ProfileSheet` — one read-only sheet: the avatar, the name as the
`h1`, the username and the level, the bio, one line of figures from the record,
and then every detail the volunteer entered (region, city, school, year,
languages, phone, Telegram, Instagram, LinkedIn, portfolio links, the public
page address with a copy button, the month they joined) as plain ruled rows.
There is no cover, no stat band and
no second panel; completeness is a thin meter along the sheet's top edge with
one sentence, and it disappears once nothing is missing. It is the same sheet
the public page at `volontyorlar.uz/<username>` (in `../v-web`) draws from the
public contract. A visible leaderboard identity opens the same public contract
inside the signed-in shell at `/<username>` without opening another tab; the
share address remains `volontyorlar.uz/<username>`.
Editing is its own page, `/profile/edit`: "Edit profile", "Complete profile"
and the welcome flow's "finish on your profile" all lead there, and a saved
form returns to `/profile`. The profile carries nothing else: the
account lives on `/settings`, sign-out at the foot of the sidebar (in the phone
header's account menu on a phone), and the theme and the interface language in
the **Appearance** panel on `/settings` — the one place either is changed
inside the app.
**The record lives on the dashboard.** `/record` redirects to
`/dashboard#history`; the dashboard carries the four figures, the level rail
and the participation history, and the leaderboard is where "Your progress"
leads. Nothing reads or writes
`/me/preferences`; the strings under `settings.{preferences,notifications,
privacy}` are unused and are kept only because that decision is
reversible. `settings.appearance` is live: it labels the theme switch and the
language picker on `/settings`.

## Repository boundary

This repository owns the product application: sign-in surfaces, the volunteer
dashboard, the profile, applications, saved items, and the record. It does not
own marketing pages, SEO, structured data, or legal pages
(`../v-web`), nor the API, database, Telegram bot, identity verification, or
authorisation (`../v-backend`). Hidden frontend controls are never
authorisation.

## Technology stack

- Next.js 16 App Router, React 19, strict TypeScript with
  `noUncheckedIndexedAccess`, Node.js 22.13+
- Tailwind CSS 4 with the semantic tokens copied from `v-web` in
  `src/app/globals.css`
- `next-intl` for `uz` / `ru` / `en` routing and one catalog per locale
- shadcn/ui components in `src/components/ui/`, built on `radix-ui`,
  `class-variance-authority`, `clsx`, `tailwind-merge` and Lucide icons; the
  CLI is configured by `components.json`
- React Hook Form with `@hookform/resolvers` and `zod` for the forms, `nuqs`
  for URL state, TanStack Query around the Server Actions that toggle state,
  Sonner for toasts
- `openapi-fetch` over `src/lib/api/generated/schema.d.ts`, generated from
  `v-backend`'s OpenAPI document by `npm run api:types`
- Vitest + Testing Library for units and components, Playwright for smoke paths
- npm with a committed lockfile

There is no theme or general animation library. Light and dark are one token
set switched by `data-theme` on `<html>` (`src/lib/theme.ts`), entry motion is
CSS — the profile's rolling figures included (`RollingNumber` in
`src/components/motion/`) — and `three` is isolated to one lazy object: the
welcome flow's pass. The dashboard draws the same pass as an SVG. The one
shared-element transition, the profile photo travelling into the editor and
back, is React's `<ViewTransition>` behind `SharedElement`: the App Router
ships the React canary that exports it, `src/types/react-canary.d.ts` brings
its types, and the wrapper renders its children unchanged where the component
is missing (the unit tests' stable React). `motion` stays out: nothing on the
profile needs springs or drag. Panels and task content never depend on
JavaScript for visibility or scrolling.

Sign-in added `jose` (the encrypted session cookie), `zod` (parsing every
backend response) and `server-only` (keeping the API client and the cookie
reader out of client bundles).

The library layer arrived in one decision, `feat/ui-libraries`, once the
hand-rolled primitives had each grown their own keyboard, focus and state
handling: `radix-ui` through the shadcn/ui components in `src/components/ui/`,
React Hook Form with `@hookform/resolvers` and the existing `zod` in front of
the four forms, `nuqs` for the opportunity filters and the application group,
TanStack Query's `useMutation` around the Server Actions behind a switch or a
save button, Sonner for the outcomes that used to be a status line, and
`openapi-fetch` with `openapi-typescript` under the server-only client. Every
read is still server-only and every write is still a Server Action; the
libraries sit in front of that architecture, not instead of it. Still out, on
purpose: `next-safe-action`, `next-themes`, `motion`, `date-fns`, and any auth
SDK. The previous foundation is archived under
`docs/reference/foundation-v1/legacy/` as reference material, not live code.

For framework behaviour, read `node_modules/next/dist/docs/` before relying on
older Next.js knowledge. Middleware is called Proxy in Next.js 16
(`src/proxy.ts`).

## Repository map

```text
src/app/[locale]/(auth)/        -> login and signup; providers, a rule, and the email form
src/app/api/auth/telegram/      -> start and callback: the two hops of Telegram sign-in
src/app/api/auth/google/        -> start and callback: the challenge, then Google's posted ID token
src/app/api/auth/connect/       -> the same two hops for a signed-in account joining a second
                                   identity, on connection cookies of their own, plus reauthenticate
src/app/api/auth/session/       -> expired: clears the cookie and returns to sign-in
src/lib/auth/                   -> config, session cookie, refresh, sign-out action
src/lib/api/                    -> the server-only client on openapi-fetch, the generated API types,
                                   per-domain reads, the Zod schemas, error codes, ActionResult
src/hooks/                      -> useServerAction and useActionForm: TanStack Query and React Hook Form
                                   around the Server Actions
src/app/[locale]/(onboarding)/  -> welcome: the four-step flow a new account lands on
src/app/[locale]/(volunteer)/   -> the panel: dashboard (with the record), opportunities[/slug],
                                   applications[/id], saved and record (redirects),
                                   leaderboard, profile, profile/edit, settings
src/app/global-not-found.tsx    -> 404 for unmatched URLs (root layout is dynamic)
src/app/robots.ts               -> disallows everything; every screen is private
src/i18n/                       -> routing, navigation, request config, catalogs
src/lib/routing/routes.ts       -> the app route registry: area, sidebar, tab bar, hrefs
src/lib/{record,leaderboard,opportunities,applications,profile,notifications}/
                                -> domain rules and vocabulary, no JSX; each write lives in its actions.ts
src/lib/onboarding/             -> the welcome flow's steps, pass parts, and progress cookie
src/lib/seo/origin.ts           -> this origin and the marketing origin, never guessed
src/lib/security/headers.ts     -> CSP and security headers
src/lib/theme.ts                -> theme preference, the boot script, the motion flag
src/components/{ui,brand,motion,app,auth,account,onboarding,dashboard,opportunities,applications,record,leaderboard,profile,settings}/
e2e/                            -> Playwright smoke suite
docs/                           -> stable project documentation and the plan
.agent-memory/                  -> durable decisions, discoveries, gotchas
```

## Critical rules

- Preserve the mobile-first path from Telegram: no horizontal overflow, thumb
  sized controls, a bottom tab bar below the large breakpoint, fast first
  render, and no hover-only interaction.
- Never invent an origin. `NEXT_PUBLIC_SITE_URL` and
  `NEXT_PUBLIC_MARKETING_URL` are blank by default, and the interface degrades
  instead of guessing: an unconfigured marketing origin hides the about,
  privacy and terms links rather than pointing anywhere.
- Keep secrets out of source control. `NEXT_PUBLIC_*` values reach every
  browser. `VOLONTYORLAR_API_URL` and `VOLONTYORLAR_SESSION_SECRET` are
  server-only and must never gain that prefix or be read from a Client
  Component. The Telegram bot token belongs to `v-backend` and never enters
  this repository.
- Every user-facing string exists in `uz`, `ru`, and `en`. Uzbek uses the turned
  comma `ʻ` (U+02BB), Russian uses Cyrillic, and a test enforces key and ICU
  argument parity.
- Add a section by registering it in `src/lib/routing/routes.ts`; the sidebar,
  the tab bar, the phone's account menu, the proxy's `guard` and the tests all
  read from it. `navGroup` says where in the sidebar a route lands —
  `"primary"` for the stack under the lockup, `"account"` for the stack at the
  foot, `null` for a route no sidebar stack lists. The profile is `null`
  because `IDENTITY_ROUTE` makes the identity card its link, in the sidebar and
  in the phone's account menu alike, so it is never a second row. A route that
  belongs inside a section names it in `section`, which is what keeps the
  sidebar and the tab bar lit on `/applications` and
  `/profile/edit`. Detail pages hang off a section through `opportunityHref`
  and `applicationHref`.
- Two brand colours with a role each. **Blue is the institution**: navigation,
  structure, chips for a system state, primary actions. **Orange is the
  person**: the level reached, an accepted application, a confirmed attendance,
  the record's figures, a completed profile. Blue and orange sit 1.25:1 apart
  and must never be combined; the logo's orange heart is the one exception,
  drawn by the kit as its own shape beside the blue. Each hue has a graphics
  value and a text value. The palette defines no red; an error colour needs a decision
  before it is used (see the plan). Use semantic tokens, never a literal hex.
  Solid fills use `action` and `band`, never `primary-ink`.
- Every screen is private. The root layout sends `noindex`, every response
  carries `X-Robots-Tag: noindex`, and `robots.txt` disallows all. Do not add
  an indexable route without the per-route policy in the plan.
- No personal data in URLs (sign-in carries only
  `?telegram=expired|unavailable|cancelled|phoneRequired`,
  `?google=expired|unavailable|cancelled|disabled|tooMany`, `?session=expired`,
  the account page only `?connect=<one of eleven statuses>`,
  and a same-origin `?next=`; Telegram's callback adds a one-time `code` and
  `state`, and Google posts its one-time `id_token` in a form body, never a
  query string), no credentials in a URL — the email forms are gated by client
  validation before they submit, no tokens in browser storage; the theme, the
  interface language, and the welcome flow's progress are the only stored
  values. The first two live in readable cookies shared with the marketing
  site (`src/lib/preferences.ts`) rather than in `localStorage`, which cannot
  cross the two origins; the third is an app-only readable cookie holding a
  step name and nothing else (`src/lib/onboarding/state.ts`). Session tokens live only in the encrypted
  `httpOnly` cookie and must never be passed to a Client Component.
- Reputation is high-trust data. Every threshold lives in
  `src/lib/record/levels.ts`. Never duplicate a formula into JSX, never invent
  one, never count unconfirmed attendance against a volunteer, and never show
  reliability below three resolved events.
- Backend data is never re-shaped in JSX. A response is parsed once by a schema
  in `src/lib/api/schemas.ts`; a page renders the schema's output or the
  load-error panel, never a fallback value it made up.
- A control that cannot do its job is `disabled` with a visible note, as the
  Google button is while its client id is unset. Never a button that looks
  live and does nothing.
- Preserve reduced-motion behaviour, keyboard access, visible focus states, one
  logical `h1` per page, and responsive behaviour.
- Update `/docs` when stable environment or architecture behaviour changes.

## Code conventions

- **Source files carry no comments.** Explanations go in `/docs` — see
  [`docs/operations/EXTENDING.md`](docs/operations/EXTENDING.md). Names, types,
  and test names carry intent inside the source. Compiler and linter directives
  are not comments and stay.
- Server Components by default; `"use client"` only for event handlers, client
  state, browser APIs, or an interactive primitive, with the boundary as low as
  practical. Client components receive their labels as props; the root layout
  gives `NextIntlClientProvider` `messages={null}`.
- Internal links use `navHref()` with `Link` from `@/i18n/navigation`, which
  adds the locale prefix itself. `localePath()` is for plain anchors outside
  the locale tree. Mixing them yields `/uz/uz/...`.
- Domain logic lives under `src/lib/<domain>/` with its tests beside it and no
  JSX. Components under `src/components/<surface>/` compose it.
- No literal hex, no hard-coded origin, no fabricated fact.

## Default verification

```bash
npm run lint
npm run typecheck
npm run test
git diff --check
```

Add `npm run build` for build or deployment work, and `npm run test:e2e` when
routing, navigation, or the information architecture changes. For UI work also
inspect the affected routes at mobile and desktop widths, in both themes, and
with reduced motion.

To add anything — a section, copy, a locale, a token, a component, an external
link — follow [`docs/operations/EXTENDING.md`](docs/operations/EXTENDING.md).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
