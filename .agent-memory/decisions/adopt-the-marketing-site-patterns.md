# The app follows the marketing site's patterns, not the Dwelve reference

In September 2026 the maintainers asked for this repository to share the
codebase patterns and system design of `../v-web`. The previous foundation had
been built from a Dwelve-inspired handoff with a different palette, a
per-namespace catalog layout, a heavier dependency set, and the retired `YVC`
name.

**What was adopted from `v-web`, verbatim where possible:** the `@theme` tokens
and the dark theme, Onest plus Source Serif 4, `src/lib/theme.ts` and the boot
script, the `Scene` / `SceneObserver` / `SmoothScroll` motion system, `buttonClass`,
the brand components, the locale switcher and theme toggle, one catalog per
locale with the parity test, a route registry that everything reads from, the
security headers module, the `AGENTS.md` / `docs/README.md` / `.agent-memory`
layout, and the verification loop.

**What is product-specific:** route groups `(auth)` and `(volunteer)`, the app
shell with a bottom tab bar, `Block` as the dashboard unit, `StateChip` for
statuses, the level rail and figures, the sign-in panel, and the sample
volunteer.

**What happened to the old foundation.** It was moved, not deleted, to
`docs/reference/foundation-v1/legacy/`, because the session cookie, the API
client, the Telegram route handlers, the schemas and the application form are
worth porting when the implementation plan reaches them. The dependency set
went with it; `zod` and `jose` return in Phase A, the rest only with a named
need.

**Why not keep both.** Two token sets, two catalog layouts, and two component
vocabularies in one product would have had every future change made twice.
The marketing site's system had already been through a production design
consolidation; the app inherits that work instead of repeating it.

See [[sample-dashboard-is-labelled-and-fictional]] and
[[planned-sections-render-instead-of-404]].
