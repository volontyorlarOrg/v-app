# Milestones

The Milestones section at `/checkpoints` lists all 17 backend checkpoints in five
groups: Getting started, Applying, Events, Hours and Competitions. It is a primary
sidebar link and a phone tab. The existing `/checkpoints` URL remains stable.

Each row shows its requirement, progress and XP reward. Unfinished checkpoints
show their progress and an explicit unfinished state. Reached checkpoints show
"Ready to claim" and a "Claim XP" button. Claimed rewards show their claim date
and cannot be claimed again. XP is added only by the backend claim operation.

The summary shows reached checkpoints, claimed XP out of total catalog XP, and
XP ready to claim. The dashboard's Milestones panel prioritizes claimable rewards
before unfinished checkpoints, with one tier per event/hour series. "See all"
opens the complete list. The completed message appears once all rewards are claimed.

## Data and writes

- `getCheckpoints()` reads `GET /checkpoints` and parses `checkpointListSchema`.
- Items carry separate `completedAt` and `claimedAt` timestamps. List totals
  include `completed`, `claimed`, `xpEarned`, `xpAvailable` and `xpClaimable`.
- `claimCheckpointAction()` validates the key and calls authenticated
  `POST /checkpoints/:key/claim`, parsing `checkpointClaimSchema`.
- The claim button shows pending, success and translated retryable error states.
  Revalidating the root layout refreshes milestones, dashboard, profile and XP.
- The server rejects an unreached reward and derives identity from the session.
  Repeated requests return the same claim without paying twice.

`checkpoint.ready` notifications and recent toasts tell the volunteer to claim XP
in Milestones. Historic `checkpoint.completed` notifications retain their original
earned-XP copy. All copy is available in Uzbek, Russian and English.

The backend catalog and ledger rules are in
[`../../../v-backend/docs/architecture/CHECKPOINTS.md`](../../../v-backend/docs/architecture/CHECKPOINTS.md).
Already awarded rewards are preserved as claimed by the migration.

## Extending and verifying

Add catalog keys to `CHECKPOINT_KEYS`, their icons to `CheckpointRow`, and title
and body copy to all three catalogs. Clients drop unknown keys they cannot label.
Add new catalog entries to the E2E backend fixture.

Unit tests cover grouping, claimable-first suggestions, contract parsing and
navigation. The milestone browser flow checks all groups, reward claiming,
refreshed totals, claimed state and persistence after reload. The backend owns
eligibility, authorization, transactions, duplicate prevention and XP arithmetic.
