# A `cva` contract in a `"use client"` file cannot be called on the server

`Segmented` is a Server Component and calls `toggleVariants()` for its link
classes. When `toggle.tsx` carried `"use client"` — copied from shadcn's
registry source — the production build rendered the opportunities and
applications pages into `PanelErrorBoundary` with a minified React #441, and
the server log said why: "Attempted to call toggleVariants() from the server
but toggleVariants is on the client." A function exported from a client module
is a client reference on the server; it can be rendered as a component or
passed as a prop, never invoked.

`next dev` did not reproduce it, so the gate that catches this is
`npm run build` plus a request to the page — the smoke suite, not the unit
tests.

The rule: a file whose `cva` variants are read by a Server Component
(`toggle.tsx`, `badge.tsx`, `button.tsx`) does not carry `"use client"`. The
Radix modules inside `radix-ui` are already marked client on their own, so a
file that only wraps them in classes does not need the directive either;
`"use client"` belongs to the files that own state or handlers (`switch.tsx`,
`sonner.tsx`, the menus).
