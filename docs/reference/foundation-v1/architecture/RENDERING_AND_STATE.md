# Rendering and State

Where the `"use client"` boundary goes, and who owns each piece of state.

`ARCHITECTURE.md` owns the request _plumbing_. This file owns the **ownership
decision** — which layer is responsible for a piece of state at all. Most
freshness bugs are ownership bugs: a panel fed by server props that no
invalidation can ever refresh, or a filter kept in `useState` that makes its own
URL meaningless.

---

## 1. Server by default

Add `"use client"` only when the component needs one of:

- `useState` / `useEffect` / `useRef`
- browser APIs (`matchMedia`, `localStorage`, `window`)
- event handlers
- TanStack Query hooks
- React Hook Form
- an interactive Radix primitive
- Motion

### Push the boundary down

A page that marks itself client-side to use one hook drags its whole subtree
into the bundle. The established shape:

```text
page.tsx                 Server — awaits params, fetches, picks a state
  <SomeView />           Client — owns interaction, forms, mutations
    <Surface> <Button>   Server-safe primitives render fine inside a client tree
```

**Server-safe** (no directive; work in either tree): `Button`, `Surface`,
`Badge`, `PageHeader`, `EmptyState`, `ErrorState`, `Skeleton`, `Pagination`,
`OpportunityCard`, `OpportunityStatusBadge`, `OpportunityDeadline`,
`ApplicationStatusBadge`, `VolunteerRecordCard`, `ProfileCompletionCard`.

**Client:** `Field`/`Input`/`Textarea`/`Select`, `OpportunityFiltersBar`,
`ApplicationForm`, `EssayField`, `ProfileForm`, `ConfirmDialog`, `NavLink`,
`LanguageSwitcher`, `SignOutButton`, `WithdrawButton`.

The opportunity list is the payoff: forty cards, three badges each, zero client
JavaScript. That page is what a Telegram link opens on a slow connection.

### One consequence worth knowing

Server components get `t` from `await getTranslations(...)`; client components
use `useTranslations`. Shared components therefore take **rendered strings**,
not translation keys — `EmptyState` and `ConfirmDialog` both do. Baking a key
namespace into a shared component makes it usable from exactly one place.

## 2. Ownership table

| State                               | Owner                       | Where                              |
| ----------------------------------- | --------------------------- | ---------------------------------- |
| Initial page data                   | Server Component            | `page.tsx` calls `*.api.server.ts` |
| Search / filter / sort / page       | **URL** via `nuqs`          | `OpportunityFiltersBar`            |
| Locale                              | URL segment via next-intl   | `src/i18n/`                        |
| Form values and validation          | React Hook Form + Zod       | see `FORMS.md`                     |
| Mutations                           | `next-safe-action`          | `features/*/actions.ts`            |
| Client-dynamic server reads         | TanStack Query              | `lib/query/`                       |
| Draft autosave status               | local hook state            | `use-autosave.ts`                  |
| Auth / session                      | server, HTTP-only cookie    | `lib/auth/`                        |
| Tiny UI state (a dialog being open) | local `useState`            | in the component                   |
| Shared client-only state            | **Zustand — not installed** | —                                  |

### Why Zustand is absent

Nothing in this product has needed it. Filters are URL state, forms are form
state, server data is server state, and everything left is local. Adding it
would create a place to duplicate server records into, which is the specific
anti-pattern the architecture forbids. Add it only when a genuine
cross-route client-only problem appears that is none of the above.

### Never mirror a server record into state to make it editable

`ProfileForm` takes `defaultValues` and owns a _draft_; the server owns the
record. That is why saving calls `form.reset(form.getValues())` rather than
writing the response back into a mirrored object.

## 3. Filters live in the URL

`/uz/opportunities?region=tashkent-city&sort=deadline&page=2` is a real
address. That matters more here than in most products: distribution _is_ people
pasting links into Telegram channels, and a filter kept in component state
makes every filtered view unlinkable.

- Parsing and serialising: [`features/opportunities/filters.ts`](../../src/features/opportunities/filters.ts)
- Reading and writing in components: `nuqs`, with `shallow: false` so the
  server re-renders, and `history: "replace"` so Back does not walk through
  every keystroke.
- Defaults are omitted from the query string, so one listing has one canonical
  URL rather than several that split its cache entries and SEO signals.
- Any filter change resets to page 1 — otherwise narrowing a search while on
  page 4 lands on an empty page that looks like "no results".

## 4. TanStack Query

Installed and provided, with a deliberately narrow remit: **client-dynamic
server state only.** Initial page data is fetched by Server Components, and
duplicating it into a query on mount would make every page pay for a second
round trip to display what it already rendered.

Conventions when you do reach for it:

1. One provider ([`lib/query/QueryProvider.tsx`](../../src/lib/query/QueryProvider.tsx)),
   with the client created in state — a module-scope client would be shared
   across requests on the server and leak one user's cache to another.
2. One key factory ([`lib/query/keys.ts`](../../src/lib/query/keys.ts)). No
   inline key arrays anywhere.
3. Every filtered or paginated key nests under an unfiltered ancestor, so a
   mutation can invalidate all variants without enumerating them.
4. Invalidation belongs to whoever owns the mutation.
5. `staleTime: 30s`, `refetchOnWindowFocus: false` — switching to Telegram and
   back is constant on mobile, and refetching each time is a refetch storm.
6. Retries respect `ApiError.isRetryable`; a 403 is never retried.
7. Mutations never auto-retry. A retried application submit is a double submit.

No polling and no real-time layer. These workflows tolerate 30–60 seconds of
staleness comfortably, and `revalidatePath` after a mutation covers the rest.

## 5. Freshness after a mutation

| Mutation           | What refreshes                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------- |
| Save draft         | Nothing. Called every few seconds; re-rendering the route would fight the editor for focus. |
| Submit application | `revalidatePath("/applications")` and the detail path, then `router.refresh()`              |
| Withdraw           | Same                                                                                        |
| Save profile       | `revalidatePath("/", "layout")` — the completion meter appears on the dashboard too         |
| Toggle saved       | `revalidatePath("/saved")`                                                                  |
