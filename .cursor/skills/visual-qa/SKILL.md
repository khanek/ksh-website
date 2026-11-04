---
name: visual-qa
description: >-
  Visually and functionally QA the Hanek Software portfolio with Playwright MCP
  or Cursor Browser: screenshots, locales, theme, responsive widths, a11y
  basics. Use after UI/CSS redesigns, before shipping visual changes, or when
  the user asks to verify the site looks right.
---

# Visual QA

Run after meaningful UI changes. Prefer Playwright MCP when available; otherwise Cursor Browser.

## Preconditions

- Dev server: `npm run dev` (default `http://localhost:4321`), or use production URLs.
- Confirm Playwright MCP tools are available (`browser_navigate`, snapshot/screenshot tools).

## Checklist

Copy and track:

```
Visual QA:
- [ ] EN home desktop (1280+)
- [ ] EN home mobile (~390)
- [ ] PL home desktop (`/pl`)
- [ ] Light and dark theme
- [ ] Hero: brand/name dominates; CTA visible; no clutter
- [ ] Nav anchors / contact CTA work
- [ ] Theme toggle works without layout jump
- [ ] Focus rings visible on keyboard Tab
- [ ] No obvious contrast failures on text/accent
- [ ] Print view not broken if print styles were touched
```

## Playwright workflow

1. Navigate to EN home (local or `https://hanek-software.com/`).
2. Resize to desktop width; take accessibility snapshot + screenshot.
3. Resize to ~390px width; screenshot again.
4. Navigate to `/pl` (or `http://localhost:4321/pl/`); repeat key shots.
5. Toggle theme (click theme control); screenshot light and dark.
6. Tab through header + hero CTA; note focus visibility.
7. Report issues as concrete CSS/component fixes, then re-check only what changed.

## What “good” looks like

- First viewport reads as one composition.
- Spacing and type hierarchy feel deliberate at both breakpoints.
- Accent color is used sparingly; not a purple-gradient cliché unless explicitly requested.
- Both locales render without truncated/overflowing copy.

## Output format

Summarize briefly:

1. Passes
2. Failures (file + what to change)
3. Screenshots/snapshots taken (widths + locale + theme)
