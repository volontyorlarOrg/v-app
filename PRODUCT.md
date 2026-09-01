# YVC Product Context

## Identity

**Youth Volunteer Club (YVC)** — founded 4 June 2025 by Arslon Rajabov and
Parizoda Abdurakhimova.

YVC helps young people in Uzbekistan discover and apply to meaningful
volunteering opportunities. It has grown past listing what other people
organise: the team now finds opportunities, contacts organisers, sources
events, builds partnerships, and supplies volunteers.

> **Naming.** The **wordmark is `volontyorlar`** — that is what the logo
> specification and every brand asset carry, and it is what the interface
> displays. The _descriptive_ name is still open: the product handoff says
> "Youth Volunteer Club (YVC)" and the marketing repository says "Youth
> Volunteering Community".
>
> The two are separated in the code. `brandWordmark` is a brand constant with
> the same value in all three catalogues; `appName` and `appShortName` are
> ordinary translated copy. Settling the descriptive name is a catalogue edit.
> See [`docs/design/brand.md`](./docs/design/brand.md).

## Known traction

Reported at handoff, not verified by this repository:

- 3,600+ Telegram followers; 220+ Instagram followers
- Volunteers supplied to 50+ events
- Partnership with the O'ZLIDEP Party
- Recognition from the Youth Affairs Agency, the Uzbekistan Volunteer
  Association, and the Republican Children's Library
- Regional expansion toward all 14 regions
- 500+ applications for regional project manager / coordinator roles

None of these organisations appear in the application's sample data. Fabricating
an event under a real partner's name would misrepresent them.

## The loop this product exists to serve

```text
Discover → understand → sign in → complete a reusable profile → apply using it
  → write opportunity-specific answers → save a draft → submit → track status
  → attend → attendance confirmed → the record improves → the next application
  is easier and more credible
```

The participation record is the moat. A directory of opportunities can be
copied in a weekend; a community with a verified attendance history cannot.

Every architectural decision in `docs/architecture/` should be readable as
serving some step of that loop. If a change does not, it probably belongs in
the marketing site instead.

## Scope

**In scope now:** volunteering opportunities — discovery, detail, application,
the reusable profile, and the participation record.

**Deliberately not yet:** partner dashboards, coordinator dashboards, courses,
a generic job board, a grant marketplace, or a social network. The architecture
leaves extension points; the product model stays centred on volunteering until
a real workflow says otherwise.

Organisations currently send opportunity details to the core team, who post
them. That is why partner self-service does not exist here.

## Volunteer levels

The canonical thresholds, implemented once in
[`src/features/record/levels.ts`](./src/features/record/levels.ts):

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
2. Reliability is not shown at all below three resolved events, because one
   absence out of two would read as a 50% score.

"Standout reviews" is not computable and there is no review system. `core` is
therefore reachable only when the backend grants an explicit recognition flag —
never by formula. See [`docs/features/volunteer-record.md`](./docs/features/volunteer-record.md).

## Audience and its consequences

Volunteers are young people, potentially including minors. This drives real
engineering constraints, not just a policy page:

- Collect the minimum. No date of birth, address, or document number — none has
  a stated product use.
- No personal data in URLs, analytics, or logs.
- No session tokens in browser storage.
- Private pages are never indexable or shared-cacheable.

See [`docs/architecture/AUTH_AND_SECURITY.md`](./docs/architecture/AUTH_AND_SECURITY.md).

## Relationship to the marketing site

|          | Marketing (`volontyorlarOrg/v-web`) | Product (this repository)                     |
| -------- | ----------------------------------- | --------------------------------------------- |
| Purpose  | Explain YVC, build trust, convert   | Operate the volunteering loop                 |
| Audience | Anyone                              | Volunteers, and later partners and admins     |
| Auth     | None                                | Session-based                                 |
| Indexing | Public                              | Per route — opportunities yes, accounts never |

Brand assets and the design token set are sourced from the marketing
repository so the two stay recognisably one product. Application functionality
never goes back into it.
