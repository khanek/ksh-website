---
name: astro-portfolio
description: >-
  Implements and redesigns the Hanek Software Astro portfolio (hanek-software.com)
  using Astro 4, vanilla CSS tokens, Layout.astro, and EN/PL i18n. Use when
  changing components, styles, pages, translations, theme, or Netlify static
  output for this repository.
---

# Astro Portfolio (ksh-website)

Personal portfolio: Astro 4, static Netlify, English `/` + Polish `/pl`.

## Stack constraints

- Pure Astro components only (no React/Vue/Svelte)
- Vanilla CSS + custom properties in `src/styles/global.css` (no Tailwind)
- All pages use `src/layouts/Layout.astro`
- Components take `lang: string` and load `../i18n/${lang}.json`
- After i18n content edits: `npm run i18n:build` (also runs on `predev` / `prebuild`)

## File map

| Area | Path |
|------|------|
| Tokens / theme | `src/styles/global.css` |
| Print | `src/styles/print.css` |
| Sections | `src/components/*.astro` (Hero, About, Skills, Projects, Contact, Header, …) |
| Routes | `src/pages/index.astro`, `src/pages/pl/index.astro` |
| Copy | `src/i18n/en.json`, `src/i18n/pl.json` |

## Design work on this site

1. Read `.cursor/rules/design-system.mdc` and apply `frontend-design` principles.
2. Change tokens in `global.css` before restyling components.
3. Keep light/dark via `[data-theme]` and existing `ThemeToggle`.
4. Preserve print stylesheet behavior for resume/print flows.
5. Update EN and PL copy together when UI strings change.
6. Do not invent Figma handoff - design in CSS unless the user provides mocks.

## Component pattern

```astro
---
interface Props {
  lang: string;
}
const { lang } = Astro.props;
const t = await import(`../i18n/${lang}.json`);
---
```

Scoped `<style>` in the component; prefer `var(--…)` tokens over raw values.

## Verify

Use the `visual-qa` skill (Playwright MCP or Cursor Browser) against local `astro dev` or production `https://hanek-software.com/`.
