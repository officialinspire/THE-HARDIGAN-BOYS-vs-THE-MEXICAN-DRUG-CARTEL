# The Hardigan Boys vs. The Mexican Drug Cartel

A branching, point-and-click narrative game about two suburban brothers who get pulled into an ICE raid, a cartel, and a CIA handler over the course of one very bad week. Built as a single-page, zero-dependency HTML5/CSS/JavaScript app — no framework, no build step.

**Status:** stable public demo. See `DEMO_READINESS.md` for the current release recommendation and test evidence, and `KNOWN_ISSUES.md` for non-blocking known issues.

## Playing the game

Open `index.html` directly in a browser, or serve the repository root as static files (see below). There is no build step — GitHub Pages serves this repository directly.

## Story

Four endings are reachable depending on the choices you make: who you help, what you do with the USB drive the Riveras give you, and who you ultimately hand it to (or don't) in the final warehouse confrontation.

## Tech stack

- **Engine:** vanilla HTML5 / CSS / JavaScript — zero frameworks, zero build tools.
- **Architecture:** single-page app. All game logic (scene data, dialogue engine, save system, character/layout system, debug tooling) lives in `index.js`; all styling (including responsive breakpoints) lives in `styles.css`; `index.html` is just the DOM shell.
- **Hosting:** GitHub Pages, served as plain static files.

## Repository layout

```
index.html              Page shell: DOM structure, layers, overlays, dev hub
index.js                Game engine + all scene data
styles.css               All styling + responsive breakpoints
assets/                  Backgrounds, character sprites, items, UI images
audio/                   Music tracks
tests/layout/            Playwright viewport/layout regression suite
scripts/                 Python asset-maintenance utilities (sprite transparency)
```

## Local development

Requires Node.js (for the dev tooling only — the game itself needs nothing but a browser).

```bash
npm install
npm run serve          # static server at http://127.0.0.1:4173
```

### Running the layout test suite

```bash
npm run test:layout
```

Runs the Playwright viewport/layout regression suite across the target viewport matrix (see `tests/layout/viewports.js`). See `DEVELOPMENT.md` for the full debug/testing API (`window.__HB_DEBUG__`), URL flags for deterministic testing, and how to update the suite's baseline artifacts.

### Debug mode

Load the game with `?debug=true` to attach `window.__HB_DEBUG__`, a deterministic API for scene inspection, dialogue testing, and the built-in Dev Hub (including an all-scene static validator). Fully documented in `DEVELOPMENT.md`.

## Further reading

- `DEVELOPMENT.md` — debug API reference, URL flags, layout test suite usage, known engine-level layout findings.
- `HARDIGAN-BOYS-CODEBASE-WALKTHROUGH.md` — full file-by-file codebase walkthrough.
- `DEMO_LAYOUT_AUDIT.md` — scene-by-scene layout audit findings.
- `DEMO_VALIDATION_REPORT.md` — latest automated scene-validator report.
- `DEMO_READINESS.md` — release gate results and recommendation.
- `KNOWN_ISSUES.md` — non-blocking known issues.
