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
city, languages, skills, phone, Telegram username, links. Deliberately absent:
date of birth, home address, document number, parent contact, gender, photo.

**Completion** counts six fields — `fullName`, `bio`, `region`, `school`,
`languages`, and _either_ contact channel — because "complete" means an
organiser can evaluate and contact you. → `src/lib/profile/completion.ts`

## Opportunity

Title, organiser, region (one of the backend's fourteen), city, format
(`onsite` / `remote` / `hybrid`), status (`open` / `closed` / `full`), start and
end, application deadline, spots remaining. Titles and organiser names are
carried as localized text in the sample so the demo reads correctly in all
three languages; the backend will decide whether content is localized.

**Status is derived, not merely read.** An open opportunity whose deadline has
passed displays as closed, and one closing within three calendar days displays
as closing soon. → `src/lib/opportunities/deadline.ts`, `types.ts`

## Application

One volunteer's application to one opportunity, in one of `draft`,
`submitted`, `under_review`, `accepted`, `rejected`, `withdrawn`, `closed` —
the backend's `ApplicationStatus` enum. Three predicates replace scattered
comparisons: `isEditable` (draft), `isWithdrawable` (submitted, under review,
accepted), `isTerminal` (rejected, withdrawn, closed). An accepted application
whose event is still ahead is an **upcoming commitment**, which is what the
dashboard's first block shows. → `src/lib/applications/status.ts`

## VolunteerRecord and AttendanceRecord

Counts come from the backend — attended, accepted-and-resolved,
accepted-but-unconfirmed, and a standout flag — and the level is derived here
so exactly one formula exists. Attendance has four outcomes (`attended`,
`excused`, `cancelled`, `awaiting_confirmation`), and the fourth is excluded
from reliability entirely. Hours are shown as recorded, not verified, until the
backend says otherwise. → `src/lib/record/levels.ts`

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
