# MonexUp Home Redesign — Design Delivery Index

Design feature: **Home page redesign — Editorial Brutalist · Dark/Light Split**
Owner agent: ui-ux-pro-max-designer
Stack target: Vite + Tailwind + shadcn/ui (current app is CRA + Bootstrap + MUI — see `integration-guide.md`)

## Artifacts

| File                                                 | Purpose                                                                      | Skill of origin    |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------ |
| `tokens.css`                                         | Design tokens — primitives → semantic, with dark/light surface opt-in        | `design-system`    |
| `tailwind.config.snippet.js`                         | `theme.extend` block referencing the tokens for the future Vite project      | `design-system`    |
| `home-redesign.html`                                 | Static HTML/CSS mockup of the full redesigned home — open directly in browser | `ui-ux-pro-max`    |
| `component-spec.md`                                  | Per-section specs: composition, props, breakpoints, states, a11y notes       | `ui-ux-pro-max`    |
| `integration-guide.md`                               | Stack reality vs. target, section→component map, i18n notes, DoD             | `ui-styling`       |
| `README.md`                                          | This index                                                                   | —                  |

## Direction (named)

**Editorial Brutalist · Dark/Light Split.** Alternates dark surface (Header, Hero, Footer) with light surface (Features, Networks, Pricing, Users). Distinctive marks: variable-weight Space Grotesk display headline, orange glow CTAs, hero mesh gradient + faint grid, angular diagonal divider between dark and light bands, one inverted feature card breaking the grid rhythm.

## Palette (anchors)

- Brand orange — `#E85A1A` (logo anchor, accent on every surface)
- Dark surface — `#0A0A0D` graphite-900
- Light surface — `#FAFAF9` neutral-50
- Display type — Space Grotesk 600/700 (`-0.04em` tracking)
- Body type — Inter 400/500/600

## How to consume this delivery

1. Open `home-redesign.html` to review the visual direction.
2. Read `component-spec.md` for each section's contract (props/states/a11y).
3. When building the React version, follow `integration-guide.md` (start with the CRA→Vite migration).

## Hand-off

This delivery is design-only. Implementation in `.tsx` belongs to the React/frontend agent. Do **not** modify these artifacts during React work; if specs need changes, return to the design agent so tokens and specs stay the source of truth.
