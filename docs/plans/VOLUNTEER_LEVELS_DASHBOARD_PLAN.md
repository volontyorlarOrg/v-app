# Volunteer levels and the progress dashboard

Planned and built 2026-10-16 on `feat/volunteer-levels` from two product mocks:
the redesigned dashboard and its "Volunteer levels" dialog. The backend half
is
[`../../../v-backend/docs/plans/VOLUNTEER_LEVELS_IMPLEMENTATION_PLAN.md`](../../../v-backend/docs/plans/VOLUNTEER_LEVELS_IMPLEMENTATION_PLAN.md)
(branch `feat/volunteer-levels` in `v-backend`), and the contract below is
copied from it. This app was built against that contract before the backend
existed, and the e2e stub implements it. The backend implemented it the same
day; real responses from it parse here, and the dashboard was checked live
against it on the development database.

## What the mocks ask for

| Mock                                                                                         | Built as                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Hi, Arslon." with the level chip, "Next: …", a meter, "N verified hours to go", View levels | `DashboardHero`: the greeting `h1`, the orange level chip, the next step and its meter from `GET /record/progress`, and the trigger for the levels dialog                          |
| The lanyard pass with photo, name, VOLUNTEER and the level                                   | `VolunteerPass`: drawn in HTML and CSS from `/me` (photo, name) and the level, hanging from the hero's top edge on its strap, with the logo's heart behind it                      |
| Verified volunteer hours · XP · Overall XP rank, each with an arrow                          | `ProgressFigures`: one panel, three linked cells — hours to My activity, XP and rank to the leaderboard (rank lands on the volunteer's own row)                                    |
| Recent participation: event, date, result, hours, XP, a chevron                              | `ParticipationTable` with the five most recent events that have ended; each attendance row opens its application                                                                   |
| "View all"                                                                                   | A new section, **My activity** (`/activity`), holding the whole history; `/record` now redirects there                                                                             |
| "Volunteer levels" dialog                                                                    | `LevelsDialog`: every step with its glyph, "Starts at N h" and Reached / Current level / "N h to go" / —, the next step's meter, and the note that organisation roles are separate |
| "My activity" in the sidebar                                                                 | A primary sidebar section between Opportunities and Leaderboard. Tasks stays; the phone tab bar keeps its five destinations                                                        |

## Where this build departs from the mocks, and why

- **The ladder** is the dialog's (Newcomer 0, Volunteer 10, Supervisor 50,
  Coordinator 100, Leader 250 h). The dashboard mock's "Helper → Contributor,
  13 hours to go" disagrees with it and is the only partial ladder; it is
  recorded as an open question in the backend plan. Names are catalog
  entries; thresholds only ever arrive from the backend.
- **No green.** The palette has two hues with a role each. "Verified" and
  "Reached" are a person's achievement, so they are orange like every
  confirmed attendance; "Awaiting verification" is a system state, so it is
  blue with the hourglass, as it already was.
- **The greeting keeps the serif `h1`**, the figures keep serif numerals, and
  the shell keeps its decisions: no top bar, the bell beside the lockup, the
  language on `/settings`.
- **Blocks that appear only when they have something to say stay**: the
  welcome-flow resume, "Add Telegram", the profile reward while it is
  unclaimed, and Next up while an accepted event is ahead. In the mock's state
  none of them would be drawn. **Your applications**, the profile-completeness
  cell, the four stat tiles, the level rail and the full history table leave
  the dashboard: applications live on `/applications`, completeness on the
  profile and in Tasks, the history on My activity.
- A competition's attendee placing keeps the catalog's existing wording
  ("Took part"), which the profile and the application page already use.

## Contract consumed

```ts
const levelStep = z.object({ key: z.enum(LEVELS), minHours: z.number().nonnegative() });

progressSchema = z.object({
  verifiedHours: z.number().nonnegative(),
  xp: z.number().int().nonnegative(),
  rank: z.number().int().positive().nullable(),
  level: z.enum(LEVELS),
  nextLevel: z
    .object({
      key: z.enum(LEVELS),
      minHours: z.number().nonnegative(),
      hoursToGo: z.number().positive(),
    })
    .nullable(),
  levels: z.array(levelStep).min(1),
}); // refined: ascending ladder from 0, unique keys, `level` on it,
// `nextLevel` exactly the step after `level` (null only on the last)
```

`participationEntrySchema` gains optional `applicationId`, `imageUrl` and
`eventEndsAt`. `publicProfileSchema.level` takes the new keys. `recordSchema`
drops `level`, which nothing reads any more.

## Files

| Area      | Change                                                                                                                                                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain    | `src/lib/record/levels.ts` becomes the level vocabulary plus the arithmetic over a served ladder (`levelSteps`, `nextLevelFraction`); the events/reliability formula leaves. `src/lib/record/participation.ts` decides each row's result and picks the recent rows. |
| Reads     | `getProgress()` in `src/lib/api/record.server.ts`; the shell, the dashboard, settings and the profile read the level from it.                                                                                                                                       |
| Routes    | `activity` in `src/lib/routing/routes.ts` (primary sidebar group, not in the tab bar); `historyHref()` points at it; `/record` redirects to it.                                                                                                                     |
| UI        | `src/components/ui/dialog.tsx` (Radix, shadcn shape); `src/components/levels/`; `src/components/dashboard/{dashboard-hero,volunteer-pass,progress-figures}.tsx`; `src/components/record/participation-table.tsx` replaces `history-table.tsx`.                      |
| Shell     | The `level.reached` notification kind maps to a localised title and body and opens the dashboard; `attendance.resolved` opens My activity.                                                                                                                          |
| Catalogs  | `levels` namespace; new `dashboard` hero, figures and participation keys; `record.level.*` renamed to the five keys; obsolete level-rail, tile and lead strings removed. uz, ru and en together.                                                                    |
| Stub, e2e | `e2e/stub-backend.mjs` serves `/record/progress`, the history fields, a `level.reached` notification and the new public level; the smoke suite covers the hero, the dialog, the figures, recent participation, My activity and the fresh-volunteer dashboard.       |

## States

- **Failed progress read**: the hero keeps the greeting and the pass and puts
  the retrying error rows where the level block was; the figures panel shows
  the same rows. Everything else stands.
- **Top step**: no meter; one sentence that this is the highest level.
- **No rank** (`rank: null`): the cell reads "—" with "Not ranked yet" and
  links to the leaderboard.
- **Nothing ended yet**: Recent participation is replaced by "Start with your
  first opportunity" while the volunteer has no application and no history;
  with applications but no ended event, the panel is not drawn.
- **Reduced motion**: the pass does not swing and the meters do not animate.

## Release

Merge order is in the backend plan: v-web, then backend phase 1, then this
branch. This branch must not reach production before `GET /record/progress`
answers there — the dashboard's level block and figures would show the
retrying error rows until it does.
