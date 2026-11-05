# Persona 5 Menu Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scrolling portfolio with a Persona 5–style pause menu that opens full-screen panels (Profile, Skills, Projects, Contact) in EN and PL.

**Architecture:** One static page per locale renders the menu plus every panel as ordinary sections (works without JS and in print). A small router script adds app mode: only the menu or one panel is visible, chosen by `location.hash`, with slash-wipe transitions and keyboard control.

**Tech Stack:** Astro 4 (static), vanilla CSS custom properties, TypeScript in Astro `<script>`, Google Fonts (Anton + Archivo).

**Spec:** `docs/superpowers/specs/2026-11-04-persona5-menu-redesign-design.md`

## Global Constraints

- Pure Astro components, no frameworks, no Tailwind; every component takes `lang: string`.
- Copy lives in `src/i18n/structure.json` + `en.flat.json` + `pl.flat.json`; run `npm run i18n:build`; never hand-edit `en.json`/`pl.json`.
- Palette: red `#e5001c`, black `#0d0d0d`, white `#ffffff`. One scheme, no theme toggle.
- Fonts: Anton (display), Archivo (text). No Atlus fonts, logos, art or verbatim game copy.
- Panel ids / hashes: `profile`, `skills`, `projects`, `contact`. Menu is the empty hash.
- `prefers-reduced-motion: reduce` → no travel or wipes, instant swaps.
- No commits unless the user asks (user rule overrides the skill's commit steps).

## Review Focus

1. Deep link to `/#projects` (and `/pl#contact`) on first load → opens that panel directly, Back returns to menu.
2. Browser Back/Forward between panels → visible screen follows the hash, focus lands on the panel heading.
3. JS disabled → every panel visible as a normal page, menu links jump to sections.
4. Phone width 390px → menu words and project list fit without horizontal overflow; panel scrolls internally.
5. Print → all panels printed as plain black-on-white CV, menu chrome and decorations hidden.

Each is checked in Task 7 with Playwright.

---

### Task 1: Copy and i18n keys

**Files:** Modify `src/i18n/structure.json`, `src/i18n/en.flat.json`, `src/i18n/pl.flat.json` (then regenerate `en.json`, `pl.json`).

**Produces (keys later tasks read):**
- `menu.profile|skills|projects|contact|cv` — menu words (EN: Profile, Skills, Projects, Contact, CV; PL: Profil, Umiejętności, Projekty, Kontakt, CV).
- `menu.label` (nav aria-label), `menu.back` ("Back"/"Wróć"), `menu.hint` ("Arrows to move, Enter to open"/"Strzałki — wybór, Enter — otwórz").
- `menu.phases.morning|daytime|afternoon|evening|night` — HUD time-of-day words (PL: Rano, Dzień, Popołudnie, Wieczór, Noc).
- `profile.rankLabel` ("Rank"/"Ranga"), `profile.rankValue` ("10+ years in production"/"10+ lat na produkcji"), `profile.arcana` ("The Engineer"/"Inżynier").
- `skills.mastered` ("Mastered"/"Opanowane"), existing `skills.learning`.
- `contact.cardTitle` ("Calling card"/"Wizytówka").
- Remove: `hero.display`, `hero.filmCaption`, `hero.pauseFilm`, `hero.playFilm`, `about.pictureAlt`, `footer.picturesTitle`, `nav.*`.

- [ ] Edit the three files; run `npm run i18n:build`; expect "Wrote …/en.json" and "Wrote …/pl.json"; grep both outputs for an empty string `""` → none.

### Task 2: Foundations — tokens, layout, cleanup

**Files:**
- Rewrite: `src/styles/global.css` (reset, tokens `--p5-red`, `--p5-black`, `--p5-white`, `--font-display: 'Anton'`, `--font-text: 'Archivo'`, fluid steps, `.sr-only`, focus style = 4px white outline + black offset ring, utilities `.halftone` and `.slab` (clip-path polygon black block)).
- Modify: `src/layouts/Layout.astro` — fonts link `family=Anton&family=Archivo:wght@400;600;800`, drop theme logic, keep inline `root.classList.add('js')`, drop reveal observer.
- Delete: `Header.astro`, `Hero.astro`, `Footer.astro`, `ThemeToggle.astro`, `About.astro`, `Skills.astro`, `Projects.astro`, `Contact.astro`, `public/images/` (video, poster, photo, credits.json).
- Modify: `src/pages/index.astro`, `src/pages/pl/index.astro` → render `<Menu lang/>` then `<main>` with the four panels (stub until Tasks 4–5).

- [ ] `npm run build` passes with no missing-import errors.

### Task 3: `RansomText.astro`

**Files:** Create `src/components/RansomText.astro`.

**Interfaces — Produces:** `<RansomText text: string, as?: 'span'|'h1'|'h2', seed?: number, size?: 'xl'|'l'|'m' />` renders each letter as `<span class="ransom__char" aria-hidden="true">` with a seeded (mulberry32) choice of tile (black-on-white, white-on-black, white-on-red), rotation −8°…8°, scale 0.9–1.15, plus a single visually-hidden copy of `text` for assistive tech. Spaces become gaps. Same input → same output on every build.

- [ ] Render `KRYSTIAN HANEK` twice with the same seed in a scratch page; both builds' HTML identical (`npm run build` twice, `diff` the dist HTML) → no diff.

### Task 4: `Menu.astro` (landing screen)

**Files:** Create `src/components/Menu.astro`.

**Interfaces — Consumes:** `RansomText`. **Produces:** `<header class="menu" id="menu">` containing the page `h1` (ransom name + "Backend engineer" line), `<nav aria-label={t.menu.label}>` with `<ol class="menu__list">` of `<a href="#profile" data-menu-item>`… and CV `<a href="/Krystian_Hanek_resume.pdf" download data-menu-item>`; HUD `<p data-hud data-lang>` with `<time>`; lang switch link (to `/pl` or `/`, keeping the hash via script).

- Layout: red field + `.halftone` + two SVG slashes; name bottom-left; list right of centre, each item its own angle (−6°…−14°) and size via `--tilt`, `--size` inline vars; focused/hovered item gets `.slab` black backing + red offset echo and `scale(1.08)`.
- HUD format: `MM/DD` + weekday short + phase from Poznań hour (`Europe/Warsaw`): 5–9 morning, 9–13 daytime, 13–17 afternoon, 17–22 evening, else night. Updates every 30s. Fallback text before JS: weekday-less "Poznań".

- [ ] Build; open `/` at 1440 and 390 with Playwright; screenshot; every menu word fully visible, no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`).

### Task 5: Panels

**Files:** Create `src/components/Panel.astro` (wrapper), `ProfilePanel.astro`, `SkillsPanel.astro`, `ProjectsPanel.astro`, `ContactPanel.astro`.

**Interfaces — Produces:** `<Panel id: string, title: string, lang: string, tone?: 'red'|'black'|'white'>` → `<section class="panel panel--{tone}" id={id} data-panel aria-labelledby="{id}-title">` with ransom `h2#{id}-title` (tabindex -1), back link `<a href="#" data-back>{t.menu.back}</a>`, and `<slot/>` inside a scrollable `.panel__body`.

- Profile (tone white): confidant card — arcana name, rank label/value, `about.content` + `content2` in jagged dialogue box, `about.facts` list.
- Skills (tone black): six `skills.poster` slabs; nine `skills.categories` as rows, each item tagged `skills.mastered` or `skills.learning` from `status`.
- Projects (tone red): six projects in fixed order `dmw, saas, kandua, worldexpo, questpass, less`. Each is `<article>` with a `<button aria-expanded data-project-tab>` row; detail (summary, description, highlights, technologies, visit link if `url`) follows. ≥900px: rows left, active detail right (only one shown with JS; first active). <900px and no-JS: all details visible under their rows.
- Contact (tone black with red card): `contact.cardTitle`, intro, mailto (subject from `contact.mailSubject`), tel, location, Poznań clock (port the existing `renderClock` logic), PDF download.

- [ ] Build; with JS disabled in Playwright, `/` shows all four panels and every project detail text.

### Task 6: Router and motion

**Files:** Create `src/scripts/menu-router.ts`; import it from `Layout.astro`.

**Interfaces — Produces:** `initMenuRouter(root: HTMLElement): void`. Sets `html.app`; shows `#menu` when hash is empty/unknown, else the matching `[data-panel]`; listens to `hashchange`. On open: wipe overlay (`.wipe`, red+black skewed polygons, 420ms) then focus `h2`; on back: `history.back()` if previous entry was the menu, else `location.hash = ''`. Keys on menu: ArrowUp/ArrowDown cycle `[data-menu-item]` focus (wraps), Enter follows link; in a panel: Escape → back. Reduced motion: skip wipe. Lang link: on click appends current hash.

- Motion: menu entrance (items slam in from right, 60ms stagger), idle item sway ±1° (paused on focus), panel content rise in, project tab switch slide. Transform/opacity only.

- [ ] Playwright: load `/#projects` → `#projects` visible, `#menu` hidden; press Escape → menu visible, hash empty; ArrowDown ×5 wraps focus to first item; `history.back()`/`forward()` follows panels.

### Task 7: Print + QA gate

**Files:** Rewrite `src/styles/print.css` — show `#menu` h1 as plain heading, every `[data-panel]` as block, hide nav list, HUD, back links, decorations, ransom tiles (print hidden text copy instead), project details expanded.

- [ ] `npm run build` → no warnings.
- [ ] `node .claude/skills/design-taste-frontend/scripts/lint.mjs src` → review; P5 exceptions documented.
- [ ] `npm run preview` + `inspect.mjs http://localhost:4321/ --allow <rules>` → 0 FAIL; list allowed rules in report.
- [ ] Playwright Review Focus checks 1–5 (print via `browser_emulate_media` print + screenshot).
- [ ] Read screenshots at 1440/768/390 for EN and PL; fix overflow of long PL words (e.g. "Umiejętności").
