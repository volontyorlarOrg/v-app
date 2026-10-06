# Checkpoints

A checkpoint is a milestone that pays XP once: "Complete your profile",
"Attend 3 events", "Volunteer 50 hours". The backend decides what is reached
and pays it; this app shows the list, celebrates a new one, and never decides
on its own that a checkpoint is reached. The backend side, the catalog and the
award rules are in
[`../../../v-backend/docs/architecture/CHECKPOINTS.md`](../../../v-backend/docs/architecture/CHECKPOINTS.md).

## Where a volunteer meets them

- **The dashboard** has a "Checkpoints" panel below the figures: how many are
  reached, the XP earned out of the XP available, and the next three open
  checkpoints with their progress. "See all" opens the page. When every
  checkpoint is reached the panel keeps the summary and says so.
- **`/checkpoints`** lists every checkpoint in five groups: Getting started,
  Applying, Events, Hours, Competitions. A reached checkpoint is orange (the
  person's colour) with its date; an open one with more than one step shows a
  meter ("4.5 of 10"). The route is registered with `section: "dashboard"`, so
  the sidebar keeps its three sections and the phone keeps its four tabs. The
  word `checkpoints` is reserved as a username in both repositories, so
  `/checkpoints` can never be read as a profile address.
- **The bell** shows `checkpoint.completed` notifications in the interface
  language ("Checkpoint reached" / "3 checkpoints reached", then
  "Complete your profile: +40 XP" or "+85 XP earned") and links them to
  `/checkpoints`. A notification naming only keys this build has no copy for
  falls back to the backend's English title and body.
- **A toast** celebrates a checkpoint the moment it lands. The volunteer
  layout passes `CheckpointToasts` the unread checkpoint notifications from the
  last five minutes, already localized; the component shows each id once per
  page load, remembered in memory only (no browser storage). Because every
  Server Action that can complete a checkpoint (saving the profile, the
  username, saving an opportunity, applying) ends with
  `revalidatePath("/", "layout")`, and the backend awards before it answers,
  the toast appears right after the action.

## How the data flows

| Piece               | File                                                                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read                | `src/lib/api/checkpoints.server.ts` → `GET /checkpoints`, cached per request                                                                                                |
| Contract            | `checkpointListSchema` in `src/lib/api/schemas.ts`. `key` and `group` are plain strings on purpose                                                                          |
| Domain rules        | `src/lib/checkpoints/checkpoints.ts`: the known keys and groups, `knownCheckpoints()` (drops anything this build cannot label), `groupedCheckpoints()`, `nextCheckpoints()` |
| Notification reader | `checkpointNotification()` in `src/lib/notifications/types.ts`                                                                                                              |
| Components          | `src/components/checkpoints/`: `CheckpointRow`, `CheckpointSummary`, `CheckpointsPanel`, `CheckpointToasts`                                                                 |
| Copy                | the `checkpoints` namespace and `nav.notifications.checkpoint` in all three catalogs                                                                                        |

`GET /checkpoints` also awards anything the volunteer has reached but not yet
been paid for, so opening the dashboard is enough to catch up after an
administrator recorded attendance.

**"Next up" picks** open checkpoints in catalog order and shows only the first
open tier of the events and hours series, so "Attend 3 events" is suggested
before "Attend 8 events", never both.

## Adding a checkpoint

1. Add it to the backend catalog.
2. Add its key to `CHECKPOINT_KEYS`, its icon to `CheckpointRow`, and
   `checkpoints.items.<key>.title` and `.body` to `en`, `uz` and `ru`.
3. Add it to the stub's `CHECKPOINTS` list in `e2e/stub-backend.mjs`.

Until step 2 ships, the new checkpoint is simply not listed. Nothing breaks,
because unknown keys are dropped rather than rejected.

## Testing

- Unit: `src/lib/checkpoints/checkpoints.test.ts`, the checkpoint cases in
  `src/lib/api/schemas.test.ts` and `src/lib/notifications/types.test.ts`, the
  route in `src/lib/routing/routes.test.ts`, and the "no username shadows a
  page" rule in `src/lib/profile/public-routing.test.ts`.
- End to end: the stub computes `GET /checkpoints` from the session's own
  state the way the backend does, and seeds one read `checkpoint.completed`
  notification. `e2e/smoke.spec.ts` covers the dashboard panel, `/checkpoints`
  and the bell entry.
