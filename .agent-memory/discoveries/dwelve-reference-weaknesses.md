# What to take from the Dwelve reference, and what not to

`DwelveOrg/app` is a mature Next.js 16 product and a genuinely good structural
reference. Read it for shape, not for stack.

**Worth copying — and copied here:**

- A single server-only backend client with Zod response validation, an explicit
  timeout, and a normalised error class.
- `next-safe-action` as the one client-triggered mutation boundary, with an
  `ActionError` that distinguishes user-facing from masked failures.
- A centralised query-key factory with no inline arrays.
- Route-local `_components` / `_lib` / `_types` beside the route.
- The documentation discipline: `AGENTS.md`, a `docs/README.md` context router,
  a source-priority list, and `.agent-memory`.
- Session refresh in the proxy, with its reasoning: Next only allows cookie
  writes in the action phase, so a Server Component render that refreshed would
  spend a single-use refresh token it cannot persist.

**Deliberately not copied:**

| Dwelve | Why not |
| --- | --- |
| Blanket `X-Robots-Tag: noindex` | Its whole product is private. YVC's opportunity pages are the acquisition funnel. |
| `i18next` client-only | Its own docs list "a server component has no `t`" as a constraint shaping its component API. `next-intl` removes it. |
| `react-toastify` | One toast system; the handoff names Sonner. |
| Filters in component state | Shareable URLs are this product's distribution channel. `nuqs`. |
| English strings from server actions | Untranslatable. Codes instead. |
| **No automated tests at all** | Its `AGENTS.md` states "There is no first-party automated test suite at present." The handoff calls fixing this mandatory. |

Its domain is schools, classes, and exams. None of that reasoning transfers —
in particular its "a user has no global role, authorisation comes from the
selected school membership" model has no YVC equivalent.
