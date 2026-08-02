# Demo Validation Report

Generated: 2026-08-02T03:04:37.011Z
Scenes scanned: 22
Duration: 2154ms

## Totals

| Severity | Count |
|---|---|
| Error | 0 |
| Warning | 9 |
| Info | 2 |

**Result: PASS — zero errors.**

## Findings by scene

### (global) — 0 error, 0 warning, 1 info

- [INFO] `assets/sfx` SFX are synthesized in-browser via SFXGenerator (Web Audio API) — there are no SFX file assets to validate.
  - Fix: No action needed.

### E_IRONIC_MEDIA — 0 error, 1 warning, 0 info

- [WARNING] `assets/sprite` Character "hank": primary sprite "char_hank_thinking.png" not found; renders via fallback candidate "char_hank_thinking-left.png".
  - Fix: Add a file named "char_hank_thinking.png", or update scene data to reference "char_hank_thinking-left.png" directly and document the fallback.

### E_SAD — 0 error, 1 warning, 0 info

- [WARNING] `assets/sprite` Character "hank": primary sprite "char_hank_neutral.png" not found; renders via fallback candidate "char_hank_neutral-left.png".
  - Fix: Add a file named "char_hank_neutral.png", or update scene data to reference "char_hank_neutral-left.png" directly and document the fallback.

### S1_LIVING_ROOM_INTRO — 0 error, 2 warning, 0 info

- [WARNING] `assets/sprite` Character "hank": primary sprite "char_hank_thinking.png" not found; renders via fallback candidate "char_hank_thinking-left.png".
  - Fix: Add a file named "char_hank_thinking.png", or update scene data to reference "char_hank_thinking-left.png" directly and document the fallback.
- [WARNING] `assets/sprite` Character "jonah": primary sprite "char_jonah_excited.png" not found; renders via fallback candidate "char_jonah_excited-right.png".
  - Fix: Add a file named "char_jonah_excited.png", or update scene data to reference "char_jonah_excited-right.png" directly and document the fallback.

### S3A_FRONT_YARD_FROM_DISTANCE — 0 error, 1 warning, 0 info

- [WARNING] `assets/sprite` Character "mom": primary sprite "char_mom_worried.png" not found; renders via fallback candidate "char_mom_worried-right.png".
  - Fix: Add a file named "char_mom_worried.png", or update scene data to reference "char_mom_worried-right.png" directly and document the fallback.

### S3B_RIVERA_BACKYARD — 0 error, 2 warning, 0 info

- [WARNING] `assets/sprite` Character "hank": primary sprite "char_hank_thinking.png" not found; renders via fallback candidate "char_hank_thinking-left.png".
  - Fix: Add a file named "char_hank_thinking.png", or update scene data to reference "char_hank_thinking-left.png" directly and document the fallback.
- [WARNING] `assets/sprite` Character "sofia": primary sprite "char_sofia_upset.png" not found; renders via fallback candidate "char_sofia_upset-right.png".
  - Fix: Add a file named "char_sofia_upset.png", or update scene data to reference "char_sofia_upset-right.png" directly and document the fallback.

### S4B_SCHOOL_AFTERSHOCK — 0 error, 1 warning, 0 info

- [WARNING] `assets/sprite` Character "hank": primary sprite "char_hank_neutral.png" not found; renders via fallback candidate "char_hank_neutral-left.png".
  - Fix: Add a file named "char_hank_neutral.png", or update scene data to reference "char_hank_neutral-left.png" directly and document the fallback.

### S7A_CARTEL_CONTACT — 0 error, 1 warning, 0 info

- [WARNING] `assets/sprite` Character "hank": primary sprite "char_hank_panicked.png" not found; renders via fallback candidate "char_hank_panicked-left.png".
  - Fix: Add a file named "char_hank_panicked.png", or update scene data to reference "char_hank_panicked-left.png" directly and document the fallback.

### S9_FINAL_WAREHOUSE_SHOWDOWN — 0 error, 0 warning, 1 info

- [INFO] `dialogue` Item id "cartel_usb" is checked/removed here but never appears as a scene item or inventory.add() target anywhere.
  - Fix: Verify the item id is spelled correctly and is actually granted somewhere.

## Methodology / known limitations

- Dialogue shown dynamically from inside onClick/onEnter/next/action callbacks (not the top-level `scene.dialogue` array) is validated only insofar as `addCharacter()` calls, `gameState.flags.*`, and `inventory.*` references can be discovered via read-only `Function#toString()` source inspection. This is best-effort, not exhaustive — see acceptance criterion 1 (the validator does not enter scenes or execute callbacks).
- Flag/item reference findings are info-level because the detection is heuristic (regex over function source) and can both under- and over-report.
- Asset checks are live network probes (Image/Audio) against the paths scene data references; a slow or offline asset host will show assets as missing.
- Missing directional sprite-fallback candidates are not counted as errors when the primary sprite resolves; they are only surfaced (as a warning) when the primary sprite is itself missing and a fallback candidate is what actually renders.
- This validator never mutates SCENES, save data, or live game state.
