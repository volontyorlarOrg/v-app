# The library layer arrived in one decision

Until `feat/ui-libraries`, every interactive primitive here was hand-rolled:
three disclosures each carrying their own outside-click and Escape handling, a
switch with its own thumb maths, forms relying on native validation, a GET form
for the filters, and `useTransition` plus `useOptimistic` copied into three
components. The architecture page listed React Hook Form, `nuqs`, TanStack
Query, Radix and Sonner as "not until a phase names a concrete need". The need
was named once, for all of them, so future components take less effort to
build.

What came in, and against which component:

- **shadcn/ui on `radix-ui`** for the menus, the notifications popover, the
  switch, the withdraw dialog, the progress bars, the avatar. The registry
  sources are edited on arrival: no oklch palette, no `tw-animate-css`, no
  `destructive` role. `globals.css` aliases shadcn's names (`background`,
  `popover`, `muted`, `input`, `ring`, ...) onto the brand tokens; `accent` is
  deliberately not aliased because it is the orange brand token.
- **React Hook Form + `@hookform/resolvers` + `zod`** in front of the four
  forms. The schema lives beside the FormData parser in `src/lib/<domain>/`
  and mirrors the server's rules; the Server Action still validates and the
  form still posts through `useActionState`, so a browser without JavaScript
  keeps working.
- **`nuqs`** for the opportunity filters and the application group, on top of
  `parseOpportunityFilters`, which stays the single parser.
- **TanStack Query** as `useMutation` around the Server Actions behind a save
  button, a preference switch and "mark all read". No read moves to the
  client.
- **Sonner** for a saved profile and a saved draft; errors stay inline.
- **`openapi-fetch` + `openapi-typescript`** under `client.server.ts`, so a
  path autocompletes against the backend's OpenAPI document. The response
  contract stays the Zod schema.

What stayed hand-rolled, and why:

- `Segmented` stays links styled by `toggleVariants`: shadcn's toggle group is
  buttons with pressed state, and a filter must stay a URL.
- Selects stay native (`NativeSelect`): a phone opens its own picker, and the
  GET form still works without JavaScript.
- `Switch` keeps its labelled row and hidden form value around the Radix
  `SwitchControl`, so its test and the filters' `open=1` contract hold.
- The theme stays `src/lib/theme.ts`; `next-themes` is still out.

Still out, on purpose: `next-safe-action`, `next-themes`, `motion`,
`date-fns`, and any auth SDK.
