# Known Issues (Non-Blocking)

These do not block the stable demo release — see `DEMO_READINESS.md` for the release recommendation. Listed here so they aren't rediscovered as "new" bugs later.

## 1. Narration dialogue box can render outside the visible frame at 3 narrow-viewport/scene combinations

- **Where:** `S1_LIVING_ROOM_INTRO` narration at `tablet-1024x768`; `S7B_CARTEL_TARGETING` narration at `small-landscape-740x360` and `iphone-se-landscape-667x375`.
- **Root cause (already identified, pre-dates this pass):** `showDialogue()`'s settle callback calls `_clampDialogueToViewport()` before `dialoguePager.reflow()` finishes growing a narrative-mode box toward its CSS max-height. This is an engine-level timing/ordering issue, not a scene-data problem — no character position, zone, or authored rect fixes it, and it reproduces on any narration whose paginated content needs that late growth. Documented in `DEVELOPMENT.md`'s "Known layout findings" and `DEMO_LAYOUT_AUDIT.md`.
- **Why non-blocking:** Affects 3 of 203 automated layout-suite cases, only at the narrowest tested viewports, only on `narration`-type entries in 2 of 22 scenes. Not reproduced in any manual real-click walkthrough at desktop or iPhone SE landscape.
- **Suggested fix (future work, out of scope for this gate):** reorder `showDialogue()`'s settle callback so `_clampDialogueToViewport()` runs after `dialoguePager.reflow()` completes, not before.

## 2. Sprite-fallback naming mismatches (9 validator warnings)

- **Where:** `S1_LIVING_ROOM_INTRO` (hank, jonah), `S3A_FRONT_YARD_FROM_DISTANCE` (mom), `S3B_RIVERA_BACKYARD` (hank, sofia), `S4B_SCHOOL_AFTERSHOCK` (hank), `S7A_CARTEL_CONTACT` (hank), `E_SAD` (hank), `E_IRONIC_MEDIA` (hank).
- **Detail:** each scene references a primary sprite filename (e.g. `char_hank_thinking.png`) that isn't present, but a directional fallback candidate (`char_hank_thinking-left.png`) is present and renders correctly.
- **Why non-blocking:** the character always renders correctly via the fallback. Purely a naming-convention cleanup opportunity, not a rendering defect.

## 3. Three items are defined but never granted by the current script

- **Items:** `fake_fbi_badge`, `moms_nurse_badge`, `cartel_usb`.
- **Detail:** all three have fully-wired `itemUses` handlers in one or more scenes (e.g. `fake_fbi_badge` in `S7A_CARTEL_CONTACT` and `S7C_VENEZ_BACKROOM_ORTEGA`) and `getItemDescription()` entries, but no `inventory.add()` call anywhere in the script ever grants them to the player. Their handlers are therefore permanently unreachable with the current story content.
- **Why non-blocking:** confirmed via full branch-graph mapping that all 4 endings (`E_HAPPY`, `E_SAD`, `E_CHAOTIC`, `E_IRONIC_MEDIA`) remain reachable through the fully-tested `neighbors_usb`/`mysterious_passport` item flow. `S6` and `S9` both have explicit no-USB fallback paths (verified working) rather than soft-locking. This is a content-completeness gap, not a broken feature — per this release gate's explicit "no new story content or features" constraint, granting these items was out of scope to fix here.

## 4. Two optional branches were not independently exercised this pass

- **Branches:** the `S7C_VENEZ_BACKROOM_ORTEGA` ("Meet Ortega") detour from `S7A`'s choice screen, and the `S4C_ICE_PROCESSING_ROOM` ("follow the ICE van") detour from `S4A2`.
- **Why non-blocking:** both are optional side-detours that route back into the same S8/S9 spine already covered by the tested routes (confirmed via scene-graph mapping), not separate endings. Neither is required to reach any of the 4 endings, all of which were confirmed reachable without them.
- **Follow-up:** worth a manual pass in a future testing cycle, but outside this gate's scope of "at least one route through every major branch."
