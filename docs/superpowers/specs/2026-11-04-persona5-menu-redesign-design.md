# Persona 5 menu redesign — design

## Intent

Rebuild hanek-software.com from scratch so it plays like the pause menu of Persona 5:
a red, black and white screen of tilted, oversized menu words that slam into full-screen
panels. The site is still a backend engineer's portfolio — the menu is the navigation, the
panels carry the existing content. It should feel like a game UI first and a CV second,
while still working as a CV (print, no-JS, screen readers).

## Goals

- Landing screen is the menu: Profile, Skills, Projects, Contact, plus CV (print/download).
- Selecting an item plays a P5-style slash/wipe and opens a full-screen panel; Back/Esc returns.
- Mouse, touch and keyboard (arrow keys + Enter, Esc) all drive it; URL hash per panel
  (`#profile`, `#skills`, `#projects`, `#contact`) so links and browser Back work.
- All current EN/PL content survives (projects, skills incl. AI agents, contact, Poznań clock).

## Non-goals

- No sound, no game logic, no characters.
- No framework (pure Astro + vanilla CSS/TS, per project rules).

## Anti-goals

- Using Atlus assets: no logos, game fonts, character art or verbatim game copy. Homage in
  CSS/SVG only.
- Content hidden or unreachable without JS, or a page Google/print sees as empty.
- Motion that can't be turned off (`prefers-reduced-motion` → instant swaps).

## Approach (chosen: menu-driven app)

Considered: (a) menu-driven app, (b) scrolling one-pager styled like game screens,
(c) hybrid menu-then-scroll. User picked (a). Implemented as progressive enhancement:
the HTML is a normal page (menu + all panels as sections); JS adds `.js` mode where only the
menu or one panel is visible at a time.

## Visual language

- Palette: P5 red `#e5001c` ground, black `#0d0d0d`, white `#fff`. One scheme only —
  light/dark toggle is removed (user chose to keep nothing visual).
- Shapes: skewed `clip-path` polygons for highlights and panels, halftone dot fields
  (CSS radial pattern), starburst and slash SVGs, thick black/white outlines via stacked shapes.
- Type: a heavy condensed display face (Anton, Google Fonts) for menu words and titles, set
  ransom-note style (letters in alternating black/white/red boxes, slight random rotation,
  generated deterministically at build time); Archivo for running text. Two faces total.
- Menu items: stacked right-of-centre, each at its own angle (-6° to -14°) and size; the
  focused item flips to white on a black jagged slab with a red echo, and scales up.

## Screens

- **Menu (landing):** red field, halftone, big ransom-note "Krystian Hanek" + "Backend
  engineer" (the `h1`); menu list; HUD corner with the live Poznań date/time in the game's
  calendar style (e.g. `11/04 WED — Evening`) — this is the page's one live thing; EN/PL switch.
- **Profile (About):** confidant-style card — name, "rank" = years in production, the about
  copy in a jagged white dialogue box, facts as a list.
- **Skills:** stat screen — the six headline skills as big slabs; the nine categories as
  a skill list, each row tagged Mastered / Learning (from existing `known`/`learning`).
  No invented numeric levels.
- **Projects:** request list — tilted rows on the left (6 projects), detail pane on the
  right (summary, description, highlights, tech, visit link). Phone: rows expand in place.
- **Contact:** calling-card styled panel — intro line, email, phone, location, Poznań clock,
  CV download/print.

## Kept / removed

- Kept: all copy (restructured where needed in `structure.json` + flat files), print
  stylesheet (rewritten so print shows every panel as a plain black-on-white CV), PDF resume.
- Removed: video hero and its files, Old Market Square photo, theme toggle, current
  Header/Hero/Footer components, `credits.json` if no found images remain.

## Constraints

- Astro 4, static output, EN `/` and PL `/pl`, all components take `lang`.
- i18n via `structure.json` + `*.flat.json` → `npm run i18n:build`.
- Taste-skill gate still runs; P5 deliberately breaks some house rules (decorative shapes,
  styled words, rotated text, few pictures). Each is passed with `--allow` and listed in the
  report — everything else (contrast, overflow, headings, focus) must pass.

## Left to the builder

- Exact polygon shapes, angles, timings; component split; seeded randomness for ransom letters;
  which game-like microcopy labels to use (EN + PL).
