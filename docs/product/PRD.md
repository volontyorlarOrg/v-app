# Product Requirements — Architecture Foundation

Status: the foundation described here is implemented. Anything requiring a
backend is implemented as far as the boundary and no further.

**Related:** [`../../PRODUCT.md`](../../PRODUCT.md) · [`DOMAIN_MODEL.md`](./DOMAIN_MODEL.md)

---

## Users

| Role                 | Exists                       | Notes                                                     |
| -------------------- | ---------------------------- | --------------------------------------------------------- |
| Volunteer            | Routes and flows implemented | The only role with an interface today                     |
| YVC administrator    | Reserved                     | `/admin` is on the private allowlist; nothing implemented |
| Partner member       | Reserved                     | `/partner` likewise; needs a permission model first       |
| Regional coordinator | **Not modelled**             | Exists operationally, not as a product workflow           |

## What ships

### Discovery — done

Public, indexable, server-rendered listing with URL-backed search, region,
format, open-only, sort, and pagination; loading, empty, and error states;
localised metadata with canonical and `hreflang`.

### Detail — done

Organiser, date, location, deadline, requirements, description, the questions
that will be asked, and a call to action that depends on session state. Readable
without JavaScript; a removed opportunity gets its own message rather than a
bare 404.

### Sign-in — boundary only

The Telegram flow's shape exists end to end (start route, complete route,
session write). It is marked unverified because no backend implements it. With
no session secret configured, `/login` says so plainly rather than showing a
button that cannot work.

### Profile — boundary complete

Full form, validation in three languages, explicit completion model. Reads and
writes go through the request layer; without a backend the page renders a
specific "not connected" state.

### Applications — boundary complete

Draft creation, generated per-opportunity validation, essay fields with idle
autosave and a visible save state, unsaved-changes protection, explicit submit
confirmation, withdrawal, and a status list. Same backend caveat.

### Volunteer record — boundary complete

Levels and reliability derived from one canonical module, with the
never-penalise-for-unconfirmed-attendance rule enforced and explained on screen.

### Partner and admin — not started

Deliberately. See [`../features/partner-review.md`](../features/partner-review.md)
and [`../features/admin.md`](../features/admin.md).

## Non-functional requirements

| Requirement                                                               | Status                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------ |
| Mobile-first, tested at 360/390px                                         | Done; E2E asserts no horizontal scroll                 |
| Three locales from day one                                                | Done; key parity and ICU arguments tested              |
| Public pages indexable, private never                                     | Done; enforced in four places and tested               |
| One server-only backend boundary                                          | Done                                                   |
| No tokens in browser storage                                              | Done; asserted in E2E                                  |
| Distinguishable error states                                              | Done; closed code set, one message each                |
| Automated tests                                                           | Done: 202 unit/component, 70 E2E                       |
| Accessibility: labels, focus, keyboard, reduced motion, non-colour status | Done                                                   |
| Analytics                                                                 | Not installed. Event taxonomy specified but not wired. |
| Error monitoring                                                          | Not installed. Needs a project and a scrubbing policy. |

## Out of scope until a workflow exists

Coordinator dashboards; courses; a generic job board; grants; internships;
messaging; a public share profile; reviews and ratings.
