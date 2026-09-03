# Danger is its own colour, not a reuse of brand orange

The logo specification gives two brand colours and assigns orange a specific
meaning: _the volunteer_ — "a confirmed hour, a level reached, a thank-you".

A product also needs an error colour. Three candidates were considered:

1. **Reuse orange.** Rejected: a withdraw button and a level badge would then
   share a colour, and orange stops meaning achievement the moment it also means
   "careful".
2. **No error colour; use weight and icons.** Rejected: destructive actions and
   failed saves genuinely need to be distinguishable at a glance, and an
   uncoloured "Withdraw application" reads as ordinary.
3. **One documented system colour.** Chosen: `danger` `#B3261E`, 6.54:1 on
   white, 6.54:1 for white-on-danger.

Worth knowing, and the reason this note exists: `danger` and `orange-deep` are
**1.26:1 against each other** — the same collision the specification identifies
between blue and orange. They are distinguishable by hue but not by luminance.

That is acceptable only because they never appear as alternatives in the same
control, and because both always carry an icon and a word. If a design ever puts
an achievement chip next to a danger chip as a choice, that assumption breaks.

Deadlines use `danger` inside the urgent window (today, tomorrow, or within
three days) and neutral otherwise. A closing deadline is "act now", not
"you achieved something".

See [[brand-blue-is-not-a-text-colour]].
