# "Closes today" depended on where the server was deployed

**Symptom.** A unit test asserting that a deadline at 23:00 was "closes today"
returned "closes tomorrow" on the developer's machine.

**Cause.** `date-fns`'s `differenceInCalendarDays` works in the **process**
timezone. A deadline at 23:00 Tashkent is one calendar day away from a UTC
process and zero from a Tashkent one.

This was not a test problem. It meant:

- the badge would differ between a server in UTC and one in Tashkent
- worse, a server-rendered badge could disagree with the client that hydrates
  it, since the browser's zone is the visitor's

**Fix.** [`src/lib/datetime.ts`](../../src/lib/datetime.ts) —
`calendarDaysBetween` collapses both instants to their calendar date in a fixed
zone (`EVENT_TIME_ZONE`, `Asia/Tashkent`) via `Intl.DateTimeFormat`, then
diffs. The same constant is next-intl's `timeZone`, so the "closes in N days"
badge and the formatted date beneath it cannot disagree.

**The general rule.** Any calendar-day comparison in this product goes through
`calendarDaysBetween`. Never `differenceInCalendarDays`, `startOfDay`, or
`.getDate()` — all three are process-local.

Tashkent is UTC+5 year-round with no DST, which is why test fixtures can use a
constant offset.
