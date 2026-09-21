# The profile is one sheet

**Date:** 2026-09-21

## Decision

`/profile` is a single read-only sheet, `ProfileSheet`, and the public page at
`volontyorlar.uz/<username>` in `../v-web` draws the same sheet from the public
contract. Top to bottom: the avatar in its orange ring beside the one action,
the name as the `h1`, the handle and the level, the bio, one line of figures
from the record, then every detail the volunteer entered as a ruled row. The
washed cover, the band of three stat figures, the separate "How organisers
reach you" panel, the completeness panel, the "Profile complete" tick and the
"View public profile" and "Participation history" buttons are gone.

- **Every detail is a plain row.** Region, city, school, year or grade,
  languages, phone, Telegram, links, the public page address and the month
  the account was made each get a row when they have a value, and none when
  they do not. Nothing is marked private on the volunteer's own page.
- **One action.** The button beside the avatar reads "Complete profile" while
  a completion field is missing and "Edit profile" once none is, the same
  wording the dashboard uses; both go to `/profile/edit`.
- **Completeness is an edge, not a panel.** While the profile is incomplete a
  3px meter runs along the sheet's top edge with one sentence under it (the
  percentage and what is missing). It keeps the accessible name "Profile
  completeness" and disappears once the profile is complete.
- **Figures are a sentence, not a stat band.** Events, hours and reliability
  (reliability only once it is meaningful) read as "5 events 22 hours 83%
  reliability", with serif orange numerals. The wording lives in the catalog
  as plural messages with an `<n>` tag, so each language places the number
  itself (`надёжность 83 %`).
- **The public page address** shows host and path without the scheme, breaks
  after the host on a narrow sheet rather than truncating, and has a copy
  button; a hidden public profile says so and links to `/settings#privacy`.

## Why

On 2026-09-21 the user asked for the profile to be reworked with the
Impeccable skill: remove what is unnecessary, keep it concise, show every
piece of information (bio, username and so on), and use motion. Asked to
choose, they picked the single sheet over a lanyard-pass concept, every detail
visible as plain rows over marked-private rows or a public-only page, and a
motion library only where physics needs it. Nothing on the sheet needs springs
or drag, so `motion` was not added.

## Consequences

- Motion is CSS: the ring settles, the name rises word by word, rows draw
  their hairlines in, and `RollingNumber` rolls each digit from 0 over the
  real value, which stays in the text flow so the figure is correct at every
  moment and a screen reader hears it once. Reduced motion and print drop all
  of it (`animation: none`, not the global 0.01ms rule, because a zero-length
  animation would still sit in its delay showing zeros).
- The photo travels between `/profile` and `/profile/edit` with React's
  `<ViewTransition>` through `SharedElement`. The pair only forms when the new
  page commits in one frame, so "Edit profile", "Back to profile" and Cancel
  prefetch their routes; the `(volunteer)` loading boundary would otherwise
  commit a skeleton first. It also needs both photos on screen: React drops a
  shared element that has scrolled away, so Cancel at the foot of a long form
  cross-fades the page instead. No other navigation starts a view transition.
  Saving revalidates `/`, so a prefetched editor never outlives a change made
  in the same tab.
- The header row wraps: the avatar and the action share a line only when both
  fit, because "Редактировать профиль" beside a 96px avatar overruns a 320px
  phone. Handles break anywhere for the same reason.
- `ProfileIdentity` and the full `ProfileMeter` were deleted; the dashboard
  keeps `ProfileMeterSummary`. The `profile.identity`, `profile.stats`,
  `profile.overview` and `profile.completion.why` strings went with them.
