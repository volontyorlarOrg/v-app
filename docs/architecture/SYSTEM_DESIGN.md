# System Design

Where things live and why.

---

## 1. Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 App Router (Turbopack), React 19, Node 22+ |
| Language | TypeScript, `strict` + `noUncheckedIndexedAccess` |
| Styling | Tailwind CSS 4, repository-owned semantic tokens |
| Primitives | Radix + `class-variance-authority`, Lucide icons |
| i18n | `next-intl`, three locales, server-first |
| Forms | React Hook Form + Zod + `@hookform/resolvers` |
| Mutations | `next-safe-action` — the one approved boundary |
| URL state | `nuqs` |
| Client server-state | TanStack Query |
| Toasts | Sonner |
| Dates | `Intl` via next-intl, `date-fns` for arithmetic |
| Session | `jose`, encrypted JWE cookie |
| Tests | Vitest + Testing Library, Playwright |

### Deliberately absent

- **Zustand** — nothing has needed it. See `RENDERING_AND_STATE.md` §2.
- **`@tanstack/react-table`** — no data-dense admin table exists yet.
- **Sentry, Vercel Analytics** — add when a real project and a scrubbing
  policy exist, not before.
- **A second UI kit, a second schema library, a second toast system, Axios,
  Redux, Formik.**

### Where this differs from the Dwelve reference, and why

| Dwelve | Here | Reason |
| --- | --- | --- |
| `i18next` + `react-i18next` (client-only) | `next-intl` | Server components can translate. Dwelve's own docs note "i18n is client-only in this app" as a constraint that shapes its component API; this removes it. |
| `react-toastify` | `sonner` | One toast system; the handoff names Sonner. |
| Filters in component state | `nuqs` | Shareable URLs — the product's distribution channel. |
| Blanket `noindex` | Per-route policy | Opportunity pages are the funnel. |
| No automated tests | Vitest + Playwright | The handoff calls this a mandatory improvement. |
| English strings from server actions | Error **codes** | A backend sentence cannot be translated. |

## 2. Directory layout

```text
src/
  app/
    [locale]/                    root layout lives here — locale is a root param
      (public)/opportunities/    indexable discovery + detail
      (auth)/login/
      (volunteer)/               session-guarded group
        dashboard/ profile/ saved/ applications/ record/ settings/
      layout.tsx  page.tsx  error.tsx  not-found.tsx
    api/auth/telegram/           route handlers: redirects and cookie writes
    robots.ts  sitemap.ts  not-found.tsx  globals.css

  components/
    ui/                          primitives — button, surface, badge, field, states
    shared/                      cross-domain — shell, nav, language, error state
    opportunities/  applications/  volunteers/

  features/                      domain logic, schemas, requests, actions
    opportunities/  applications/  profile/  saved/  record/  auth/

  i18n/                          routing, request config, navigation, messages/
  lib/
    api/                         client.server, errors, env.server
    auth/                        session, session.server
    query/                       keys, QueryProvider
    routes/                      policy
    forms/  datetime.ts  utils.ts

  proxy.ts                       Next 16's renamed middleware
  test/                          render helper for component tests

e2e/                             Playwright
docs/                            this
.agent-memory/                   non-obvious decisions and gotchas
```

### Route groups mean product boundaries

`(public)`, `(auth)`, `(volunteer)` are not folders for tidiness — each has a
different session requirement and a different indexing rule.
`(volunteer)/layout.tsx` guards the whole group in one place.

### Route-local `_components`

Implementation stays beside its route in underscored folders until it is
genuinely shared. `login/_components/telegram-panel.tsx` is used by exactly one
page and belongs there. Promote to `components/<domain>/` when a second real
consumer appears — not because something was used twice by accident.

### `features/` vs `components/`

`features/` holds logic with no JSX: schemas, derivations, request functions,
actions. It is the layer the unit tests point at, and it is where a rule like
"what counts as closing soon" lives so that it has exactly one definition.

## 3. Next.js 16 specifics worth knowing

The bundled docs (`node_modules/next/dist/docs/`) are authoritative; these are
the ones that bit during this build.

1. **`middleware.ts` is deprecated and renamed to `proxy.ts`.** The old
   filename silently does nothing.
2. **The root layout can live under a dynamic segment.** It is at
   `app/[locale]/layout.tsx`, which makes `locale` a *root parameter*.
3. **No `app/layout.tsx` means `app/not-found.tsx` is its own root** and must
   render its own `<html>` and `<body>`.
4. **`PageProps<'/route'>` and `LayoutProps<'/route'>` are global** after type
   generation; `params` and `searchParams` are Promises.
5. **`generateStaticParams` marks a route static**, so a page that reads
   `cookies()` must not export it — the detail page fails every request with
   `DYNAMIC_SERVER_USAGE` if it does. This one cost real debugging time; see
   `.agent-memory/`.
6. **`typedRoutes: true`** turns a dead internal link into a build error.

## 4. Quality gates

```bash
npm run lint        # ESLint, including the React Compiler rules
npm run typecheck   # next typegen && tsc --noEmit
npm run test        # Vitest — unit + component
npm run build       # production build
npm run test:e2e    # Playwright (builds and starts its own server)
```

`npm run check` runs the first three. All four must pass before a change is
called done.
