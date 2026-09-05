# Volontyorlar App

The authenticated **Volontyorlar** product application: where a volunteer signs
in, keeps a reusable profile, applies to opportunities, and builds a
participation record.

This is not the marketing site — that is `../v-web`, and this repository
follows its codebase patterns and system design. The API lives in
`../v-backend`.

## Quick start

```bash
npm ci
cp .env.example .env.local
npm run dev
```

http://localhost:3001 redirects to `/uz/login`. Sign-in is Telegram: the
button hands off to the bot and the completion link writes the session cookie.
Everything behind it reads `v-backend`, so set `VOLONTYORLAR_API_URL` and
`VOLONTYORLAR_SESSION_SECRET` in `.env.local` (see
`docs/operations/DEVELOPMENT_AND_DEPLOYMENT.md`). Run `../v-web` on port 3000
at the same time and its "Log in" button points here through
`NEXT_PUBLIC_APP_ORIGIN`.

## Commands

| Command             | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Turbopack development server on port 3001                 |
| `npm run build`     | Production build                                          |
| `npm run start`     | Serve an existing production build on port 3001           |
| `npm run lint`      | ESLint                                                    |
| `npm run typecheck` | `next typegen && tsc --noEmit`                            |
| `npm run test`      | Vitest — unit and component                               |
| `npm run test:e2e`  | Playwright smoke suite (builds and starts its own server) |
| `npm run check`     | lint + typecheck + test                                   |

## What is here

- The two sign-in surfaces: log in and create an account, both with Telegram.
  Google renders disabled with a note; there is no email or password.
- A product panel: a sidebar and a minimal top bar with notifications and an
  account menu on desktop; a top bar and a four-tab bar on a phone.
- The dashboard: greeting and level, three figures, the next commitment,
  recent applications, and one progress panel for record and profile readiness.
- Every section on mock data: opportunities with URL-backed filters and detail
  pages, applications with status groups and a timeline per application,
  a saved Opportunities view, the record with a participation history, a profile editor, and
  settings full of switches for notifications, privacy, appearance and linked
  sign-in methods.
- The plan for making it real:
  [`docs/plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md`](docs/plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md).

## Where to read next

| You want                     | Go to                                                 |
| ---------------------------- | ----------------------------------------------------- |
| What the product is          | [`PRODUCT.md`](PRODUCT.md)                            |
| How to work in this repo     | [`AGENTS.md`](AGENTS.md)                              |
| The design system as applied | [`DESIGN.md`](DESIGN.md)                              |
| Everything else              | [`docs/README.md`](docs/README.md) — a context router |
