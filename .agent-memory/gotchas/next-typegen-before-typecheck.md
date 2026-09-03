# `tsc --noEmit` fails on a clean checkout without `next typegen`

`PageProps<"...">` and `LayoutProps<"...">` are generated into `.next/types/`.
On a fresh clone, or after deleting a route, a bare `tsc --noEmit` reports
"Cannot find name 'PageProps'" or stale errors pointing at files that no
longer exist.

`npm run typecheck` therefore runs `next typegen && tsc --noEmit`. If it
reports missing modules for routes that were just moved, delete `.next` and
run it again.

`tsconfig.json` excludes `docs/`, because the archived foundation under
`docs/reference/foundation-v1/legacy/` still contains TypeScript that imports
packages this repository no longer installs.
