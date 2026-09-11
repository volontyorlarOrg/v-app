# The sidebar is the whole shell, and the record lives on the dashboard

**Date:** 2026-09-11

## Decision

The desktop top bar is gone. The navy sidebar (`shell` tokens) carries the
lockup, a user card that opens the account menu, the four main sections,
notifications as a row with the unread count, the theme switch as a row, and
sign out. On a phone a slim header (lockup, theme, bell, avatar) plus the
four-tab bar carry the same controls; the account menu also lists the
leaderboard there, because the tab bar is capped at four thumbs.

`/record` is no longer a section. It redirects to `/dashboard#history`; the
dashboard shows the four figures, the level rail and the participation history,
and "Your progress" leads to the leaderboard. The leaderboard opens on the
viewer's standing card (rank, experience, scoring), a podium of the top three,
and the ranked table from fourth place.

The palette kept its brand values (pinned by `design-tokens.test.ts`) and
gained vibrancy instead: a committed navy shell in both themes, navy-tinted
dark neutrals, and radial washes of the two hues on the surfaces that are the
volunteer's own.

## Why

The user asked for the top bar to go, the record to merge into the dashboard, a
podium leaderboard, and "different colour combinations than dull blue/white
and black/white" while keeping the brand pair.

## Consequences

- `AccountMenu` is a Radix popover holding a `nav` landmark named "Account
  menu"; the smoke test that clicks it now passes (it was a baseline failure
  when the menu was a Radix dropdown with `role="menu"`).
- The catalogs gained `nav.menuLabel`, `dashboard.progress.leaderboard`,
  `leaderboard.{count,podium,xpValue,scoring}`, `settings.{account,password,
  index,merge.title,merge.waitingCount}`, `profile.sections.about` and
  `profile.sectionHelp.*`; `record.{metaTitle,title,description}` and
  `dashboard.record.*` are unused and kept.
- Two smoke tests still fail for a pre-existing reason each (see the memory
  note on baseline failures); the podium test expects 23 table rows on page
  one, not 26.
