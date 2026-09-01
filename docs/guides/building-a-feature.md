# Building a Feature

The repeatable path. Follow it in order; each step depends on the one before.

---

## 0. Before writing code

1. Read [`../README.md`](../README.md) and open only the documents your task
   actually touches.
2. Search [`../../.agent-memory/`](../../.agent-memory/) for the domain.
3. Check whether the backend contract exists. If it does not, say so in the
   plan — do not invent one. [`../api/API_CONTRACT.md`](../api/API_CONTRACT.md)
   is where assumptions get written down and labelled.
4. Check `docs/design/component-library.md` before creating a component.

## 1. Schema first

`src/features/<domain>/schemas.ts` — the shape, the enums, and the derivations.

- Validation messages are **keys**, not sentences.
- Export `z.input` _and_ `z.output` types if the schema uses `.default()`.
- Put derived rules here, not in JSX. "What counts as closing soon" has one
  definition.

## 2. Unit-test the derivations

Before any UI. These are cheap, fast, and the place real bugs live — the
timezone bug in `deadline.ts` was found this way, not in the browser.

## 3. Request functions

`src/features/<domain>/api.server.ts`, starting with `import "server-only"`.

- `publicApi` for unauthenticated reads, `authedApi` for everything else.
- Pass a `schema` — always. Unparsed backend JSON is untrusted.
- Never accept a `userId`; take it from the session.
- Return `null` for a "not found" that is an ordinary product outcome.

## 4. Mutations

`src/features/<domain>/actions.ts` with `"use server"`, built on
`authedActionClient`.

- `.inputSchema(...)` — the same schema the form validates against, so the
  server cannot be talked into accepting something the client would reject.
- `revalidatePath` for what actually changed. Not for an autosave.

## 5. Query keys, if the client fetches

Add to [`lib/query/keys.ts`](../../src/lib/query/keys.ts). Never an inline key
array. Nest filtered variants under an unfiltered ancestor.

## 6. Route

Pick the group by session requirement: `(public)`, `(auth)`, `(volunteer)`.

```text
feature/
  page.tsx        Server — awaits params, fetches, catches, picks a state
  loading.tsx     if the fetch is slow enough to matter
  _components/    route-local, until genuinely shared
```

If the route is public and should be findable, add its prefix to
`INDEXABLE_PREFIXES` in [`lib/routes/policy.ts`](../../src/lib/routes/policy.ts)
**and** export `robots` metadata. If it is private, do nothing — the policy is
closed by default.

## 7. Components

Server by default. Push `"use client"` down to the interactive leaf.

Reuse `Button`, `Surface`, `Badge`, `Field`, `EmptyState`, `ErrorState`,
`PageHeader`, `Skeleton`.

## 8. All four states

Content, loading, empty, error. `ApiErrorState` gets the message right per
code; do not write a generic one.

## 9. Copy, in three languages

Add to `en`, then `ru`, then `uz`. Not later — the parity test fails, which is
the point.

## 10. Test

- Unit: derivations, parsers, classifiers.
- Component: anything with an accessibility contract or a conditional message.
- E2E: add to `public-discovery` if it is public; to `privacy-and-indexing` if
  it changes what is reachable or indexable.

## 11. Verify

```bash
npm run check && npm run build && npm run test:e2e
```

Then exercise the flow at 360px and with the keyboard. Review `git diff`.
Never claim a behaviour works because the code was written.

## 12. Document

Update the owning document in the same change. If you discovered something
non-obvious that cost time, add a memory note — that is what `.agent-memory/`
is for, and it is not a progress log.

---

## Worked example: the opportunity filters

1. `opportunityFiltersSchema` + `activeFilterCount` — `schemas.ts`
2. `parseFilters` / `serializeFilters` / `withFilterChange` — `filters.ts`
3. `filters.test.ts` — 16 cases, including a hand-mangled URL from a chat app
4. `listOpportunities` passes them to the request
5. `OpportunityFiltersBar` reads and writes them via `nuqs`, `shallow: false`
6. The page parses `searchParams` server-side and renders
7. E2E: the filter reaches the URL, a shared URL reproduces the listing, and no
   parameter outside the whitelist ever appears
