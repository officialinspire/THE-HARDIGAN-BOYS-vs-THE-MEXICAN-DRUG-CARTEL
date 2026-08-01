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

## Known pre-existing issues (not introduced by this change)

- Some character sprites ship as RGB without alpha (cream backgrounds),
  handled at runtime by `spriteTransparencyProcessor`.
- Two sprite files have a double `.png.png` extension; `buildSpriteCandidates`
  works around this with a fallback chain.
- `inventory.show()` uses a plain `alert()` for item descriptions.
- See `HARDIGAN-BOYS-CODEBASE-WALKTHROUGH.md` for the full engine walkthrough.
