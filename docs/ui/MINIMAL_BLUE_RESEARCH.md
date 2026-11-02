# Why this blue, this font, these corners

The research behind the November 2026 rework. It records what was tested and
what the sources say, so the next person changing a token can see what the
current value was chosen against. The values themselves live in
[`../../DESIGN.md`](../../DESIGN.md) and `src/app/globals.css`.

## The diagnosis

The rejected design was not one wrong hex. Blue was used as a **field** instead
of a **signal**: a navy sidebar, pale-blue pills, blue-tinted icon tiles, radial
washes on the workspace and hero, a dot grid, a navy dark theme, and orange
competing beside all of it. Measured in OKLCH, the blue itself leaned towards
green (`#005E92` at hue 243), which is why it read as petrol rather than blue.

## What the design systems do

| Source                | What it does                                                                                                                                                          | What was taken                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| IBM Carbon            | Blue is the action colour and neutrals dominate, with other hues kept rare. One value (`#0F62FE`) serves buttons, links, focus and selection.                         | One blue for action, link, focus and selection, on neutral ground. |
| Linear (2024)         | Moved its themes to LCH with three inputs, and deliberately reduced how much blue the app chrome carried. Inter Display for headings, Inter for the rest.             | Remove blue from the chrome. Inter with optical sizes.             |
| Radix Colors          | Pairs an accent with a grey tinted toward the same hue, warns against saturated greys as an app background in dark mode, and suggests white for the light background. | White canvas, barely tinted neutrals, a graphite dark theme.       |
| Vercel Geist          | Surfaces use 6 to 12px, menus and modals 12px, and 16px only for full-screen. Its shadows stay translucent.                                                           | A small radius scale that stops at 12px.                           |
| GitHub Primer         | Accent blue is reserved for links, selection, active and focus states, and borders come in a quiet default and a darker emphasis value.                               | Hairlines for structure, a 3:1 edge only on fields.                |
| Evil Martians         | OKLCH holds its hue where LCH drifts blue toward purple, and keeps lightness comparable across hues.                                                                  | Every token below was computed in OKLCH.                           |
| Marc Green, UXmatters | Short-wavelength blue focuses less sharply on the retina, so saturated blue is a poor choice for fine lines and text on dark grounds.                                 | Dark theme text blue is lifted and desaturated.                    |

Trust studies are weaker than they are usually quoted. A pilot study found blue
as the dominant colour produced the most trust, a Malta study found no clear
difference between blue and green, and one 2024 paper linked less saturated
backgrounds with more trust. Nothing here justifies a palette on psychology
alone; contrast and restraint carry the decision.

## The kinds of blue, measured

The first pass chose cobalt. On screen it felt like too sudden a jump from the old
design, so the choice moved to a calm blue halfway between the two (see below).

Candidates were rendered on the real dashboard beside the logo, in both
themes. Contrast is WCAG 2 against white.

| Kind           | Hex       | OKLCH                 | On white   | Verdict                                                  |
| -------------- | --------- | --------------------- | ---------- | -------------------------------------------------------- |
| Cerulean (old) | `#005E92` | 0.46 / 0.11 / 243     | 6.96:1     | Leans green; reads petrol at any size.                   |
| Azure          | `#046DCE` | 0.54 / 0.17 / 254     | 5.14:1     | Closest to the logo, but electric across a large area.   |
| True blue      | `#085DC7` | 0.50 / 0.18 / 258     | 6.18:1     | Good. A close second.                                    |
| **Calm blue**  | `#0F66AC` | **0.50 / 0.13 / 250** | **5.97:1** | **Chosen.** Left the green lean, kept the logo's family. |
| Cobalt         | `#1853C6` | 0.48 / 0.19 / 262     | 6.79:1     | First pick; too sudden a jump from the old design.       |
| Ink            | `#2141A8` | 0.42 / 0.17 / 266     | 8.80:1     | Formal; starts to read indigo beside the logo.           |
| Steel          | `#386695` | 0.50 / 0.09 / 251     | 6.00:1     | Dull, and an action looks disabled in it.                |

Reference points from other products, measured the same way: Apple `#0071E3`
(4.70:1, hue 256), GitHub `#0969DA` (5.19:1, hue 258), Google `#0B57D0` (6.39:1,
hue 261), IBM `#0F62FE` (5.00:1, hue 262), Tailwind `#1D4ED8` (6.70:1, hue 264).
The chosen blue is deep enough for one value to pass AA as both a fill behind white
text and as text on white, tinted and sunk surfaces, so no graphics-versus-text split
is needed in the light theme.

The vests in the app's own past-event illustrations sample at about `#1850A0`,
hue 258. Those images are labelled as AI-generated, so that is a pleasant coincidence
rather than evidence.

The logo keeps the kit's `#007FC2`. Its rules forbid recolouring it, and at hue 243
against 250 it reads as the same family.

### Why the calm blue won

Against the old screen, cobalt at hue 262 was 19° away and felt like a different
product. The final `#0F66AC` sits at hue 250: it has left the green lean that made
the old blue read as petrol, but stays in the logo's family (1.37:1 against
`#007FC2`, where cobalt was 1.56:1). White on it is 5.97:1, and as text it clears AA
on the sunk and soft surfaces at 5.41:1 and 5.26:1.

The same review softened the rest. Panels went back to white on a pale `#F5F7FA`
ground, `ink`, `ink-muted` and `border-control` returned to the previous design's
values, and the dark theme kept a slight blue cast instead of neutral graphite. Soft icon
tiles and orange text for what the person did came back, because removing them was itself
part of the abrupt change. Of three sidebars rendered next to the old navy (white, pale
blue, and a lighter dark blue), the user chose pale blue.

## The font, tested

Uzbek Latin writes `oʻ` and `gʻ` with U+02BB, a letter rather than punctuation,
so a face without it is broken for the default language. Each candidate was
loaded from Google Fonts and tested in a browser: does the family itself draw
the glyph, does `tabular-nums` work, and how does the real dashboard read?

| Family        | U+02BB `ʻ` | U+02BC `ʼ` | Cyrillic | `tnum` | Result                                                    |
| ------------- | ---------- | ---------- | -------- | ------ | --------------------------------------------------------- |
| **Inter**     | yes        | yes        | yes      | yes    | **Chosen.** Clean `koʻrish`, tight digits, optical sizes. |
| Onest         | yes        | yes        | yes      | yes    | Tabular `1` sits in a wide cell, so `12` reads as `1 2`.  |
| IBM Plex Sans | yes        | yes        | yes      | always | The turned comma is spaced apart: `ko ʻ rish`.            |
| Commissioner  | yes        | yes        | yes      | no     | No tabular figures for the tables.                        |
| Geist         | **no**     | yes        | yes      | yes    | Falls back mid-word in Uzbek.                             |
| Golos Text    | **no**     | yes        | yes      | yes    | Falls back mid-word in Uzbek.                             |
| Geologica     | **no**     | yes        | yes      | yes    | Falls back mid-word in Uzbek.                             |
| Rubik         | **no**     | yes        | yes      | yes    | Falls back mid-word in Uzbek.                             |
| Wix Madefor   | **no**     | **no**     | yes      | no     | Falls back on both letters.                               |
| Manrope       | **no**     | **no**     | yes      | yes    | Falls back on both letters.                               |

Inter is a common choice, and that was weighed against it. It won because it is
the only candidate that passes all three languages and the tables. Source Serif
was dropped rather than replaced: a second face adds nothing to a panel.

## Corners and spacing

- **Nested corners are concentric:** the inner radius equals the outer radius minus
  the gap. That is why the scale is 6 / 10 / 14 / 18: a menu at 14px holds a 10px row
  with 4px of padding.
- **The scale sits between the two extremes.** The old 20 to 28px with pill buttons
  made nested curves uneven. A first pass at 4 / 6 / 8 / 12 fixed that but felt harsh
  next to what people knew, so each step moved about halfway back.
- **Spacing sits on a 4px grid,** the convention Material and most of the systems
  above build on, with 2px kept for tight internals.
- **Target size is not density.** A control stays 44px on a touch screen and
  drops to 40 or 36px only under a fine pointer, so the phone path loses nothing.

## Sources

- [IBM Carbon: colour overview](https://carbondesignsystem.com/elements/color/overview/), [tokens](https://carbondesignsystem.com/building-blocks/foundations/color/tokens)
- [Linear: How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Radix Colors: understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale), [composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette)
- [Vercel Geist: colours](https://vercel.com/geist/colors), [materials](https://vercel.com/geist/materials), [typography](https://vercel.com/geist/typography)
- [GitHub Primer: colour usage](https://primer.style/product/getting-started/foundations/color-usage/), [primitives](https://primer.style/product/primitives/color/)
- [Evil Martians: OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [Stripe: designing accessible colour systems](https://stripe.com/blog/accessible-color-systems)
- [Marc Green: colour and legibility FAQ](https://visualexpert.com/Resources/cfaqPart6.html), [UXmatters: colour on digital displays](https://uxmatters.com/mt/archives/2007/01/applying-color-theory-to-digital-displays.php)
- Trust: [MWAIS 2007 pilot](https://aisel.aisnet.org/mwais2007/16), [University of Malta](https://um.edu.mt/library/oar/handle/123456789/25218), [ACP 2024](https://papers.iafor.org/wp-content/uploads/papers/acp2024/ACP2024_78678.pdf)
- [Concentric border radius](https://jakub.kr/work/concentric-border-radius)
