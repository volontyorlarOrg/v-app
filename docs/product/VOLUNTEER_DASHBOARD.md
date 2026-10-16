# The Volunteer Dashboard

What a volunteer needs to see when they open the application, why each block
exists, and where its data will come from. This is the research behind
`src/app/[locale]/(volunteer)/dashboard/page.tsx`.

## Who opens it

A high-school student in Uzbekistan, on a phone, usually arriving from a
Telegram link, often between classes. They may be a newcomer with one draft
and no record, or an active volunteer with two events next week. They are not
an administrator and they are not browsing: the dashboard is where they check
on _their own_ volunteering, then leave.

## What it answers

Since 2026-10-16 the dashboard answers one question first — **how far has my
volunteering taken me?** — and then what needs doing. It was rebuilt from two
mocks; the plan and every departure from them are in
[`../plans/VOLUNTEER_LEVELS_DASHBOARD_PLAN.md`](../plans/VOLUNTEER_LEVELS_DASHBOARD_PLAN.md).

| Block                    | What it says                                                                                    | Data                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Hero**                 | "Hi, {first name}." over the level chip; "Next: {level}", a meter, "N verified hours to go"     | `GET /record/progress`                         |
| **Volunteer levels**     | Behind "View levels": every step, where it starts, which are reached, the hours to the next one | the same response's ladder                     |
| **Pass**                 | The volunteer's photo, name, role and level on a pass hanging from the hero's top edge          | `GET /me` (photo), the profile name, the level |
| **Figures**              | Verified volunteer hours, XP and the overall XP rank, each linking to where it comes from       | `GET /record/progress`                         |
| **Next up**              | Accepted events still ahead; drawn only while there is one                                      | `GET /applications`                            |
| **Tasks**                | The profile reward while it can still be claimed                                                | `GET /checkpoints`                             |
| **Recent participation** | The four latest events that have ended: result, hours, XP; a row opens its application          | `GET /record/history`                          |

The welcome-flow resume and "Add Telegram" sit under the hero while they apply.
A volunteer with no application and no history sees "Start with your first
opportunity" in place of recent participation.

A **level** is a step on the backend's ladder of verified hours (see
[`../../PRODUCT.md`](../../PRODUCT.md)); the meter measures the hours made
inside the current step, so 12 hours between the 10 and 50 hour steps is a
short bar, as in the mock. **XP** and **rank** are the leaderboard's own
numbers. Nothing on the screen is computed here except the meter's fill and
which step is reached, current, next or ahead.

## Rules the blocks obey

- **The next level is an instruction.** "38 verified hours to go" says what to
  do; the dialog says where each step starts, and that levels are not roles in
  an organisation.
- **Unconfirmed attendance never counts against anyone.** An event that has
  ended without verified results reads "Awaiting verification" with "Pending"
  for hours and XP; an accepted event still ahead is "Upcoming" and stays out
  of recent participation (it is in Next up). My activity carries the sentence
  that waiting results never count against the volunteer.
- **Orange marks what the person did** — the level, a verified result, the XP
  earned — and blue what the institution is doing: the meter, awaiting
  verification, the next step. There is no green.
- **A block with nothing in it is not drawn**, as before: Next up, the reward,
  recent participation and the prompts appear only while they say something.
- **Deadlines are chips with words**; there is no red.

## What is deliberately absent

- **Your applications.** They live on `/applications`, one link from
  Opportunities; the mock dropped the panel and the dashboard follows it.
- **Profile completeness.** The profile's own meter and the Tasks reward carry
  it.
- **Reliability.** It is no longer part of a level; the profile still shows it
  after three resolved events.
- **Scores made up here.** Levels, XP and rank all come from the backend.

## The rest of the panel

The dashboard is a summary; every section behind it is built on the same mock
data so the panel can be judged as a product:

| Section       | What it shows                                                                                | Real-panel behaviour on mock data                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Opportunities | Ten opportunities across seven regions and three formats                                     | One URL-backed toolbar — search, type, region and Saved only; photo-first cards with a bookmark; a detail page with facts, requirements and the organiser's questions |
| Applications  | Five applications from draft to rejected                                                     | Status groups in the URL; a detail page with a timeline, the answers, the profile snapshot, and the disabled continue or withdraw action                              |
| My activity   | Every event: upcoming, awaiting verification, verified, history only, and the other outcomes | `/record`, a sidebar section; `/dashboard`'s "View all" and hours figure lead there                                                                                   |
| Saved         | A view inside Opportunities                                                                  | The "Saved only" switch on Opportunities (`?view=saved`); `/saved` redirects here                                                                                     |
| Profile       | The full profile in three panels                                                             | An editor that reports "saved in this preview only"                                                                                                                   |
| Settings      | Notifications, privacy and appearance, account and access                                    | Three grouped panels with the real theme switch, language control, linked identities, and disabled destructive actions                                                |

## Where the data comes from

| Block                 | Read                                                                 | Status in `v-backend`                             |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| Hero, levels, figures | `GET /record/progress`                                               | Planned on `feat/volunteer-levels` (backend plan) |
| Recent participation  | `GET /record/history` (+ `applicationId`, `imageUrl`, `eventEndsAt`) | Implemented; the three fields are planned         |
| Next up               | `GET /applications` (with opportunity summaries)                     | Implemented                                       |
| Pass                  | `GET /me`, `GET /profile`                                            | Implemented                                       |
| Tasks                 | `GET /checkpoints`                                                   | Implemented                                       |
| Profile figures       | `GET /record` (counts, hours)                                        | Implemented                                       |

## Open decisions

- Whether opportunity content is localized by the organiser or by the team,
  which decides whether `LocalizedText` survives the contract.
- Whether "near you" should widen to neighbouring regions when the home region
  has nothing closing soon.
- How a volunteer under the age the product decides for consent should be
  greeted, and whether a guardian sees anything.
