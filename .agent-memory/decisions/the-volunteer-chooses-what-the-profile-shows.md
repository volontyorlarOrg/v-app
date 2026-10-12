# The volunteer chooses what the profile shows

**Date:** 2026-10-12

## Decision

The profile sheet has a fixed header and optional parts. The photo, name,
username, level, bio and the line of figures are always shown. Region, city,
school, year or grade, languages, phone, Telegram, Instagram, LinkedIn,
portfolio links, the joined date and the activity list are each one switch in
the "What others see" section of `/profile/edit`.

- **`/profile` is what others see.** A hidden part is absent from the
  volunteer's own sheet too, and one line at the foot names what is hidden and
  links to the switches. This replaces the earlier rule that nothing is marked
  private on the volunteer's own page: the data is still theirs to read and
  change in the editor, where every field keeps its value.
- **The backend removes hidden parts, not the interface.** `PUT /profile`
  stores `hiddenFields` and `GET /public/profiles/:username` answers a hidden
  part with its empty value, so `../v-web` and the in-app visitor page need no
  rule of their own. `joinedAt` is `null` when the joined date is hidden.
- **Hidden is not withheld from an application.** Organisers and
  administrators still read the full profile on an application the volunteer
  sends; the section's help text says so.
- **A form without the switches changes nothing.** The switches post only what
  is shown, so the form carries a `visibility` marker; the welcome flow saves
  through the same action without it and the stored choice is kept.
- **Activity replaced "Past events".** The profile lists attended events and
  past events together as "My activity" (six shown, the rest behind one native
  `details`), because a past event an organisation proposed and an
  administrator approved is no different to the volunteer from an event they
  attended through the platform. Outcomes other than attended stay on the
  dashboard's history and are never public.

## Why

Volunteers are mostly school students and the sheet is public by default. The
owner asked for the header to stay fixed and for everything under it to be the
volunteer's choice, without turning the profile into a settings screen.

## Consequences

Two controls on `/profile/edit` now share a visible name with a field (for
example "Year or grade"): tests select the field by its role.
