# YVC Product Application

The authenticated **Youth Volunteer Club** product: volunteers discover
opportunities, keep a reusable profile, apply, and build a participation
record.

This is not the marketing site — that is `volontyorlarOrg/v-web`.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

http://localhost:3000 redirects to `/uz/opportunities`.

There is no YVC backend yet, so `.env.example` ships with
`YVC_ENABLE_SAMPLE_DATA=true`. That serves a small set of clearly-labelled
**sample** opportunities so the interface and the tests have something to run
against; the UI displays a visible notice whenever it is active.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `start` | Production build and server |
| `npm run lint` | ESLint, including the React Compiler rules |
| `npm run typecheck` | `next typegen && tsc --noEmit` |
| `npm run test` | Vitest — unit and component |
| `npm run test:e2e` | Playwright (builds and starts its own server) |
| `npm run check` | lint + typecheck + test |

## Stack

Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS 4,
`next-intl` (Uzbek / Russian / English, server-rendered), React Hook Form + Zod,
`next-safe-action`, `nuqs`, TanStack Query, Radix, Sonner, `jose`.

## Where to read next

| You want | Go to |
| --- | --- |
| What the product is | [`PRODUCT.md`](./PRODUCT.md) |
| How to work in this repo | [`AGENTS.md`](./AGENTS.md) |
| Everything else | [`docs/README.md`](./docs/README.md) — a context router |

## State of the work

The architecture foundation is complete and verified: build, lint, typecheck,
202 unit and component tests, and 70 end-to-end tests all pass.

Public opportunity discovery works end to end. Everything requiring a backend —
sign-in, profiles, applications, records — is implemented up to the request
boundary and no further, against a contract documented as *proposed* in
[`docs/api/API_CONTRACT.md`](./docs/api/API_CONTRACT.md). The signed-in
end-to-end journeys are declared and skipped with their blocker named, rather
than mocked into passing.

Partner and admin surfaces are deliberately not started; they need a backend
permission model first.
