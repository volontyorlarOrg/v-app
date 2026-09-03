# The panel is a panel, not the marketing layout with different buttons

The first restructure reused the marketing site's page composition — a header
bar, a hero, hairline sections — and stubbed six sections with an "in
preparation" page. The maintainers rejected that: the product has to feel like
its own environment, with a real shell and real sections, even on mock data.

**What changed.** The shell became a sidebar plus top bar on desktop and a top
bar plus tab bar on a phone, on a flat `surface-sunk` workspace with bordered
panels. Every section was built: opportunities with URL filters and detail
pages, applications with groups and a timeline, saved, the record with a
history table, a profile editor, and settings with switches. The stub page and
the `implemented` flag on the registry went away because nothing is a stub.

**What did not change.** The tokens, typefaces, theme, motion system, catalog
layout, route registry and verification loop are still the marketing site's.
The doorway — the three sign-in pages — still stands on the dot-grid ground so
the two products read as one brand.

**Why panels and cards are allowed here** when `DESIGN.md` in the marketing
repository forbids bordered cards: a marketing page explains one idea per band
and a card would make six sentences read as a table; a panel answers seven
questions on one screen and needs edges to separate them. The rule "no box
inside a box" is what carries over: rows and hairlines inside a panel, never
nested cards.

**Honesty on mock data.** A control that cannot do its job yet is either local
state only (a switch, a save toggle, the profile form's "saved in preview") or
`disabled` with a `PreviewNote` beside it (apply, withdraw, connect, delete).
Never a button that looks live and does nothing.

See [[adopt-the-marketing-site-patterns]] and
[[sample-dashboard-is-labelled-and-fictional]].
