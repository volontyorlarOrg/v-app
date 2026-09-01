# Development and Deployment

---

## Requirements

Node 22.13+, npm.

## Setup

```bash
npm install
cp .env.example .env.local     # then edit
npm run dev
```

Open http://localhost:3000 — it redirects to `/uz/opportunities`.

**With no `YVC_API_BASE_URL`, set `YVC_ENABLE_SAMPLE_DATA=true`** or the
listing renders a "not connected" state. There is no backend yet; the sample
source is what makes local development and the E2E suite possible, and the UI
labels itself whenever it is active.

## Environment

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `YVC_API_BASE_URL` | server | production | Backend origin, no trailing slash |
| `YVC_SESSION_SECRET` | server | for any auth | ≥32 chars, random. Rotating it signs everyone out. |
| `YVC_ENABLE_SAMPLE_DATA` | server | dev/test | `true` serves sample opportunities |
| `NEXT_PUBLIC_SITE_ORIGIN` | public | production | Canonical origin for metadata and sitemap |

Never prefix a secret with `NEXT_PUBLIC_` — Next.js inlines those into the
browser bundle. An E2E test asserts the server-only names are absent from it.

Generate a secret: `openssl rand -base64 48`.

## Checks

```bash
npm run lint       # ESLint + React Compiler rules
npm run typecheck  # next typegen && tsc --noEmit
npm run test       # Vitest — unit + component
npm run build      # production build
npm run check      # the first three

npm run test:e2e   # Playwright — builds and starts its own server on :3100
```

First E2E run needs `npm run test:e2e:install`.

All four gates must pass before a change is called done. Exercise the affected
flow as well; code compiling is not evidence that it works.

## Test layout

| Kind | Where | Runner |
| --- | --- | --- |
| Unit | `src/**/*.test.ts` | Vitest |
| Component | `src/**/*.test.tsx` | Vitest + Testing Library |
| E2E | `e2e/*.spec.ts` | Playwright |

Component tests render with the **real** message catalogues
([`src/test/render.tsx`](../../src/test/render.tsx)), not a stub `t`. Half of
what they are for is catching a missing or malformed translation, and a stub
would hide exactly that.

E2E runs on a mobile and a desktop project. Mobile is not decoration — most
volunteers arrive from a Telegram link on a phone.

## Deployment

Vercel-shaped, though nothing is Vercel-specific. Set the four variables above;
`YVC_ENABLE_SAMPLE_DATA` must be **absent or false** in production.

Before a first production deploy:

1. Set `NEXT_PUBLIC_SITE_ORIGIN` to the real host — the sitemap and every
   canonical URL depend on it.
2. Confirm `/robots.txt` and `/sitemap.xml` list the intended host.
3. Re-run `e2e/privacy-and-indexing.spec.ts` against the deployed URL.
4. Decide the CSP (see `../architecture/AUTH_AND_SECURITY.md` §7).

## Troubleshooting

**`DYNAMIC_SERVER_USAGE` on a page.** It reads `cookies()` *and* exports
`generateStaticParams`. Remove the latter — see `.agent-memory/gotchas/`.

**Route types missing.** `npx next typegen`. `PageProps` and `LayoutProps` are
generated, not imported.

**Filter change does not re-render the list.** `nuqs` needs
`shallow: false` for a Server Component to re-run.

**A translation renders as its key path.** The key is missing from that
locale's catalogue. `npm run test` names it.
