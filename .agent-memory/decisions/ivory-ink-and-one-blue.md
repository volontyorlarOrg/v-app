# Ivory paper, ink fills, one blue

The marketing site replaced its whiteboard — cool paper with a dot grid, blue
for the institution and orange for the person — with the register claude.com
and claude.ai use, blue standing where they put their terracotta. This
repository carries the same token set, so the panel changed with it. The full
reasoning is in `../v-web/.agent-memory/decisions/ivory-ink-and-one-blue.md`;
this note records what it meant for the product.

- **Orange left.** Everything that was "the person's" in orange — the level in
  the sidebar card, the record's figures, the reached nodes on the level rail,
  the "accepted" chip, the "attended" outcome, the decision node on an accepted
  timeline, a complete profile — moved to blue. The distinction between "the
  institution's" and "the person's" is now carried by strength, not hue: a
  tint (`accent-soft`) is a state the system owns or a selection, a fill
  (`accent`) is an achievement or the one next action, text (`primary-ink`)
  is the person's own figure.
- **The primary button inverts with the theme.** `action` is ink in the light
  theme and ivory in the dark, with an `ink-inverse` label. Every `bg-action`
  with a white label was audited: the notification badge, the switch track and
  the meters moved to `accent`; the timeline's done node moved to `bg-ink` with
  `text-ink-inverse`; the active segmented filter keeps `action` with
  `ink-inverse`; `::selection` uses `accent`.
- **The ground is flat.** The `body` dot grid and the workspace's radial
  backdrop are gone; the dashboard hero is a plain bordered panel and the
  orbit's core lost its glow. The sidebar sits on `paper` rather than white so
  the white panels are the only white on the screen.
- **The page title got a token.** `--text-page-title` (36–44px, serif,
  regular) replaced the ad-hoc `text-3xl sm:text-4xl` so the ramp in
  `DESIGN.md` covers every size the product sets.
- **The mark keeps `#007FC2`** through `brand`; every other blue is the derived
  family.
