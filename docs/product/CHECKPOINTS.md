# Tasks

The Tasks section at `/checkpoints` holds one task: complete your profile and
claim 50 XP. Only the first 1,000 volunteers to claim it get it. It is a primary
sidebar link after the leaderboard and a phone tab. The URL keeps its old name,
and so do the code and the backend contract ("checkpoint", "milestone").

Until 2026-10-08 this section listed 14 milestones (saves, applications,
events, hours, competitions). They were removed; the backend no longer pays or
counts their XP, and this build drops any key other than `profile`.

## The task card

`ProfileTask` (`src/components/checkpoints/profile-task.tsx`) follows the design
mock, inside the panel rules, in three ruled parts:

- a header with the volunteer's photo in the orange ring the sidebar and the
  profile use (initials, then a person icon, when there is no photo), the serif
  title "Complete your profile", the reward "+50 XP" in the orange figure style
  and one sentence;
- two meters side by side (stacked on a phone): the profile in blue ("Your
  profile: 6 of 7 complete", a percentage, then "Still missing: …" or "Every
  required detail is filled in.") and the reward places in orange ("700 of 1,000
  rewards claimed", "Available while rewards remain.");
- a footer: "Claim once while rewards remain." with "Claim 50 XP" when ready or
  "Complete profile" (to `/profile/edit`) while fields are missing; "You claimed
  50 XP on …" once claimed; "All 1,000 rewards have been claimed." when places
  ran out. A paused launch gate disables the button and says so under it.

The first version also had a status band and a seven-row checklist; both were
removed on request to keep the card short. The mock's "Profile photo" item was
never rewarded: the reward follows the backend rule that gates applying, and a
photo is deliberately not rewarded because the audience includes minors.

`profileTaskChecklist()` in `src/lib/checkpoints/checkpoints.ts` groups the
eight required profile fields plus the chosen username into seven items (name;
username; Telegram; languages; region and city; school and grade; short
introduction) using the same `profileCompletion()` the profile meter uses; the
card counts them and names the missing ones. The places come from the backend's
`rewardLimit` and `rewardsRemaining` (`rewardPlaces()`); the frontend never
counts claims itself.

The dashboard's Tasks panel is one row of the same task: title, "+50 XP", the
state and the places line, and the claim button or "Complete profile". It is
hidden once the reward is claimed or no places remain.

## Data and writes

- The page reads `GET /checkpoints`, `GET /profile` and `GET /me` (for the
  username and the photo); any failure renders the load-error panel under the
  page header.
- `claimCheckpointAction()` validates the key and calls authenticated
  `POST /checkpoints/profile/claim`, parsing `checkpointClaimSchema`. The button
  shows pending, success and translated errors (`checkpointNotReached`,
  `checkpointRewardExhausted`, `checkpointClaimsUnavailable`). Revalidating the
  root layout refreshes the card, the dashboard and XP.
- The backend owns eligibility, the 1,000 places (taken when claiming, not when
  completing), authorization, transactions, duplicate prevention and XP.

`checkpoint.ready` notifications read "Reward ready to claim" with a link to
`/checkpoints#task-profile`, and switch to "Reward claimed" or "No profile
rewards left" as the backend restates them. Legacy `checkpoint.completed`
notifications are no longer listed by the backend. All copy is in Uzbek, Russian
and English.

The backend rules are in
[`../../../v-backend/docs/architecture/CHECKPOINTS.md`](../../../v-backend/docs/architecture/CHECKPOINTS.md).

## Verifying

Unit tests cover the reward lookup, the places arithmetic, the field grouping
and the notification parsing. The browser flow checks the locked card and its
missing-field line, completing the profile, the dashboard row, the notification,
claiming,
"701 of 1,000 rewards claimed" after the claim, persistence after reload, and
the sold-out state.

## Notification tray

The tray fits the viewport, has a close button, unread count, pending and error
feedback, and an explanatory empty state. Each destination is a full clickable
row with a category icon, date and explicit action. Opening a destination marks
that notification read. Mark-all tracks only the notifications included in that
request, so later arrivals retain their unread state.
