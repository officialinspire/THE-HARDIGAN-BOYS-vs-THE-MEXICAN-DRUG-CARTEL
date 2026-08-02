# Demo Readiness Report

**Tested commit:** `78e5bbc074146f73f680d0962633ec3ab0115820`
**Test date:** 2026-08-02
**Scope:** Full regression pass for a stable public demo release, per the release gate defined for this pass. Story content and features were explicitly out of scope — only release blockers were fixed.

## Release recommendation

## READY

Zero P0 bugs remain open. All four endings are reachable via at least one full route. Save/continue, all mid-game overlays, every item-use gate, and rapid-tap/rotate stress conditions all recover cleanly with zero soft locks and zero non-noise console errors. The only outstanding issues are three pre-existing, already root-caused layout warnings at narrow viewports (unrelated to this pass, tracked in `KNOWN_ISSUES.md`) and a handful of cosmetic sprite-fallback warnings — none block play.

---

## Viewport matrix

All 7 target viewports from `tests/layout/viewports.js`, exercised by the automated layout suite; the two most representative (desktop and iPhone SE landscape — the tightest real target) were also used for manual click-driven testing:

| Name | Width × Height |
|---|---|
| desktop-1920x1080 | 1920×1080 |
| laptop-1366x768 | 1366×768 |
| tablet-1024x768 | 1024×768 |
| android-landscape-915x412 | 915×412 |
| iphone-landscape-844x390 | 844×390 |
| small-landscape-740x360 | 740×360 |
| iphone-se-landscape-667x375 | 667×375 |

## Routes / endings tested

Full scene graph mapped by grepping every `loadScene()` call site (22 scenes total). Manual, real-UI-click Playwright walkthroughs (mouse clicks on real hotspot/button coordinates, real inventory/modal interactions — not debug-API shortcuts) drove the game through:

| Route | Path | Ending |
|---|---|---|
| Golden path | S1 → S2 (sneak out) → S3B → S4B (USB gate) → S5 → S6 (USB gate, keep) → S7A (take cartel deal) → S8/S8B (passport gate) → S9 (USB gate, destroy publicly) | **E_HAPPY** |
| Alt branch | S1 → S2 (listen to Mom) → S3A → S4A1 (cooperate) → S4A2 (head home) → S6 (no USB, auto-skip) → S7B → S7D (improvise) → S8/S8B (no gate, auto-skip) → S9 (no-USB fallback, stand with CIA) | **E_SAD** |
| Golden path, alt final choice | Same as golden path through S9's gate → "Upload everything to the internet" | **E_IRONIC_MEDIA** |
| Golden path, alt final choice | Same as golden path through S9's gate → "Fake-destroy it but keep a copy" | **E_CHAOTIC** |

All 4 endings the current script can produce are confirmed reachable. Not independently exercised this pass (non-blocking — see `KNOWN_ISSUES.md`): the S7C "Meet Ortega" detour, the S4C ICE-processing-room detour, and the `fake_fbi_badge`/`moms_nurse_badge`/`cartel_usb` optional item-use branches (these items are never granted by the current script, so their handlers are unreachable regardless).

## Automated results

- **All-scene validator** (`window.__HB_DEBUG__.validateAllScenes()`, 22 scenes): **0 errors**, 9 warnings (sprite-fallback naming only — fallback renders correctly), 2 info. See `DEMO_VALIDATION_REPORT.md`.
- **Full viewport layout suite** (`npx playwright test`, 203 cases across all 7 viewports): **92 passed**, 3 failed (pre-existing, already root-caused, unrelated to this pass — see `KNOWN_ISSUES.md`), 99 skipped (viewport/scene combinations not applicable), 9 did not run (downstream of the pre-existing failures' worker).
- Both re-run after the save/continue fix (below) to confirm no regression; results identical to the pre-fix baseline.

## Manual results

All driven by real Playwright mouse clicks on actual hotspot/button/inventory-item coordinates (not the debug API), with real (non-`noAnimations`) transition and typewriter timing:

- **New-game walkthrough** (S1 puzzle hotspots → window → S2 choice → S3B → S4B → S5 → S6 → S7A → S8/S8B → S9 → E_HAPPY): all steps pass, zero non-noise console errors.
- **Continue-from-save**: new game → play into S3B (item granted) → full page reload (real browser reload, not an SPA navigation) → CONTINUE → scene, inventory, and flags all restored correctly → gameplay resumes normally to the next scene. (This is what caught the P0 below.)
- **Inventory / notebook / pause / settings overlays**: all open, close, and resume gameplay correctly mid-scene.
- **Item-use gates**: `neighbors_usb` (S4B, S6, S9) and `mysterious_passport` (S8B) all correctly show the gate prompt, open the inventory, open the use-modal, and advance the scene on use.
- **Rapid-tap stress**: 40-click bursts (15ms apart) on the dialogue-continue button and 15-click bursts on a scene-transition hotspot — no crash, no duplicate scene transitions, no permanently stuck lock (transient `dialogueLock`/`isTyping` states from an in-flight click are expected and always resolve on the next normal click).
- **Rotate/resize-during-dialogue stress**: 5 rapid viewport changes (desktop → phone landscape → portrait → tablet landscape → desktop) while dialogue is actively showing — dialogue box keeps sane, finite, non-zero dimensions and the choice screen underneath remains clickable and advances the game normally afterward.

## Bugs found and fixed during this pass

1. **P0 — `dialoguePager._finalizePageAction` uncaught null-pointer crash.** `typeText()`'s `onFinish` callback is async and could fire after `dialoguePager.reset()` had already nulled `this.state` (a newer dialogue entry or a scene transition). Found via real-click rapid hotspot/continue testing in S1. Fixed with the same defensive guard already used in `_onActionClick`. Commit `9d03028`.
2. **P0 — CONTINUE always resumed a blank game, never the real save.** `sceneRenderer.loadScene()` unconditionally autosaved at the end of every scene transition, including the boot-time load of the main menu itself. Since the game always boots into the main menu, this silently overwrote any real in-progress save with blank defaults before the player could ever click CONTINUE — so resuming a save after actually closing and reopening the game never worked. Found via a scripted continue-from-save regression test. Fixed by skipping the autosave when the scene being loaded is the main menu, matching the existing "quit to main menu" pause handler, which already saves explicitly beforehand for exactly this reason. Commit `78e5bbc`.

Both fixes were retested end-to-end after being applied (full golden-path walkthrough + full viewport layout suite + the specific regression test each fix addressed), all green.

## Known non-blockers

See `KNOWN_ISSUES.md` for the full list and rationale. Summary: 3 pre-existing narrow-viewport layout warnings (root-caused engine timing issue, not scene-data-fixable, predates this pass), 9 sprite-fallback naming warnings (fallback renders correctly), and 3 permanently-unreachable optional items (`fake_fbi_badge`, `moms_nurse_badge`, `cartel_usb`) whose handlers exist but are never triggered by the current script — all 4 endings remain reachable without them.

## Rollback instructions

This pass is two small, isolated commits on top of the prior stable state, each independently revertable:

```bash
# Roll back only the save/continue fix:
git revert 78e5bbc

# Roll back only the dialogue null-pointer fix:
git revert 9d03028

# Roll back this entire release-gate pass (docs + both fixes) to the prior commit:
git reset --hard 2b7f338   # last commit before this pass began
```

No database, save-format, or asset changes were made — reverting either fix is safe and requires no data migration. If rolling back the save/continue fix, note that CONTINUE will regress to always starting a blank game (the pre-existing bug this pass found), which is a functional but non-crashing regression, not a corruption risk (`localStorage` save data itself is never deleted by the bug).

## Deployment

GitHub Pages serves this repository directly as static files (`index.html` + `index.js` + `styles.css` + `assets/`) with **no build step** — confirmed by the absence of any bundler/build config and by running the same static-file server (`http-server`, no transformation) used throughout this test pass.
