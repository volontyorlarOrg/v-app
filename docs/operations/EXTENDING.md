# Extending the Application

How to add to this repository without breaking the guarantees it already makes.
Read [`../../AGENTS.md`](../../AGENTS.md) first for the rules; this page is the
mechanics. It mirrors the marketing site's page of the same name.

## Code conventions

**Source files carry no comments.** Explanations live in `/docs`, where they can
be found by someone who has not opened the file, reviewed as prose, and kept
current independently of the code. Names, types, and test names do the work
inside the source. Compiler and linter directives are not comments and stay.

## Add a section

1. **Register the route** in `src/lib/routing/routes.ts` with its area and
   whether it belongs in the sidebar's main list (`inNav`) and the phone tab
   bar (`inTabBar`). Routes in the volunteer area that are not `inNav` land in
   the sidebar's account list. The sidebar, the tab bar, the account menu and
   `routes.test.ts` all read from the registry; give it an icon in
   `src/components/app/route-icons.ts`.
2. **Add `nav.<key>`** to all three catalogs in `src/i18n/messages/`, plus a
   namespace for the page's own copy with at least a `metaTitle`, `title` and
   `description`.
3. **Create** `src/app/[locale]/(volunteer)/<path>/page.tsx` following the
   record page: `dynamic = "force-dynamic"` because it reads the backend per request,
   `generateMetadata` reading the catalog, a default export that awaits
   `params` and calls `setRequestLocale`, and a synchronous component that
   opens with `PageHeader` and composes `Panel`s.
4. **Keep it private.** Every response already carries `noindex`; a public
   route needs the per-route policy from the implementation plan first.
5. **Run the checks.** The tab bar is intentionally limited to four essential
   destinations; `routes.test.ts` says so.

A detail page under a section gets a dynamic segment (`[slug]`, `[id]`), an
href helper in the registry, `notFound()` for an unknown key, and is reached
only through that helper.

## Internal links: `navHref` vs `localePath`

| Helper                             | Returns                          | Use with                                                      |
| ---------------------------------- | -------------------------------- | ------------------------------------------------------------- |
| `navHref("dashboard")`             | `/dashboard`                     | `Link` from `@/i18n/navigation`, which adds the locale itself |
| `localePath("uz", "dashboard")`    | `/uz/dashboard`                  | Plain anchors, and anything outside the locale segment        |
| `marketingHref(locale, "privacy")` | `https://…/uz/privacy` or `null` | Links to the marketing site; render nothing when `null`       |

Passing a `localePath` result to the locale-aware `Link` produces `/uz/uz/…`.

## Add or change copy

Every user-facing string exists in `uz`, `ru`, and `en`. `src/i18n/messages.test.ts`
fails the build if a key or an ICU argument is missing from any catalog, if a
value is empty or looks like a placeholder, if Uzbek uses a straight apostrophe
where the turned comma `ʻ` (U+02BB) belongs, or if the Russian catalog stops
being Cyrillic. Uzbek plurals use `other` alone; Russian needs `one`, `few`,
`other`.

Proper nouns stay in code, not in the catalogs: the organisation name in
`src/lib/content/org.ts`. Opportunity titles and organisers arrive from the
backend in one language and are rendered as they arrive.

## Add a locale

1. Add the code to `locales` and a native label to `localeNames` in
   `src/i18n/routing.ts`.
2. Add `src/i18n/messages/<code>.json` with the full key set.
3. Add the code to `AUTH_LOCALES` in `v-backend`, or the Telegram ticket
   request will reject it.
4. Confirm the typefaces cover the script.

## Add a colour or token

Tokens live in the `@theme` block of `src/app/globals.css` and nowhere else,
and they are the marketing site's tokens. Change them there first, then copy;
this repository does not fork the palette. A product-only token (like
`--text-figure`) is added in the same commit as its dark value and its
assertion in `src/app/design-tokens.test.ts`. Before reaching for a colour,
check the named rules in `../../DESIGN.md`: ink carries weight, one blue does
every accent's job in three strengths (tint, fill, text), there is no second
hue and no red until the plan's error-colour decision is made. A label on a
fill uses the fill's pair — `ink-inverse` on `action`, `knockout` on `accent`
— because the primary button inverts in the dark theme.

## Add motion to a block

Use the existing `enter-rise` and `enter-words` sequence only for an authored
above-the-fold entrance. Panels and task content remain visible in server HTML
and never wait for an observer. Any loop pauses offscreen and when the document
is hidden, has a static reduced-motion alternative, and disposes its resources.

## Add a component

Server Components are the default. `"use client"` is justified by event
handlers, client state, browser APIs, or an interactive primitive, with the
boundary as low as possible. Client components receive translated copy from
their server parents. Shared action styling comes from `Button` and
`buttonClass`; solid actions use `action`, never `primary` or `primary-ink`.
Status is a `StateChip` with an icon and a word; provisional material is a
`StatusChip` with words.

Interactive primitives come from shadcn/ui. `npx shadcn@latest add <name>`
writes the registry source into `src/components/ui/`; edit it before use.
Remove the `tw-animate-css` classes (`animate-in`, `fade-in-0`, `data-open:`),
the `destructive` role and the `cn-*` utilities, and keep only colours that are
tokens or the aliases `globals.css` declares for shadcn's names. Do not let the
CLI rewrite `globals.css`: its oklch palette would shadow the brand tokens. A
component nothing uses is not added. A file that exports a `cva` contract a
Server Component calls (`toggle.tsx`, `badge.tsx`, `button.tsx`) must not
carry `"use client"`: a function from a client module cannot be called on the
server, and the Radix modules are already marked client on their own.

## Add a dashboard panel

Answer one question a volunteer has (see
[`../product/VOLUNTEER_DASHBOARD.md`](../product/VOLUNTEER_DASHBOARD.md)), give
the panel a domain rule under `src/lib/<domain>/` with a test, a read in
`src/lib/api/<domain>.server.ts` parsed by a schema in `src/lib/api/schemas.ts`
(with a fixture in `e2e/stub-backend.mjs`), add its copy to the three catalogs,
and compose it
with `Panel`. Lists inside a panel use `padding="none"` and rows with their own
padding. Decide whether it belongs in the main column or the aside by urgency,
and keep the order the same on every width.

## Add a switch or a control that writes

Use `Switch` from `src/components/ui/switch.tsx` controlled with `checked`
from `useOptimisticServerAction(value, action)` in
`src/hooks/use-server-action.ts`, which wraps the Server Action from
`src/lib/<domain>/actions.ts` in TanStack Query's `useMutation`, shows the
requested value while it is pending, and turns an `ActionResult` error into
`isError` — `PreferenceSwitches` and `SaveButton` are the patterns. A form gets
a Zod schema beside its FormData parser in `src/lib/<domain>/` that mirrors the
server's rules, then `useActionForm({ schema, defaultValues, action })` from
`src/hooks/use-action-form.ts`: React Hook Form validates on the client, the
form still posts to the Server Action through `useActionState`, and the
`ActionResult` renders through `ActionStatus` for errors and a Sonner toast for
a success that used to be a status line — `ProfileForm` is the pattern, and
`AnswersForm` shows two actions on one form. A control whose backing does not
exist yet is rendered `disabled` with a visible note, as the Google button is;
never one that looks live and does nothing.

## Link to something outside the application

Never hard-code an origin. The marketing site resolves through
`marketingHref`; the interface renders nothing while it is unset. Provider
buttons are links to the dashboard until their phase in the plan replaces them
with route handlers.

## Regenerate the API types

`npm run api:types` reads `../v-backend/docs/api/openapi.json` and rewrites
`src/lib/api/generated/schema.d.ts`. The backend writes that document with
`npm run openapi:generate`, which boots the Nest application and therefore
needs its Postgres and Redis. Commit the regenerated file; the response
contract stays the Zod schema in `src/lib/api/schemas.ts`.

## Add a dependency

The default answer is no. `docs/architecture/ARCHITECTURE.md` lists what was
removed, what `feat/ui-libraries` added and why, and what stays out. A new
dependency needs a concrete, implemented requirement, and the answer for a UI
primitive is a shadcn component on `radix-ui`, for a form React Hook Form and
Zod, for URL state `nuqs`, for a client-side mutation TanStack Query — not a
second library for the same job.

## Checks

```bash
npm run lint
npm run typecheck
npm run test
git diff --check
```

Add `npm run build` for build or deployment work, and `npm run test:e2e` when
routing, navigation, or the information architecture changes.
