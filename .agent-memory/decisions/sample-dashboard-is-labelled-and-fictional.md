# The sample dashboard says it is a sample, names no real organiser, and dates itself

There is no backend, so the dashboard renders `src/lib/sample/volunteer.ts`.
Three rules keep that honest:

1. **It says so on screen.** The hero carries the `StatusChip` "Sample data"
   and a sentence, and the three sign-in pages carry "Preview". These labels
   are removed by the phase of the plan that makes the thing behind them real,
   never before.
2. **No real organiser.** The partners and opportunity sources in
   `../v-web/src/lib/content/org.ts` are real organisations; putting a
   fictional event under their name would misrepresent them. Every organiser
   in the sample is invented, and `volunteer.test.ts` asserts it.
3. **Dates are relative to the request.** `tashkentInstant` places every
   event, deadline and activity a fixed number of Tashkent days from now, and
   the dashboard is `force-dynamic`, so the demo never shows a deadline that
   has passed. A prerendered dashboard would freeze the dates at build time.

The catalogue (`src/lib/sample/opportunities.ts`) covers every state the chips
know — open, closing tomorrow, closing soon, full, closed — across seven regions
and three formats, so the filters have something to narrow. Its counts agree
with the volunteer's record: the history has exactly five attended rows, one
awaiting confirmation, and hours that sum to the record's hours, and a test
holds that line so the numbers on the record page can never disagree with the
table beneath them.

The sample volunteer is deliberately mid-journey — active, two events ahead,
a draft with a deadline, one rejection, an unconfirmed attendance, a profile
missing one field — so that every block, every chip tone and every empty-state
rule has something to show and nothing has to be invented in JSX.
