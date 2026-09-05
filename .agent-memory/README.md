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
- `decisions/planned-sections-render-instead-of-404.md` — why the app became
  a real panel with every section on mock data, and what stayed from `v-web`
- `decisions/error-codes-not-messages.md` — errors are codes the catalog
  translates, never sentences from a server
- `decisions/no-comments-in-source.md` — where the explanations went
- `decisions/no-essays-in-browser-storage.md` — why long answers never touch
  `localStorage`
- `decisions/why-no-cache-components.md` — why PPR is not enabled
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
