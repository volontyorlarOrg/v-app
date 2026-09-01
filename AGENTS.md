# YVC Product Application — Agent Guide

## Project identity

This repository is the **authenticated YVC product**: where volunteers discover
opportunities, keep a reusable profile, apply, and build a participation
record.

It is **not** the marketing site. That is `volontyorlarOrg/v-web` — the source
of the brand assets and design tokens used here. Do not add marketing pages to
this repository, and do not add product functionality to that one.

Read [`PRODUCT.md`](./PRODUCT.md) for scope and [`docs/README.md`](./docs/README.md)
as a context router. Do not read every document for every task.

## The one thing to know first

**There is no YVC backend.** The marketing repository's own docs record it:
every domain concept is marked "Implemented here: No", and its Telegram section
reads "Implemented: Nothing."

So every `*.api.server.ts` module codes against a contract this repository
*proposes*, collected and labelled in
[`docs/api/API_CONTRACT.md`](./docs/api/API_CONTRACT.md). Consequences that are
deliberate and must not be quietly removed:

- Opportunity reads fall back to a **sample set** behind
  `YVC_ENABLE_SAMPLE_DATA`, and the UI says on screen when it is doing so.
- Authenticated pages render a specific "not connected" state.
- Signed-in E2E journeys are **declared and skipped with the blocker named**.

Do not delete a label, un-skip a test, or present an assumed contract as
verified because a page looks finished.

## Stack

Next.js 16 App Router · React 19 · strict TypeScript · Node 22+ · Tailwind 4
with repository-owned tokens · Radix + CVA · `next-intl` (uz/ru/en,
server-first) · React Hook Form + Zod · `next-safe-action` · `nuqs` · TanStack
Query · Sonner · `jose` · Vitest + Testing Library + Playwright.

Not installed, on purpose: Zustand, `@tanstack/react-table`, Sentry, analytics,
a second UI kit, a second schema library, Axios. See
[`docs/architecture/SYSTEM_DESIGN.md`](./docs/architecture/SYSTEM_DESIGN.md) §1.

## Repository map

```text
src/app/[locale]/      Routes. The root layout is here — locale is a root param.
  (public)/            Indexable: opportunity discovery and detail
  (auth)/              Sign-in
  (volunteer)/         Session-guarded
src/app/api/           Route handlers (redirects, cookie writes)
src/components/ui/     Primitives
src/components/shared/ Cross-domain
src/features/          Domain logic, schemas, requests, actions — no JSX
src/i18n/              Routing, request config, three message catalogues
src/lib/               api/ auth/ query/ routes/ forms/ datetime utils
src/proxy.ts           Next 16's renamed middleware
e2e/                   Playwright
docs/                  Stable engineering and product truth
.agent-memory/         Non-obvious decisions and gotchas — not a progress log
```

Keep route-specific implementation beside its route in `_components`, `_lib`,
`_types`, `_schemas`, `_hooks`.

## Critical rules

- **One backend boundary.** Components never call the API origin. Follow
  `client.server.ts` → a named function in `features/<domain>/api.server.ts` →
  a Zod response schema → a Server Component or a `next-safe-action` action.
  `YVC_API_BASE_URL` is server-only and must never reach the browser.
- **Backend JSON is untrusted** until a Zod schema has parsed it.
- **Identity comes from the session, never from a form.** No request function
  accepts a `userId`. The backend authorises every operation; hidden UI is not
  authorisation.
- **`next-safe-action` is the only client-triggered mutation boundary.**
- **Errors are codes, not sentences.** Actions return an `ApiErrorCode`; Zod
  schemas carry validation keys. Never render `error.message`.
- **Never collapse failures into "Something went wrong."** Use
  `ApiErrorState` or the translated `errors.<code>` entry.
- **Server components by default.** Push `"use client"` down to the interactive
  leaf.
- **Filters live in the URL.** Shareable links are this product's distribution
  channel.
- **Add copy to all three catalogues.** Uzbek is Latin, Russian is Cyrillic.
  The parity test fails otherwise, which is the point.
- **Indexing is per route** and closed by default
  ([`lib/routes/policy.ts`](./src/lib/routes/policy.ts)). Opportunity pages are
  indexable; anything showing a person's data never is. Do **not** apply a
  blanket noindex — that is the marketing repo's policy, not this one.
- **Reputation is high-trust data.** Every level threshold lives in
  [`features/record/levels.ts`](./src/features/record/levels.ts). Never
  duplicate a formula into JSX, never invent one, and never penalise a
  volunteer for an organiser's unconfirmed attendance.
- **Application answers are never pre-filled from a previous application.**
- **Tokens only.** No arbitrary colour, radius, or font. Status is never
  communicated by colour alone.
- **Minimum personal data.** No PII in URLs, analytics, logs, or browser
  storage. The audience includes minors.
- Do not add a dependency without checking the existing stack first.

## Default loop

1. Read this file; use `docs/README.md` to pick only the relevant documents.
2. Search `.agent-memory/` for the domain.
3. Inspect the current implementation, its callers, schemas, and contract.
4. Plan, then implement, keeping the change coherent across UI, schemas,
   actions, translations, and invalidation.

Before declaring completion:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e     # when routes, policy, or public behaviour changed
```

Also exercise the flow at 360px and with the keyboard, and review `git diff`.
**Never claim a behaviour works because the code was written.** If a check did
not run, say so.

Update the owning document in `/docs` in the same change as the behaviour.
Record a memory note only for a non-obvious decision, a limitation, or a
discovery that cost real time.

## Source priority

Executable code; current configuration and schemas; this file; current `/docs`;
`.agent-memory`; historical plans and handoffs. Documentation may describe an
invariant the code is violating, so resolve a conflict rather than deleting one
side of it.

## Git and security

Work on a focused branch, not `main`. Preserve unrelated working-tree changes.
Never commit secrets, `.env.local`, or user data. Treat session, indexing
policy, and reputation changes as high risk.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
