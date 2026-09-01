# Volunteer Profile

Fill it once; every application reuses it.

**Code:** [`features/profile/`](../../src/features/profile/) ·
[`components/volunteers/`](../../src/components/volunteers/)

---

## The rule that shapes the schema

Collect the minimum that has a real product use. The audience includes minors,
so "we might want it later" is not a reason.

Present: name, bio, school, year, region, city, languages, skills, phone,
Telegram, links.

Absent on purpose: date of birth, home address, document number, parent
contact, gender, photo.

## Completion

Six fields count: `fullName`, `bio`, `region`, `school`, `languages`, and
_either_ contact channel. Either — not both — because requiring both would
force a volunteer without Telegram to hand over a phone number they had no
reason to give.

"Complete" means an organiser can evaluate and contact you. A portfolio link is
welcome and does not count toward it.

The meter uses a real `role="progressbar"` with `aria-valuetext`, so the value
is available without seeing the bar.

## Reusable data vs opportunity answers

Sharply separated. The profile is reused automatically. Application answers
are **never** pre-filled from a previous application — reuse is an explicit
per-field action. This is the single most important boundary in the product's
form design.

## Validation

Schema messages are translation **keys**, not sentences, because a schema
cannot call `useTranslations` and a hard-coded English message would be
untranslatable. Phone is E.164 with a general pattern rather than a `+998`-only
one, so a volunteer with a foreign number is not locked out. Telegram usernames
are rejected with the `@` sigil, since that is not part of the username.

Languages and skills are comma-separated text rather than a tag widget: a
custom chip input is a keyboard-accessibility liability, and a plain field with
a clear hint works for everyone, including a screen-reader user on a phone.

## Not implemented

Profile autosave (the form is short enough that explicit save is clearer, and
partial-profile semantics are undefined); avatar upload (no storage contract);
a public share profile (needs a privacy design first — it would be the first
indexable page containing personal data).
