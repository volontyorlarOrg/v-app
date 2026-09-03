# Volontyorlar Product Context

## What Volontyorlar is

Volontyorlar helps high school students in Uzbekistan discover and apply to
meaningful volunteering. It was founded on **4 June 2025** by **Arslon
Rajabov** and **Parizoda Abdurakhimova**. It finds volunteer opportunities,
contacts organisers, sources events, builds partnerships, supplies volunteers,
and builds regional operations toward all 14 regions.

The verified facts — traction figures, the one partnership, the supporters and
the opportunity sources — are owned by the marketing repository
(`../v-web/PRODUCT.md`, encoded in its `src/lib/content/org.ts`). This
application presents none of them as content of its own, and its sample data
never uses a real partner or source as an organiser.

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

Implemented once, in `src/lib/record/levels.ts`, and tested there:

| Level    | Qualification                                                       |
| -------- | ------------------------------------------------------------------- |
| Newcomer | Joined                                                              |
| Active   | 3 completed events                                                  |
| Trusted  | 8 completed events with at least 85% reliability                    |
| Core     | 20 completed events, at least 90% reliability, and standout reviews |

**Reliability** is the share of _resolved_ accepted events the volunteer
attended. Two rules follow from that word:

1. An event an organiser never confirmed is excluded from the calculation
   entirely. A volunteer is never penalised for someone else's inaction.
2. Reliability is not shown below three resolved events, because one absence
   out of two would read as a 50% score.

"Standout reviews" is not computable and there is no review system, so `core`
is reachable only when the backend grants an explicit recognition flag.

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

## Presented, not implemented

Sign-in with Google, Telegram, or email; the reusable profile; applications;
saved opportunities; the record and its confirmations; settings. All of it is
presented in this repository as interface and sample data, none of it is
connected, and this document is not evidence that any of it is live.

## Needs verification

- Production origin of this application and of the marketing site
- Google Cloud project and OAuth client ownership
- Telegram bot username and ownership
- Email delivery provider for verification and password reset
- Legal basis and consent handling for minors
