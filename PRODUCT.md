# Volontyorlar Product Context

## What Volontyorlar is

Volontyorlar helps high school students in Uzbekistan discover and apply to
meaningful volunteering. It was founded on **4 June 2025** by **Arslon
Rajabov**, co-founder and CEO, and **Abdulaziz Yusupaliev**, co-founder and CTO.
It finds volunteer opportunities, contacts organisers, sources events, builds
partnerships, supplies volunteers, and builds regional operations toward all 14
regions.

The verified facts — traction figures, the one partnership, the supporters and
the opportunity sources — are owned by the marketing repository
(`../v-web/PRODUCT.md`, encoded in its `src/lib/content/org.ts`). This
application presents none of them as content of its own. All volunteer data
shown behind sign-in comes from `v-backend`; the frontend has no sample or
preview mode.

## The loop this application exists to serve

```text
Discover → understand → sign in → complete a reusable profile → apply using it
  → write opportunity-specific answers → save a draft → submit → track status
  → attend → attendance confirmed → the record improves → the next application
  is easier and more credible
```

The participation record is the product's moat. A directory of opportunities
can be copied in a weekend; a community with a verified attendance history
cannot. The dashboard is the screen where a volunteer sees that loop from their
own side — see [`docs/product/VOLUNTEER_DASHBOARD.md`](docs/product/VOLUNTEER_DASHBOARD.md).

## Volunteer levels

A level is a step on a ladder of **verified volunteer hours**. The backend owns
the ladder and serves it with the volunteer's standing (`GET /record/progress`);
this app keeps only the level keys, their names in the three catalogs, and
`src/lib/record/levels.ts`, which checks that a served ladder is coherent and
works out where the volunteer stands on it.

| Level       | Starts at |
| ----------- | --------- |
| Newcomer    | 0 h       |
| Volunteer   | 10 h      |
| Supervisor  | 50 h      |
| Coordinator | 100 h     |
| Leader      | 250 h     |

Verified hours are the confirmed hours of attended volunteering, counted past
events and the team's hour adjustments. Competitions earn XP, not hours, and
nothing counts until results are verified, so an event an organiser has not
confirmed never holds a volunteer back. Levels recognise volunteering; they
are not roles in an organisation, which are assigned separately, and the
levels dialog says so.

XP is separate: it ranks the leaderboard and comes from hours, competition
placings, the profile reward and adjustments. The dashboard shows both.

**Reliability** — the share of _resolved_ accepted events the volunteer
attended — is no longer part of a level. The profile still shows it, under the
same two rules:

1. An event an organiser never confirmed is excluded from the calculation
   entirely. A volunteer is never penalised for someone else's inaction.
2. Reliability is not shown below three resolved events, because one absence
   out of two would read as a 50% score.

## Audience and its consequences

Volunteers are young people, potentially including minors:

- Collect the minimum. No date of birth, address, or document number.
- No personal data in URLs, analytics, or logs.
- No session tokens in browser storage.
- Every screen of this application is private and never indexable.

## System boundary

| `../v-web` (marketing)           | `../v-app` (this repository)                   | `../v-backend` (API)                       |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------ |
| Brand, positioning, public pages | Sign-in surfaces, dashboard, volunteer screens | Identity, sessions, data, authorisation    |
| SEO, structured data, legal      | Reusable profile, applications, record views   | Telegram bot, Google exchange, email flows |
| Links into the application       | Presentation of backend truth                  | Every rule that must hold server-side      |

## Languages

Uzbek (default), Russian, and English. Every user-facing string exists in all
three, and the language is carried by the URL, never by browser storage.

## Implemented boundary

Sign-in with Google, Telegram, or email and password; the reusable profile;
applications and drafts; saved opportunities; notifications; account settings;
the leaderboard; and the participation record are connected to `v-backend`.
OAuth buttons still depend on their providers being configured in the active
environment, and no local fallback fabricates a successful sign-in or product
data.

## Needs verification

- Production origin of this application and of the marketing site
- Google Cloud project and OAuth client ownership
- Telegram bot username and ownership
- Legal basis and consent handling for minors
