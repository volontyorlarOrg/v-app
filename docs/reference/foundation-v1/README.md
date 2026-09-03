# Foundation v1 — reference material

This folder holds the previous foundation of this repository, produced from
the agent handoff in `YVC_WEB_APP_AGENT_HANDOFF.md`: its documentation tree,
and its source under `legacy/`.

It is a **historical input, not a live specification.** The repository was
restructured in September 2026 to follow the marketing site's patterns
(`../../../AGENTS.md`), and the live documentation is the `docs/` tree above
this folder. Where this folder and the code disagree, the code and the live
docs win. It is excluded from TypeScript, ESLint, Vitest and Prettier.

## What is worth porting

The implementation plan
(`../../plans/AUTH_AND_DASHBOARD_IMPLEMENTATION_PLAN.md`) names these:

| Path under `legacy/` | Why it is still valuable |
| --- | --- |
| `src/lib/auth/session.ts`, `session.server.ts` | The encrypted JWE session cookie, `safeReturnPath`, and their reasoning |
| `src/lib/api/client.server.ts`, `errors.ts` | The single server-only fetch wrapper with timeout, request id, schema parsing, and coded errors |
| `src/app/api/auth/telegram/*` and `src/features/auth/telegram.ts` | The shape of the Telegram start and complete route handlers |
| `src/features/*/schemas.ts` | Zod schemas that already match `../v-backend`'s enums and contract |
| `src/features/applications/*`, `src/components/applications/*` | The application form, essay field, autosave, and withdraw flow |
| `src/components/volunteers/profile-form.tsx` | The profile editor |
| `e2e/privacy-and-indexing.spec.ts` | Assertions to restore once sessions exist |
| `docs/api/API_CONTRACT.md` | The proposed contract, labelled as proposed |
| `docs/architecture/*.md`, `docs/features/*.md` | Reasoning about forms, state, indexing, and each workflow |

## What was deliberately not kept

The dependency set (React Hook Form, Zod, `next-safe-action`, `nuqs`, TanStack
Query, Sonner, `jose`, Radix, `motion`, `date-fns`), the separate token
palette and contrast script, the per-namespace catalog layout, and the
`YVC` naming. Each returns, if at all, through a named phase of the plan.

Delete `legacy/` once the plan has ported what it needs.
