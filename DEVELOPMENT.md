# Development Notes

## Debug / Testing API (`window.__HB_DEBUG__`)

A deterministic, debug-only API for automated testing and layout inspection.
It is **only attached when the page is loaded with `?debug=true`** — with the
flag absent, `window.__HB_DEBUG__` does not exist and production behavior is
unchanged.

```
https://<host>/index.html?debug=true
```

Combine with the URL flags below for a fully deterministic boot:

```
https://<host>/index.html?debug=true&skipIntro=1&mute=1&noAnimations=1
```

### URL flags

| Flag | Effect |
|---|---|
| `debug=true` | Attaches `window.__HB_DEBUG__` (see below). |
| `skipIntro=1` | Skips the studio intro video and loads `S0_MAIN_MENU` immediately. |
| `mute=1` | Silences music and SFX from boot (via `SFXGenerator.muted` / `audioManager.muted`). |
| `noAnimations=1` | Adds a `hb-no-animations` class to `<body>` that collapses all CSS animation/transition durations to ~0, so layout can be inspected without waiting on transitions. |

None of these flags affect the game when absent from the URL.

### API methods

All methods are synchronous and return plain JSON-safe values (no DOM nodes
or functions) unless noted otherwise.

- **`listScenes()`** → `Array<{ id, title, background }>`
  Lists every scene defined in `SCENES`.

- **`jumpToScene(sceneId)`** → `{ ok, sceneId }` or `{ ok: false, error }`
  Loads the given scene via the normal `sceneRenderer.loadScene()` transition
  queue (same code path as hotspot navigation).

- **`getActiveDialogue()`** → the currently displayed dialogue entry (or
  `null`), stripped of functions (`onShow`, `next`, `choice.action`, etc.) so
  it's JSON-safe.

- **`showDialogue(entry)`** → `{ ok }` or `{ ok: false, error }`
  Renders an arbitrary dialogue entry object through the real
  `sceneRenderer.showDialogue()` pipeline (bubble positioning, typewriter,
  choices, etc.) — useful for testing layout with synthetic/edge-case content
  without needing to reach it through gameplay.

- **`finishTyping()`** → `{ ok }`
  Instantly completes the in-progress typewriter effect, if any.

- **`advanceDialogue()`** → `{ ok, action }`
  If text is still typing, finishes it. Otherwise clicks the Continue button
  if one is active. If choices are pending or nothing is showing, returns
  `{ ok: false, action: 'no-op', reason }` rather than guessing a choice.

- **`getLayoutSnapshot()`** → structured layout data:
  - `viewport` — `{ width, height }`
  - `backgroundRect` — the rendered background frame in viewport coordinates
    (the "scene safe area" other rects are checked against)
  - `sceneId`, `activeDialogueEntry`
  - `dialogue.box/content/text/speaker/continueButton` — each `{ rect, ... }`,
    `text`/`content` also include `overflow` (`scrollWidth/Height` vs
    `clientWidth/Height`)
  - `dialogue.choices` — array of `{ text, rect, outsideSafeArea }`
  - `characters` — array of `{ id, zone, name, rect, visible, outsideSafeArea }`
  - `missingAssets` — `{ preloadErrors, placeholderImagesInDom }`

  Every rect includes `outsideSafeArea` (or is checked against it) so you can
  tell whether it extends beyond the rendered game frame.

- **`validateCurrentLayout()`** → `{ ok, violations, snapshot }`. Never
  throws — internal errors are caught and reported as an `internal-error`
  violation instead. Checks:
  - dialogue box rendering outside the game frame
  - dialogue text/content overflow
  - a Continue button that's hidden or offscreen while dialogue expects one
  - choice buttons outside the safe area
  - a speaking character with no visible sprite in the scene
  - duplicate character IDs in the current scene's DOM
  - missing image assets (preload failures + placeholder images currently rendered)

  Each violation is `{ type, severity, message, ...context }`.

- **`setAnimationsEnabled(boolean)`** — toggles the same `hb-no-animations`
  class used by `?noAnimations=1`.

- **`setAudioEnabled(boolean)`** — toggles the same mute state used by
  `?mute=1` (`SFXGenerator.muted` / `audioManager.muted`).

### Example

```js
window.__HB_DEBUG__.jumpToScene('S1_LIVING_ROOM_INTRO');
window.__HB_DEBUG__.finishTyping();
const report = window.__HB_DEBUG__.validateCurrentLayout();
console.log(report.ok, report.violations);
```

## Demo validation report

`window.__HB_DEBUG__.validateAllScenes()` (async) runs a full demo-readiness
check across every `SCENES` entry — scene structure, characters, dialogue,
and live asset probes — without loading or entering any scene, and without
mutating `SCENES`, save data, or game state. It's the programmatic entry
point to the same check the Developer Hub's **Validate All Scenes** button
runs (next to the existing per-scene **Run Validate Now** hotspot check,
which it does not replace).

```js
const report = await window.__HB_DEBUG__.validateAllScenes();
console.log(report.ok, report.totals, report.findings.length);
```

Returns `{ ok, generatedAt, durationMs, sceneCount, totals: {error, warning,
info}, findings, markdown }`. `ok` is `true` iff there are zero error-severity
findings — suitable for an automated test assertion. Every finding is
`{ sceneId, category, severity, message, fix }`.

In the Dev Hub, running it writes the same Markdown report into the existing
`#dev-validation-output` panel, and **Download JSON Report** saves the full
structured result (`demoValidator.lastReport`) as `demo-validation-report.json`.
See `DEMO_VALIDATION_REPORT.md` in the repo root for the initial run's output,
and that file's own "Methodology / known limitations" section for what the
validator can and can't see (e.g. dialogue shown from inside `onClick`/
`onEnter`/`next`/`onShow` callbacks is only covered via best-effort source
inspection, not execution).

## Character layout schema

Scene `characters` entries support an explicit layout schema, resolved by
`sceneRenderer.resolveCharacterLayout(char)` — the single place scene-authored
character data becomes a placed sprite. It is a pure function (no DOM access)
called by both `normalizeCharacterZones()` (the scene's initial `characters`
array) and `addCharacter()` itself, so a character added later via a
dialogue/`onEnter` callback goes through the exact same resolution as one
declared in the scene up front.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `slot` | string | — | Canonical placement zone: `left`, `left-2`, `center`, `right-2`, `right`. Takes priority over `position` if both are set. |
| `position` | string | `'center'` | Legacy alias for `slot`, still fully supported — existing scene data needs no changes. |
| `scale` | number | `1` | Uniform scale multiplier, composed into the slide-in/visible CSS transform via a `--char-scale` custom property (never overwrites the animation's `translateX`). |
| `offsetX` | number | `0` | Pixel nudge from the slot's anchor point, positive = right. Baked directly into the computed `left`/`right`, not a transform, so it never conflicts with the slide animation. |
| `offsetY` | number | `0` | Pixel nudge from the slot's anchor point, positive = down. Baked into `bottom`. |
| `zIndex` | number | Per-slot default (`DEFAULT_CHARACTER_Z_INDEX`: center 4, left/right 3, left-2/right-2 2) | Explicit stacking order, independent of DOM insertion order. |
| `headAnchorX` | number (0-1) | none (falls back to the existing zone-based heuristic) | Fraction of the sprite's own rendered width where the visible head center is — used only by character-relative bubble placement (`layoutMode: 'character'`). |
| `headAnchorY` | number (0-1) | none (falls back to assuming the image's top edge is the head) | Fraction of the sprite's own rendered height where the visible head top is. Most sprite PNGs have transparent padding above the head, so without this the bubble anchors above empty space. |

**No remapping, ever.** `slot`/`position` is authoritative. If two characters
in the same scene claim the same slot, neither is silently moved — a warning
is recorded (`sceneRenderer._lastCharacterLayoutWarnings`) and surfaced by
`window.__HB_DEBUG__.validateCurrentLayout()` as a `duplicate-slot` violation.
There is exactly one remapper (`normalizeCharacterZones` /
`resolveCharacterLayout`); `addCharacter()` no longer runs a second,
DOM-state-dependent remap on top of it.

**Speaker resolution priority** (dialogue entries, `dialogueEntry.characterId`
optional): explicit `characterId` first (exact `data-character-id` match),
then exact character id/name match, then (for character-relative bubble
placement only) zone fallback last. Used by `_resolveDialogueCharacter()`
(bubble anchor target), `_setSpeakingCharacter()` (`.is-speaking` highlight),
and `_ensureSpeakerPresent()` (auto-adds a scene character that hasn't
rendered yet).

**Sequencing**: `addCharacter()` loads the sprite asset first, then applies
the resolved position/scale/offset/zIndex/head-anchor metadata, then starts
the slide-in animation — composition never depends on how far a fetch
happened to get.

**DOM metadata kept on every sprite** (`data-*`, stable across resize):
`data-character-id`, `data-character-name`, `data-zone` / `data-slot` (same
value), `data-offset-x`, `data-offset-y`, `data-head-anchor-x` /
`data-head-anchor-y` (when authored). `recalculateAll()` (the resize/orientation
handler) reads `data-offset-x`/`data-offset-y` back on every call so a
character's slot and offsets survive repeated resize events instead of
drifting back to zero.

None of this required editing existing scene data — every field is optional
and defaults preserve prior behavior exactly.

### Validator additions

`window.__HB_DEBUG__.validateCurrentLayout()` now also reports:
- `duplicate-slot` — two characters resolved to the same slot in the current scene.
- `missing-speaker-sprite` — unchanged check, now prefers `characterId` over display name when the active dialogue entry has one.

`getLayoutSnapshot()`'s `characters[]` entries also include `slot` and a
`layout` object (`scale`, `offsetX`, `offsetY`, `zIndex`, `headAnchorX`,
`headAnchorY`) for inspection.

### Scenes that may need later data corrections

Manually verified via Playwright: S1, S2 (ICE raid), S5 (Sofia's Intel), S7B
(surveillance), S8 / S8B, S9 (final showdown), and the E_CHAOTIC ending — all
resolve to their originally-authored slots with no `duplicate-slot` or
`missing-speaker-sprite` violations, and slots/offsets are stable across
resize. No scene currently sets `slot`, `scale`, `offsetX`, `offsetY`,
`zIndex`, `headAnchorX`, or `headAnchorY` — they're all running on
compatibility defaults via the legacy `position` field, as intended (this
change did not bulk-edit scene data).

Pre-existing, unrelated to this change (surfaced as sprite-fallback warnings
during verification, not failures — `buildSpriteCandidates` already recovers
a working image): `char_sofia_hacker-right.png` (S5), `char_jonah_scared-left.png`
and `char_cartel-surveillance-right.png` (S7B), `char_msgray_threatening-left.png`
(S9) don't exist under their expected directional filename and fall through
several fallback candidates before resolving. Worth a filename cleanup pass
separately from this layout work.

No scene currently needs `headAnchorX`/`headAnchorY` tuning to pass
validation, but any speech-bubble character art with significant transparent
padding above the head is a good candidate for it — `_positionDialogueNearCharacter()`
otherwise anchors to the sprite's raw top edge.

## Known pre-existing issues (not introduced by this change)

- Some character sprites ship as RGB without alpha (cream backgrounds),
  handled at runtime by `spriteTransparencyProcessor`.
- Two sprite files have a double `.png.png` extension; `buildSpriteCandidates`
  works around this with a fallback chain.
- `inventory.show()` uses a plain `alert()` for item descriptions.
- See `HARDIGAN-BOYS-CODEBASE-WALKTHROUGH.md` for the full engine walkthrough.
