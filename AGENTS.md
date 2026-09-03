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
sidebar and a top bar with notifications and an account menu on desktop, a top
bar and a four-destination tab bar on a phone, and panels of content on a flat
workspace. Only the sign-in pages keep the marketing site's whiteboard ground.
See [`DESIGN.md`](DESIGN.md).

## Product identity

**Volontyorlar** helps high school students in Uzbekistan find volunteering that
is real and worth their time. Volontyorlar finds opportunities, contacts
organisers, sources events, builds partnerships, supplies volunteers, and is
building regional operations toward all 14 regions.

Do not call the product "Youth Volunteer Club", "YVC", "Youth Volunteering
Community", or "Volontyor"; all four names are retired. The organisation name is
rendered as real text beside the mark, never with the delivered SVG lockup.

Verified facts live in the marketing repository (`../v-web/PRODUCT.md` and its
`src/lib/content/org.ts`) and are summarised in [`PRODUCT.md`](PRODUCT.md).
Nothing outside those sources may be presented as fact: no extra partners,
statistics, testimonials, awards, offices, addresses, or integrations.

## The one thing to know first

**There is no sign-in and no product API yet.** `../v-backend` has a Prisma
schema, configuration, and health routes; product endpoints do not exist. So:

- every screen renders the illustrative volunteer in `src/lib/sample/` — the
  dashboard, opportunities and their detail pages, applications and their
  detail pages, saved items, the record, the profile editor and settings — and
  the interface says so on screen through the `common.sample` chip;
- the login, sign-up and password-reset pages are interface only: every option
  opens the sample dashboard, and nothing is sent anywhere;
- every control that would write — apply, withdraw, save the profile, a
  settings switch, save an opportunity — either changes local state only or is
  disabled, and a `PreviewNote` beside it says so;
- the way from here to a working product is written down in
  [`docs/plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md`](docs/plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md).

Do not delete a label, invent a contract, or claim a behaviour works because
the code was written.

## Repository boundary

This repository owns the product application: sign-in surfaces, the volunteer
dashboard, and later the profile, applications, saved items, record, and
settings. It does not own marketing pages, SEO, structured data, or legal pages
(`../v-web`), nor the API, database, Telegram bot, identity verification, or
authorisation (`../v-backend`). Hidden frontend controls are never
authorisation.

## Technology stack

- Next.js 16 App Router, React 19, strict TypeScript with
  `noUncheckedIndexedAccess`, Node.js 22.13+
- Tailwind CSS 4 with the semantic tokens copied from `v-web` in
  `src/app/globals.css`
- `next-intl` for `uz` / `ru` / `en` routing and one catalog per locale
- `class-variance-authority`, `clsx`, `tailwind-merge`, Lucide icons
- Vitest + Testing Library for units and components, Playwright for smoke paths
- npm with a committed lockfile

There is no theme or general animation library. Light and dark are one token
set switched by `data-theme` on `<html>` (`src/lib/theme.ts`), entry motion is
CSS, and `three` is isolated to the lazy dashboard progress object. Panels and
task content never depend on JavaScript for visibility or scrolling.

Not installed, on purpose, until the implementation plan reaches the phase
that needs them: React Hook Form, Zod, `next-safe-action`, `nuqs`, TanStack
Query, Sonner, `jose`, Radix, `motion`, `date-fns`, and any auth SDK. The
previous foundation used all of them; it is archived under
`docs/reference/foundation-v1/legacy/` as reference material, not live code.

For framework behaviour, read `node_modules/next/dist/docs/` before relying on
older Next.js knowledge. Middleware is called Proxy in Next.js 16
(`src/proxy.ts`).

## Repository map

```text
src/app/[locale]/(auth)/        -> login, signup, forgot-password: interface only
src/app/[locale]/(volunteer)/   -> the panel: dashboard, opportunities[/slug],
                                   applications[/id], saved, record, profile, settings
src/app/global-not-found.tsx    -> 404 for unmatched URLs (root layout is dynamic)
src/app/robots.ts               -> disallows everything; every screen is private
src/i18n/                       -> routing, navigation, request config, catalogs
src/lib/routing/routes.ts       -> the app route registry: area, sidebar, tab bar, hrefs
src/lib/{record,opportunities,applications,profile,activity,notifications,account}/
                                -> domain rules and vocabulary, no JSX
src/lib/sample/                 -> the illustrative catalogue and volunteer every screen renders
src/lib/seo/origin.ts           -> this origin and the marketing origin, never guessed
src/lib/security/headers.ts     -> CSP and security headers
src/lib/theme.ts                -> theme preference, the boot script, the motion flag
src/components/{ui,brand,motion,app,auth,dashboard,opportunities,applications,record,profile,settings}/
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
  browser. There is no server-only secret yet; the plan introduces them.
- Every user-facing string exists in `uz`, `ru`, and `en`. Uzbek uses the turned
  comma `ʻ` (U+02BB), Russian uses Cyrillic, and a test enforces key and ICU
  argument parity.
- Add a section by registering it in `src/lib/routing/routes.ts`; the sidebar,
  the tab bar, the account menu and the tests all read from it. Detail pages
  hang off a section through `opportunityHref` and `applicationHref`.
- Two brand colours with a role each. **Blue is the institution**: navigation,
  structure, chips for a system state, primary actions, the mark. **Orange is
  the person**: the level reached, an accepted application, a confirmed
  attendance, the record's figures, a completed profile. Blue and orange sit
  1.25:1 apart and must never be combined. Each hue has a graphics value and a
  text value. The palette defines no red; an error colour needs a decision
  before it is used (see the plan). Use semantic tokens, never a literal hex.
  Solid fills use `action` and `band`, never `primary-ink`.
- Every screen is private. The root layout sends `noindex`, every response
  carries `X-Robots-Tag: noindex`, and `robots.txt` disallows all. Do not add
  an indexable route without the per-route policy in the plan.
- No personal data in URLs (the reset flow carries only `?reset=sent`), no
  tokens in browser storage; the theme choice is the only stored value.
- Reputation is high-trust data. Every threshold lives in
  `src/lib/record/levels.ts`. Never duplicate a formula into JSX, never invent
  one, never count unconfirmed attendance against a volunteer, and never show
  reliability below three resolved events.
- Sample data is labelled on screen wherever it renders, it never names a real
  partner or opportunity source as an organiser, and its record counts agree
  with its participation history; tests enforce all three.
- A control that cannot do its job yet is either local state only or
  `disabled`, with a `PreviewNote` beside it. Never a button that looks live
  and does nothing.
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
