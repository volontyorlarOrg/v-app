# Applying to a vacancy

A vacancy reaches this application only after an administrator approved it in
`v-admin`; `v-backend` filters every public read on `approvalStatus: approved`.
Nothing here decides whether a vacancy is visible. What this repository owns is
the volunteer's path through one: find it, check what it costs, apply, and
watch it to the end.

## The card is the whole vacancy, in one block

`src/components/opportunities/opportunity-card.tsx` is the only card. Discovery
and the dashboard both render it, so a vacancy looks the same wherever a
volunteer meets it. It carries the organiser and whether they are verified, the
availability chip, the deadline, the place, the event dates, the places left or
wanted, the estimated hours for the whole event, and — when the volunteer has
one — the state of their own application.

Its primary action is decided once, in `src/lib/opportunities/card.ts`:

| Situation                        | Action                | Goes to             |
| -------------------------------- | --------------------- | ------------------- |
| No application, still open       | View and apply        | the vacancy         |
| No application, closed or full   | View vacancy          | the vacancy         |
| A draft                          | Continue application  | the application     |
| Anything already sent            | Track application     | the application     |

A card never submits. It routes to the next step and the step happens there.

## The profile is the application

New vacancies ask no questions. `POST /applications/{id}/submit` snapshots the
profile instead, and refuses with `profileIncomplete` and a list of fields when
it is not ready. `src/lib/applications/readiness.ts` is the same rule in front
of it: full name, a bio, a region, a school, at least one language, and a phone
number or a Telegram username.

The vacancy page checks it before offering to apply: an incomplete profile is
told which fields are missing and sent to `/profile`, never to a button that
would fail. A complete one starts a draft and lands on the application.

## Check, confirm, then send

The draft is the check-answers step. `/applications/{id}` shows every field the
organiser will read, each with its own way back to `/profile`, and a
confirmation the volunteer has to tick before the submit control does anything.
Only then is the profile snapshotted, and the snapshot is what the page shows
from that moment: what was sent, not what the profile says today.

A vacancy that still carries questions — one created before the workflow — keeps
the old answers form. That path is a compatibility path, not a second design.

## The same page is the receipt and the tracker

After submission the application page is the durable confirmation: what was
sent, its reference, and what happens next. It never becomes a different page.
Its timeline runs the whole journey — submitted, under review, decision, event,
attendance — and `src/lib/applications/status.ts` decides each step's state from
the application, the event's own clock, and the attendance record.

An accepted volunteer also gets the public logistics of the event and, once it
has ended, the attendance the coordinator confirmed with the hours it was worth.
Nothing private is shown: there is no coordinator contact and no instructions
feature here.

## Withdrawing has a floor

`canWithdraw` allows it while the organiser still holds the application, and for
an accepted one only while the event has not started and attendance has not been
resolved. That mirrors `v-backend`, which refuses the same cases with
`applicationCannotBeWithdrawn`: a confirmed record is part of the volunteer's
history and withdrawing must not erase it. When it is refused the page says
which of the two reasons applies rather than hiding the control silently.
