# Known Issues (Non-Blocking)

These do not block the stable demo release — see `DEMO_READINESS.md` for the release recommendation. Listed here so they aren't rediscovered as "new" bugs later.

## 1. Narration dialogue box can render outside the visible frame at a flaky, rotating set of narrow-viewport/scene combinations

- **Where:** always a `narration`-type entry at one of the 3 narrowest viewports (`tablet-1024x768`, `small-landscape-740x360`, `iphone-se-landscape-667x375`). Which specific scene fails is nondeterministic — observed on `S1_LIVING_ROOM_INTRO`, `S5_SOFIA_INTEL`, `S7B_CARTEL_TARGETING`, `S8B_HANK_DISGUISE_BRIEFING`, and `S9_FINAL_WAREHOUSE_SHOWDOWN` across repeated runs of the same code, 1-5 cases failing per run out of 203.
- **Previously documented root cause was incomplete.** The original hypothesis (`_clampDialogueToViewport()` running before `dialoguePager.reflow()` in `showDialogue()`'s settle callback) was investigated and the call order was corrected — `reflow()` now runs first. This is a real, defensible ordering fix and is committed, but **it does not resolve the observed flakiness**: `dialoguePager.reflow()`'s only size-affecting behavior (`_clampChoicesPanel()`) is gated behind `choicesDiv.children.length > 0`, so for pure narration entries (exactly the failing case — no choices are ever present) `reflow()` is a no-op regardless of call order. Verified empirically: 2 layout-suite runs before the reorder (5 failures, then 1) and 2 runs after (3 failures, then 3) show the same failure magnitude and the same rotating set of affected scenes, not a reduction.
- **What the failure actually looks like:** the flagged rect's height matches the viewport's `--dlg-narrative-max-h` CSS variable exactly (e.g. 240px at the `max-height: 500px` breakpoint) — the box is *not* oversized or still growing. The violation is about **position**, not size: `hbRectOutsideArea()` compares the box's rect against `positioningSystem.getBackgroundRect()`-derived safe area, and the box's measured top/left falls outside it. helpers.js's own `isDialogueSettled()` comment already documents awareness of this exact class of race: the double-`requestAnimationFrame` settle callback in `showDialogue()` "can be delayed arbitrarily under CPU load (e.g. several Playwright workers running scenes in parallel)" — consistent with the failure set changing between otherwise-identical runs.
- **Real next step (not attempted here — needs its own investigation pass):** compare live `positioningSystem.getBackgroundRect()` vs `getDialogueSafeRect()` output at the moment of a reproduced failure (e.g. via `window.__HB_DEBUG__.getLayoutSnapshot()`) to find why the measured box position falls outside the safe area on these specific narrow viewports, rather than assuming it's a simple call-ordering bug. The double-rAF settle pattern itself may need replacing with a more deterministic signal (e.g. `ResizeObserver`, or polling `getBoundingClientRect()` until two consecutive reads agree) instead of a fixed two-frame wait.
- **Why non-blocking:** Affects at most ~5 of 203 automated layout-suite cases, only at the 3 narrowest tested viewports, only on `narration`-type entries. Not reproduced in any manual real-click walkthrough at desktop or iPhone SE landscape.

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
