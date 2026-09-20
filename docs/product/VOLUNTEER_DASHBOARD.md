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

## The three decisions

The dashboard answers three questions a volunteer actually has, in urgency
order. Everything else has a stronger home in Opportunities, Notifications,
the Record, or the account pages.

| #   | Question                                     | Block                 | Data                                          | Loop step         |
| --- | -------------------------------------------- | --------------------- | --------------------------------------------- | ----------------- |
| 1   | What am I committed to next, when and where? | **Next up**           | accepted applications whose event is ahead    | attend            |
| 2   | What is happening with what I applied to?    | **Your applications** | three recent applications and draft deadlines | track status      |
| 3   | What improves my next application?           | **Your progress**     | level progress plus profile completeness      | improve and apply |

The hero greets the volunteer, states the current level and next requirement,
and offers one action: browse opportunities. Beside the greeting hangs the
volunteer's pass, the badge from the welcome flow, showing the parts their
profile has filled. Question 3 lives in the hero's band rather than in a
column of its own, so it is read first: the level rail and the next-level
meter on one side, the profile's six fields and its completeness meter on the
other, each with its one action. The figures below it are completed events,
reliability, recorded hours, and events awaiting confirmation.

Profile languages are chosen from a searchable list rather than typed: the
common languages of the region first, then every other language by name in
the interface language, found by typing its name in any of the three. They
are stored as ISO 639 codes and named from the `languages` catalog; a value
typed before the list existed is recognised where it can be and kept as it
was where it cannot.

Closing-soon and saved opportunities now live together on Opportunities.
Recent changes live in Notifications. This keeps the dashboard personal and
actionable instead of making it another catalogue.

## Rules the blocks obey

- **Reliability is honest.** It is hidden below three resolved events, and
  awaiting-confirmation events are shown as their own figure with the sentence
  "they never count against you", so the volunteer never reads an organiser's
  silence as their own absence.
- **The next level is an instruction, not a score.** "Three more confirmed
  events and you are Trusted" is something a person can act on; the sentence
  changes when the block is reliability or a recognition the team grants.
- **Deadlines are chips with words.** "Closes in 2 days" and "Closing soon"
  carry the urgency; there is no red.
- **Drafts are rare, and still the most useful row.** Applying to an
  opportunity without questions sends the profile at once, so a draft only
  exists for an opportunity that asks questions. It shows its deadline and a
  "continue draft" link, because an unsent application is the most common way
  a volunteer loses a place.
- **Orange marks what the person did** — the level, an acceptance, a
  confirmation, the record's figures, a complete profile — and nothing else.
- **A block with nothing in it is not drawn.** A volunteer with no
  applications and no history sees one panel, "Start with your first
  opportunity", that explains the loop in three steps (apply with the profile,
  get the place confirmed, attend and build the record) with a link to browse,
  instead of three panels that each say "nothing yet". After that, Next up
  appears only while an accepted event is ahead, and the history only once it
  has a row; Your applications then takes the full width. The four figures
  appear only once the record holds something — a volunteer with no accepted,
  resolved or attended event sees none of them.
- **The same rule holds everywhere else.** A panel or a row appears only when
  it says something or offers something: the attendance panel of an application
  waits for a result (until then its timeline step says "After the event"), a
  sent application's facts drop the deadline and the places, a remote
  opportunity does not repeat "Online" as its format, the application filters
  appear only when they can narrow the list, the profile's contact panel and
  figures show only what exists, and the account page hides the joining-accounts
  section while nothing waits.
- **Sample data says it is sample data**, in the hero and in the shell, and it
  never names a real partner or opportunity source as an organiser.

## What is deliberately absent

- **Stars, scores, rankings.** No formula exists that a volunteer agreed to.
- **Verified hours.** Hours are shown as recorded with a note until the backend
  defines what an hour means.
- **Notifications, messaging, an inbox.** Telegram already does this for the
  community; nothing is duplicated until a product decision exists.
- **Recommendations by skill.** "Near you" is the only personalisation, because
  region is the only profile field the sample can honestly match on.
- **Partner or coordinator views.** Different products, no permission model.

## The rest of the panel

The dashboard is a summary; every section behind it is built on the same mock
data so the panel can be judged as a product:

| Section       | What it shows                                                                                                                            | Real-panel behaviour on mock data                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Opportunities | Ten opportunities across seven regions and three formats                                                                                 | URL-backed search, region, format, sort and an open-only switch; cards with save toggles; a detail page with facts, requirements and the organiser's questions |
| Applications  | Five applications from draft to rejected                                                                                                 | Status groups in the URL; a detail page with a timeline, the answers, the profile snapshot, and the disabled continue or withdraw action                       |
| Saved         | A view inside Opportunities                                                                                                              | The same cards with the save toggle on; `/saved` redirects here                                                                                                |
| Record        | Lives on the dashboard: four figures, the level rail, the next-level meter and the history panel (`#history`); `/record` redirects there | Outcomes as chips, with the awaiting-confirmation rule stated                                                                                                  |
| Profile       | The full profile in three panels                                                                                                         | An editor that reports "saved in this preview only"                                                                                                            |
| Settings      | Notifications, privacy and appearance, account and access                                                                                | Three grouped panels with the real theme switch, language control, linked identities, and disabled destructive actions                                         |

## Where the data will come from

The backend's contract (`../v-backend/docs/api/FRONTEND_CONTRACT.md`) already
plans most of it. Each block maps to one server-only read once the plan's
session boundary exists:

| Block                 | Read                                                    | Status in `v-backend`          |
| --------------------- | ------------------------------------------------------- | ------------------------------ |
| Hero, record          | `GET /record` (counts, hours, standout flag)            | Planned                        |
| Next up, applications | `GET /applications` (with opportunity summaries)        | Planned                        |
| Closing soon          | `GET /opportunities?region=…&sort=deadline&status=open` | Planned; used by Opportunities |
| Profile               | `GET /profile`                                          | Planned                        |
| Saved                 | `GET /saved`                                            | Planned; used by Opportunities |
| Recently              | `GET /activity`                                         | Deferred from the dashboard    |

The level, the deadline state, the completion percentage and the upcoming
filter stay on the frontend, in the same modules the sample uses today.

## Open decisions

- Whether opportunity content is localized by the organiser or by the team,
  which decides whether `LocalizedText` survives the contract.
- Whether "near you" should widen to neighbouring regions when the home region
  has nothing closing soon.
- How a volunteer under the age the product decides for consent should be
  greeted, and whether a guardian sees anything.
