# The opportunities page is one toolbar and photo cards

**Date:** 2026-10-03

## Decision

The opportunities page follows a mock the user supplied: the title with an
outline "Applications" link and its count on the right, one toolbar row —
search, an All / Volunteering / Competitions switcher, region, and a "Saved
only" switch — and a grid of photo-first cards. The section tabs (All, Saved,
Applications) are gone from this page; the applications page keeps them.

Each card shows the vacancy photo at 2:1, the type chip and the bookmark over
it, the title and organiser, the start date and place, the deadline, and a
full-width "View details" link. The application's status chip sits beside the
title, as the mock's "Applied" badge does.

## Why

The user asked for the page to look like the mock and for the docs to follow.
Only the page's content was in scope, not the shell around it.

## Consequences

- The format, sort and open-only controls were removed because the mock has
  none. The URL parser still reads `format`, `open` and `sort`, so old links
  keep working and "Clear filters" can still remove them.
- "Saved only" toggles `?view=saved`; `/saved` still redirects there.
- Saved bookmarks on cards are filled orange. That extends orange's role
  ("the person") to a saved opportunity, since saving is the volunteer's own
  choice. The mock's orange volunteering chips and orange deadlines were _not_
  adopted: kind and deadline are system facts, so they stay blue.
- Hours and spots left moved off the card; the detail page's facts still show
  them.
- The page title stays the family's serif `PageHeader`; the mock's heavy sans
  title was not adopted, so the panel still reads as one product.
