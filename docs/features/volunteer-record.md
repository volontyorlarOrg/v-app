# Volunteer Record

The highest-trust data in the product. Treated accordingly.

**Code:** [`features/record/levels.ts`](../../src/features/record/levels.ts) —
the single canonical location for every threshold and formula.

---

## The rules

**Reliability** = attended ÷ accepted-and-resolved.

**Unconfirmed attendance is excluded from the denominator entirely.** An
organiser who never confirms is an organiser problem; counting those events as
"accepted but not attended" would silently push a reliable volunteer's score
down for someone else's inaction. The UI says this on screen wherever
unconfirmed events exist.

**Reliability is `null`, not 0, when nothing has resolved.** Zero would read as
"never shows up" — a false accusation against someone who simply has no
confirmed events yet. It is not displayed at all below three resolved events,
because one absence out of two is noise, not a 50% rating.

## Levels

| Level | Requires |
| --- | --- |
| Newcomer | — |
| Active | 3 completed events |
| Trusted | 8 completed events, ≥85% reliability |
| Core | 20 completed events, ≥90% reliability, **and** standout reviews |

"Standout reviews" is not computable and there is no review system, so `core`
is gated on a backend-granted boolean the frontend never infers. **`core` is
therefore currently unreachable — and that is correct.** A level that is
unavailable is better than one awarded by a formula nobody agreed to.

## Levels are derived on the frontend

The backend sends counts; the level is computed here. One formula, one place, a
threshold change is one edit — and a server-computed label can never disagree
with a client-computed one.

`levelProgress` distinguishes *why* the next level is out of reach: more events
needed, reliability below the bar, or a recognition that cannot be computed.
"Attend two more events" is an instruction; "your reliability is below 85%" is
not something more attendance alone fixes quickly.

## What is never displayed

Arbitrary stars. A composite score with no published formula. A ranking against
other volunteers. Hours as verified when the backend has not said they are —
they render with an explicit "recorded but not yet verified" note, because what
an hour means here is undefined.

## Tested

`levels.test.ts` pins every threshold and both protective rules — including
that 25 events at 96% reliability still is not `core` without the flag.

## Open

Whether hours are scheduled, confirmed, or adjustable. Who may confirm
attendance and whether a confirmation can be corrected. Whether reviews will
exist at all. Until answered, nothing derived from them ships.
