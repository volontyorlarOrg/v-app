# Domain Model

The concepts the interface organises itself around, and where each rule is
implemented. The persistence model is owned by `../v-backend/prisma/schema.prisma`;
the vocabulary here matches its enums so that the eventual contract needs no
translation layer.

## User and session

Global account identity. In the finished product it comes from the session and
nowhere else; today there is no session, and the shell shows the sample
volunteer's first name.

The backend models `User` with `roles` (`volunteer`, `partner`, `admin`), a
`TelegramIdentity`, `RefreshSession`s, and `AuthTicket`s. Email and Google
identities are not modelled yet; the implementation plan adds them.

## VolunteerProfile

The reusable half of an application: name, short bio, school, year, region,
city, languages, skills, phone, Telegram and Instagram usernames, LinkedIn
profile, and portfolio links. These profile fields are public while the public
profile is enabled. Deliberately absent: date of birth, home address, document
number, parent contact, and gender.

**Completion** counts nine fields — `fullName`, `bio`, `region`, `city`,
`school`, `gradeYear`, `languages`, `phone` and `telegram` — every field except
the photo, Instagram, LinkedIn and portfolio links, because "complete" means an
organiser can evaluate and contact you. Applying needs a complete profile and
a chosen username; the backend enforces it on starting and on sending an
application (`profileIncomplete` with the missing `fields`), and this is its
mirror. → `src/lib/profile/completion.ts`

## Opportunity

Title, organiser, region (one of the backend's fourteen), city, format
(`onsite` / `remote` / `hybrid`), status (`open` / `closed` / `full`), start and
end, application deadline, spots remaining. Titles and organiser names are
carried as localized text in the sample so the demo reads correctly in all
three languages; the backend will decide whether content is localized.

**Status is derived, not merely read.** An open opportunity whose deadline has
passed displays as closed, and one closing within three calendar days displays
as closing soon. → `src/lib/opportunities/deadline.ts`, `types.ts`

An approved opportunity may include a storage-backed `imageUrl`. The vacancies
tab shows it above the card content, and the detail page shows it below the
title. Opportunities without an image keep their text-only layout. A
coordinator revision temporarily hides the opportunity until renewed approval.

## Application

One volunteer's application to one opportunity, in one of `draft`,
`submitted`, `under_review`, `accepted`, `rejected`, `withdrawn`, `closed` —
the backend's `ApplicationStatus` enum. Three predicates replace scattered
comparisons: `isEditable` (draft), `isWithdrawable` (submitted, under review,
accepted), `isTerminal` (rejected, withdrawn, closed). An accepted application
whose event is still ahead is an **upcoming commitment**, which is what the
dashboard's first block shows. → `src/lib/applications/status.ts`

**Applying is one step when the profile is the whole application.** An
opportunity that asks no questions is applied to by `applyAction`, which
starts the application and sends it at once, so the volunteer lands on a
submitted application; there is no draft to find again or forget. An
opportunity that still carries questions keeps the draft step, because the
answers need a page of their own. A draft that exists anyway (sending failed
because the profile was incomplete, or an older application) is sent by the
same Apply button. A draft belongs to the volunteer alone: the coordinator and
administrator portals never list, count or open one.
→ `src/lib/opportunities/actions.ts`

**Each opportunity says how it accepts.** `acceptanceMode` is `manual` (the
organiser reviews every application) or `automatic` (the backend accepts a
sent application at once while places remain). The opportunity's facts say
which, and the Apply hint promises the place only when it is automatic. An
automatically accepted application has no review step in its timeline, and its
decision reads "Accepted instantly"; an organiser can still overturn it, which
then reads as an ordinary decision. The opportunity no longer has a short
description: `description` is the only text.

## VolunteerRecord and AttendanceRecord

Counts and the resulting level come from the backend — attended,
accepted-and-resolved, accepted-but-unconfirmed, and a standout flag — so
exactly one formula exists. Attendance has four outcomes (`attended`,
`excused`, `cancelled`, `awaiting_confirmation`), and the fourth is excluded
from reliability entirely. Hours are shown as recorded, not verified, until the
backend says otherwise. → `src/lib/record/levels.ts`

## Username and experience

Every account carries a public `username` — lowercase letters, digits and
underscores, 5 to 32 characters, unique — and the `source` that says where it
came from: `generated` by the backend, `custom` by the volunteer, or
`telegram`, imported from the connected identity. The Telegram value seeds the
username until the volunteer chooses a custom
one; after that, Telegram sign-ins do not overwrite it. The leaderboard shows
the public display name first and the platform username beneath it. →
`src/lib/account/username.ts`

`xp` is the experience a confirmed attendance earns. Its formula belongs to the
backend and appears nowhere on the frontend; so does a rank. Both are read from
`GET /leaderboard`, along with the reader's own standing, and rendered as they
arrive. → [`LEADERBOARD.md`](LEADERBOARD.md)

## SavedOpportunity

A bookmark. Opportunities includes a Saved view; the toggle arrives with the
opportunities section.

## Activity

A derived feed available to the notification model and future activity views:
attendance confirmed, application accepted, application submitted,
opportunity saved, level reached. The first, second and fifth belong to the
person and are marked in orange. There is no backend endpoint for it yet; the
plan proposes one. → `src/lib/activity/types.ts`

## Review / Rating

**Not modelled.** `standoutReviews` is a backend-granted boolean that gates
the `core` level; it is never computed on the frontend.
