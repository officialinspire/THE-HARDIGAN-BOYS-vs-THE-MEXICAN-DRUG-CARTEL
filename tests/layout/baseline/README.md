# Layout baseline artifacts

This directory is the **one intentionally tracked** set of layout smoke-test
artifacts (screenshots + JSON layout snapshots), one pair per
`(viewport, scene, case)` combination. Everything else the suite produces
(`test-results/`) is transient and gitignored — see the repo root
`.gitignore`.

The files here are **not** used for automated pixel-diffing (the suite never
calls `toHaveScreenshot()`), because pixel-perfect comparison across
machines/fonts/GPUs is exactly the kind of fragile assertion
`tests/layout/layout.spec.js` is written to avoid. They exist purely as a
human-reviewable reference: open a `.png` to see what a scene/case/viewport
combination looked like as of the last approved update, or diff a `.json`
snapshot's `validation`/`entry` fields against a newer run.

## Regenerating

```
npm run test:layout:update
```

This runs the full suite with `HB_UPDATE_BASELINE=1`, which makes
`saveArtifacts()` (see `tests/layout/helpers.js`) write into this directory
in addition to the normal transient `test-results/layout/` output. Review
the diff (`git status` / `git diff --stat` under this directory) before
committing — a baseline update should be a deliberate, reviewed change, not
an incidental side effect of running tests.

## Naming

Files are named `<viewport>__<sceneId>__<case>.{png,json}`, e.g.:

```
laptop-1366x768__S1_LIVING_ROOM_INTRO__narration.png
laptop-1366x768__S1_LIVING_ROOM_INTRO__narration.json
```
