# Levels are the backend's ladder of verified hours

**Date:** 2026-10-16

## Decision

A volunteer's level is a step on a ladder of verified volunteer hours —
Newcomer 0, Volunteer 10, Supervisor 50, Coordinator 100, Leader 250 — and the
backend owns it. `GET /record/progress` returns the hours, XP, the leaderboard
rank, the level, the next step and the whole ladder; this app keeps the keys,
their names and the arithmetic over a served ladder. The old events and
reliability ladder (newcomer, active, trusted, core) is gone from the app.

The dashboard was rebuilt around it from two user mocks: the greeting with the
level chip, "Next: …", a meter inside the current step and "View levels"
opening a dialog of every step; the pass with photo, name and level; one panel
of three linked figures; recent participation. The full history became
**My activity** at `/record`, a primary sidebar section.

## Why

The user's mocks define levels by verified hours ("Levels recognise verified
volunteering hours. Organisation roles are assigned separately."). The public
profile in `v-web` shows the level too, so a threshold copied into two
frontends would drift; served from the backend it cannot.

`/record` was chosen over `/activity` because `record` is already a reserved
username in this app and in the backend. A new top-level word would have
shadowed any volunteer who already owns that username at `/<username>`.

## Consequences

- The backend half is planned in
  `../v-backend/docs/plans/VOLUNTEER_LEVELS_IMPLEMENTATION_PLAN.md` on the
  `feat/volunteer-levels` branch, built by another agent. This app's branch
  must not reach production before `GET /record/progress` answers there.
- The mocks disagree: the dashboard mock says "Helper → Contributor, 13 hours
  to go", the dialog mock lists the ladder above. The dialog's complete ladder
  was built; renaming a step is the backend constant plus three catalogs.
- No green: "Verified" and "Reached" are orange (the person's achievement),
  "Awaiting verification" stays blue (a system state).
- `GET /record`'s own `level` is no longer read and is dropped from the schema,
  so the backend can delete it later.
