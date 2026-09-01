# Code Style

## The rule

**Source files carry no comments.** Explanation lives in `/docs`, in
`.agent-memory/`, or in the name of the thing being explained.

`npm run check:comments` strips any that reappear. It is safe to run at any
time: it uses the TypeScript compiler's own comment-range API rather than a
regex, verifies the file still parses before writing, and refuses to write a
file it would break.

The only exception is a **functional** directive — `eslint-disable`, `@ts-`,
`prettier-`, a shebang. Those are instructions to a tool, not prose. There is
currently one in the codebase, and the preference is always to restructure the
code so it is not needed.

## Why

The reasoning behind a decision has a longer life than the line of code it sits
above, and a different audience. A comment explaining why filters live in the
URL is read by whoever happens to open that file; the same paragraph in
`RENDERING_AND_STATE.md` is read by whoever is deciding where to put state
next — which is the person who needed it.

Comments also drift silently. A stale comment is worse than none, and nothing
fails when one goes out of date. A stale document at least sits under a heading
someone will eventually reread, and the source-priority list in `AGENTS.md`
tells a reader which to trust.

## What replaces a comment

| You wanted to write                       | Put it                                      |
| ----------------------------------------- | ------------------------------------------- |
| Why this approach and not the obvious one | `.agent-memory/decisions/`                  |
| A framework trap that cost you an hour    | `.agent-memory/gotchas/`                    |
| How this layer works                      | The owning document in `docs/architecture/` |
| What this product rule means              | `docs/features/` or `PRODUCT.md`            |
| What this function does                   | A better function name                      |
| What this branch handles                  | A named boolean or an early return          |
| Why this test exists                      | The `it(...)` description                   |

The last three are the common ones. Most comments are a naming problem:

```ts
const openA = canApply(a, now) ? 0 : 1;
```

needs no comment because `canApply` says what it checks. And a test named

```ts
it("does not award core without an explicit standout-review recognition", ...)
```

carries its own justification into the failure output, where it is most useful.

## Where the reasoning actually is

Every non-obvious decision in this codebase is written down. If you are looking
at a piece of code and cannot tell why it is that way:

| Code                                                          | Read                                                                                                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/api/client.server.ts`, `errors.ts`                       | [`ARCHITECTURE.md`](./ARCHITECTURE.md)                                                                                                       |
| `lib/auth/*`, `features/auth/*`                               | [`AUTH_AND_SECURITY.md`](./AUTH_AND_SECURITY.md)                                                                                             |
| `proxy.ts`, `lib/routes/policy.ts`, `robots.ts`, `sitemap.ts` | [`DOMAINS_AND_INDEXING.md`](./DOMAINS_AND_INDEXING.md)                                                                                       |
| `lib/safe-action.ts`, any form, `use-autosave.ts`             | [`FORMS.md`](./FORMS.md)                                                                                                                     |
| `lib/query/*`, filters, `"use client"` placement              | [`RENDERING_AND_STATE.md`](./RENDERING_AND_STATE.md)                                                                                         |
| `lib/design/palette.ts`, `globals.css`                        | [`../design/design-system.md`](../design/design-system.md)                                                                                   |
| `public/brand/*`, icons                                       | [`../design/brand.md`](../design/brand.md)                                                                                                   |
| `features/record/levels.ts`                                   | [`../features/volunteer-record.md`](../features/volunteer-record.md)                                                                         |
| `features/opportunities/*`                                    | [`../features/opportunities.md`](../features/opportunities.md)                                                                               |
| `lib/datetime.ts`                                             | [`../../.agent-memory/gotchas/calendar-days-are-timezone-dependent.md`](../../.agent-memory/gotchas/calendar-days-are-timezone-dependent.md) |
| Sample data                                                   | [`ARCHITECTURE.md`](./ARCHITECTURE.md) §6, [`../api/API_CONTRACT.md`](../api/API_CONTRACT.md)                                                |

## Formatting

Prettier owns it. `npm run format` writes, `npm run format:check` gates, and CI
runs the check.

`prettier-plugin-tailwindcss` sorts class lists in `className`, `cn()`, and
`cva()`, so class order is never a review topic.

## Naming

- Files: kebab-case. `opportunity-card.tsx`, `client.server.ts`.
- `*.server.ts` for a module that must never reach the browser. It also carries
  `import "server-only"` so importing it from a client component is a build
  error rather than a runtime surprise.
- `*.test.ts` / `*.test.tsx` beside the code, not in a parallel tree.
- Components: `PascalCase` export, one main export per file.
- Translation keys: `domain.section.item`, grouped by namespace.

## TypeScript

`strict`, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, and
`noFallthroughCasesInSwitch`.

- No `any` as an API-contract strategy. Backend JSON is `unknown` until a Zod
  schema has parsed it.
- Prefer a discriminated union over optional fields that are only valid in
  combination — `DeadlineState` is the pattern.
- `as const` for lookup tables, so the keys are checked rather than the values
  being widened to `string`.
- Exhaustive `switch` over a union with no `default`, so adding a case is a
  compile error at every site that must handle it.
