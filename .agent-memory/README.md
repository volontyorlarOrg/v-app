# Project Memory

Store durable project knowledge here when it would otherwise be expensive to
rediscover.

- `decisions/` — choices and the reasoning behind them
- `discoveries/` — verified facts about the project or its integrations
- `gotchas/` — recurring failure modes and constraints

Keep temporary plans, command logs, and ordinary status updates out of this
folder. Never store secrets or unverified external claims.

## Current entries

- `decisions/adopt-the-marketing-site-patterns.md` — why the app was rebuilt on
  `v-web`'s tokens, motion, catalogs and registry, and what happened to the
  previous foundation
- `decisions/sample-dashboard-is-labelled-and-fictional.md` — why the demo said
  it was a sample while it existed (historical; the sample is gone)
- `decisions/every-screen-reads-the-backend.md` — why the sample and the
  email forms were removed, why the proxy guards unconditionally, and the
  cookie and refresh rules that came with real data
- `decisions/account-connections-are-a-forward-contract.md` — why the Zod
  schemas, not the backend's OpenAPI, define every connection and merge
  _response_, the five shapes that surprise a reader who only saw the sketch,
  and the two tolerances that keep `/settings` honest against an older backend
- `decisions/leaderboard-contract-is-built-blind.md` — the leaderboard and
  handle routes were written before `v-backend` served them, which rules were
  copied from its migration rather than guessed, and what to re-check when the
  two routes ship
- `decisions/google-sign-in-is-an-id-token-redirect.md` — why Google sign-in
  is a redirect that returns an ID token rather than Google Identity Services,
  and why its handoff cookies are `SameSite=None`
- `decisions/telegram-sign-in-is-openid-connect.md` — why the bot deep link
  was replaced by Telegram's OpenID Connect page, what the state cookie
  protects, and why the phone number is required
- `decisions/planned-sections-render-instead-of-404.md` — why the app became
  a real panel with every section on mock data, and what stayed from `v-web`
- `decisions/error-codes-not-messages.md` — errors are codes the catalog
  translates, never sentences from a server
- `decisions/no-comments-in-source.md` — where the explanations went
- `decisions/library-layer-in-one-decision.md` — why shadcn/ui, React Hook
  Form, `nuqs`, TanStack Query, Sonner and `openapi-fetch` arrived together,
  which component each one replaced, and what stayed hand-rolled
- `gotchas/cva-contracts-from-client-modules.md` — why a `cva` contract a
  Server Component calls must not sit in a `"use client"` file
- `decisions/no-essays-in-browser-storage.md` — why long answers never touch
  `localStorage`
- `decisions/why-no-cache-components.md` — why PPR is not enabled
- `decisions/the-sidebar-is-the-whole-shell.md` — why the desktop top bar
  went, the record moved onto the dashboard, the leaderboard gained a podium,
  and the palette gained a navy shell without changing its brand values
- `decisions/the-identity-card-is-the-profile-link.md` — why the sidebar's
  identity card replaced the "Profile" row, and how its active state and
  accessible name were chosen
- `decisions/onboarding-progress-is-a-readable-cookie.md` — why the welcome
  flow's only browser state is a step name in a cookie, and why every answer
  goes straight to the backend
- `decisions/the-profile-is-one-sheet.md` — why `/profile` became one sheet
  with every detail as a plain row, what was removed, and how its motion and
  the photo's view transition work
- `discoveries/backend-has-a-schema-but-no-endpoints.md` — the endpoints
  `v-backend` serves and the error bodies they return
- `discoveries/onest-covers-all-three-locales.md` — the typeface and the Uzbek
  apostrophes
- `gotchas/calendar-days-are-timezone-dependent.md` — why deadlines count
  Tashkent days
- `gotchas/generate-static-params-and-cookies.md` — why a route reading cookies
  cannot be static
- `gotchas/icu-plural-braces-are-not-arguments.md` — how the catalog test reads
  ICU arguments
- `gotchas/nextjs-16-renamed-middleware.md` — `proxy.ts`, not `middleware.ts`
- `gotchas/next-typegen-before-typecheck.md` — why `typecheck` runs typegen
- `gotchas/the-password-toggle-shares-its-label.md` — why Playwright must match
  the password field exactly
- `gotchas/the-stub-backend-remembers-between-runs.md` — why a reused stub
  makes the set-first-password smoke test fail on the second run
