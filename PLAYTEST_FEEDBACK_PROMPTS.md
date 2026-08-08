# Playtest Feedback — Implementation Prompt Series

Source: cousin's Android-mobile playtest, 2026-08-08. Four pieces of feedback,
mapped below to their actual root cause in the code, followed by five
self-contained prompts you can hand to Claude Code one at a time. Each prompt
is scoped to be its own commit/PR — run them in order, verify, then move to
the next. None of them have been implemented yet; this file is the plan only.

## Feedback → root cause map

| Feedback | Root cause found in codebase |
|---|---|
| "Button noises for continuing dialogue/choices are super annoying" | `index.js` `_animateDialogueEntry()` (~line 6488-6496) fires **two** synthesized SFX back-to-back (`playDialogueAdvance()` + `playDialoguePop()`) on *every* dialogue entry, and the Continue button (`dialoguePager`, ~line 4237/4248) fires a **third**, `playContinueButton()`, immediately before that pair. A single tap during a fast dialogue chain can trigger 3 stacked Web-Audio beeps. All SFX are harsh raw square/triangle oscillator blips (`SFXGenerator`, top of `index.js`) with no variation — same pitch, same envelope, every time, for a dialogue-heavy visual novel. |
| "More instructions for clickables on the first scene / basic tutorial" | Hotspots (`.hotspot` in `styles.css` ~line 493-507) are only visually revealed via `:hover`, which doesn't fire on touch devices before the tap itself — so on Android there is **no visual affordance at all** for what's clickable until you've already tapped it. There's also zero onboarding text; `S1_LIVING_ROOM_INTRO` (`index.js` ~line 6672) already has a well-built gating mechanic (must click TV, remote, lamp, and notebook before the window unlocks progression) but never tells the player that's what's happening. |
| "Needs more clickables / puzzle-like elements" | Confirmed by reading every scene's `itemUses`/`hotspots`: interactions are almost entirely "click object → one line of dialogue" or "carry flagged item to the one scene that checks for it" (`fake_fbi_badge`, `cartel_usb`, `moms_nurse_badge`). There's no scene with a multi-step puzzle (combine clues, ordered actions, a lock/code, a hidden-object beat). |
| "Where is the Venezuela levels???" | There is exactly **one** Venezuela scene: `S7C_VENEZ_BACKROOM_ORTEGA` (`index.js` ~line 8082), a dialogue-only cutscene with `hotspots: []`. It's reachable only via one buried option ("Meet Ortega — 'I heard there's a third player'") inside a late-game 4-way choice menu — easy to miss an entire playthrough. `gamescript_v2.txt` (~line 440-490) originally scoped **three** variants for this beat — Airport, Colombian River Dock, and the Venezuelan Consulate Backroom — with dedicated backgrounds (`bg_airport_cartel_landing_strip.png`, `bg_river_dock_night.png` both already sit unused in `assets/backgrounds/`) and music. Only the third variant was ever built, and it shipped as the thinnest possible version (no hotspots, no interactivity). |

---

## Prompt 1 — Fix the dialogue/choice SFX

```
In index.js, the dialogue system plays overlapping/redundant synthesized SFX:
_animateDialogueEntry() (~line 6488) calls both SFXGenerator.playDialogueAdvance()
and SFXGenerator.playDialoguePop() back-to-back on every dialogue entry, and
dialoguePager's continue handler (~line 4237 and 4248) calls
SFXGenerator.playContinueButton() immediately before that pair fires — so a
single tap during a fast dialogue chain can trigger 3 stacked Web Audio beeps.
All of SFXGenerator's tones (playButtonClick, playContinueButton,
playDialogueAdvance, playDialoguePop, playDialogueWhooshClose — top of
index.js) are also raw, identical-every-time oscillator blips, which reads as
grating over a dialogue-heavy visual novel.

Fix this without adding any external audio files (keep everything
Web-Audio-synthesized, consistent with the rest of SFXGenerator):
1. Stop stacking sounds on one user action. Pick ONE sound per logical event
   (dialogue-box-enter, continue-tap, choice-select, dialogue-close) and
   remove the redundant calls — _animateDialogueEntry() should fire at most
   one SFX, not two.
2. Soften the remaining tones: lower default gain, smooth/lengthen the decay
   envelope, and avoid raw square-wave harshness (prefer sine/triangle or a
   filtered tone) so they sit in the background rather than announcing
   themselves.
3. Add slight per-play variation (e.g. +/-3-5% random pitch jitter) to the
   most frequently triggered sound (dialogue advance/continue) so 200+ plays
   in one playthrough doesn't feel like a metronome.
4. Respect gameState.settings.sfxVolume exactly as the existing code does —
   don't change the volume control surface, just what it's scaling.
5. Do NOT touch music playback (audioManager) — this is SFX only.

Verify with ?debug=true&mute=1 first (confirm the mute flag still fully
silences everything), then unmute and manually click through
S1_LIVING_ROOM_INTRO's hotspots and a multi-page dialogue chain to confirm
only one sound per action and that it no longer feels grating. Bump the
cache-busting ?v= timestamp in index.html for both styles.css and index.js
per DEVELOPMENT.md before committing.
```

## Prompt 2 — First-scene tutorial + touch-friendly clickable affordance

```
Two related gaps found via code read:
1. Hotspots (.hotspot in styles.css ~line 493) only get a visible glow on
   CSS :hover, which never fires on a touch device before the tap that
   already commits the click — so on mobile there's no way to see what's
   interactive without randomly poking the screen.
2. S1_LIVING_ROOM_INTRO (index.js ~line 6672) already gates progression
   behind clicking all 4 hotspots (tv_remote, television, window, lamp,
   notebook — see the window hotspot's allOthersClicked check) but never
   tells the player that's the goal, or that objects are clickable at all.

Implement:
1. A touch-friendly idle affordance: unclicked hotspots in the CURRENT scene
   should show a subtle, low-opacity pulse/glow animation on a timer (not
   just on :hover) until they've been clicked once (gameState.objectsClicked
   already tracks this per-id — reuse it, don't build a parallel system).
   Keep it subtle enough not to look like a debug overlay (the existing
   body.show-hotspots dev style at styles.css ~line 527 is a useful visual
   reference for "too much" — go noticeably softer).
2. A short, skippable first-time-only tutorial beat at the start of
   S1_LIVING_ROOM_INTRO: 1-2 narration/UI lines that teach (a) tap glowing
   objects to interact, (b) tap the dialogue box to continue text, (c) some
   objects need to all be checked before the story moves on. Gate it on a
   localStorage flag (follow the existing pattern used by
   hardigan_brothers_save, e.g. hardigan_brothers_tutorial_seen) so it only
   shows once per browser/device and never re-appears on subsequent scenes
   or replays. Do not gate it behind ?debug=true — it must run for real
   players.
3. Once window_dialogue_shown fires (all 4 hotspots explored), stop showing
   the idle pulse for that scene — don't leave decorative animation running
   after its teaching purpose is served.

Verify at the Android landscape (915x412) and a portrait-ish narrow viewport
using the existing Playwright viewport matrix in tests/layout/viewports.js as
reference sizes; run npm run test:layout after, and manually confirm the
pulse is visible without hovering (use Chrome DevTools device toolbar with
touch simulation, not mouse hover, to check it actually works on touch).
Bump the ?v= cache-bust in index.html.
```

## Prompt 3 — Add real puzzle-like clickables (pilot scene)

```
Current interactions across all of SCENES in index.js are almost entirely
"click object -> one dialogue line" or "carry a flagged item to the one
scene that checks for it" (see itemUses for fake_fbi_badge, cartel_usb,
moms_nurse_badge — each is a single-scene item check, not a multi-step
puzzle). There is no scene with an actual puzzle: nothing requires
noticing a clue, combining information across hotspots, or acting in a
specific order to unlock something new.

Scope this as a PILOT in exactly ONE existing scene before touching others —
propose which scene fits best (S5_SOFIA_INTEL and S7B_CARTEL_TARGETING are
worth checking first, since they're intel/investigation beats where a puzzle
fits the narrative) and confirm with me before implementing, since this is a
content/design decision, not just engineering. Once confirmed, build ONE of:
 (a) a hidden-clue puzzle: an extra, unlabeled hotspot that only becomes
     clickable/relevant after another hotspot or notebook entry has been
     triggered (order-dependent, using gameState.objectsClicked or
     gameState.flags the way S1's window hotspot already does), or
 (b) a combine-clues puzzle: two or more notebook entries (see the
     `notebook.add()` pattern already used throughout) that only make sense
     together, with a new hotspot/dialogue branch that checks for both
     before unlocking a reward (an item, a flag, a shortcut, or new dialogue).

Reuse the existing hotspots/itemUses/gameState.flags/notebook architecture
exactly as-is — do not invent a new puzzle subsystem for one scene. Add the
new hotspot(s) to the scene's `hotspots` array and any new state to
gameState.flags following existing naming conventions (ALL_CAPS_SNAKE_CASE,
see TOOK_CARTEL_DEAL, SECRETLY_AGAINST_CARTEL for examples).

Verify with window.__HB_DEBUG__.jumpToScene() and
window.__HB_DEBUG__.validateCurrentLayout() on the target scene, run
npm run test:layout, and manually play the puzzle end-to-end. Bump the ?v=
cache-bust in index.html.
```

## Prompt 4 — Give the Venezuela content real presence

```
The only Venezuela content in the game is S7C_VENEZ_BACKROOM_ORTEGA
(index.js ~line 8082): a dialogue-only cutscene with hotspots: [], reachable
solely through one easy-to-miss option ("Meet Ortega — 'I heard there's a
third player'") buried in a 4-way late-game choice menu. gamescript_v2.txt
(~line 440-490) originally scoped this beat as THREE variants — Airport,
Colombian River Dock, and the Venezuelan Consulate Backroom — each with its
own background/music. bg_airport_cartel_landing_strip.png and
bg_river_dock_night.png already exist in assets/backgrounds/ but are unused
by any scene.

This is a scope/narrative decision, not a pure bug fix — before writing
scene data, confirm with me which of these directions to take:
 (a) minimal: keep it a single scene, but make it feel like a real location
     instead of a bare cutscene — add 2-4 hotspots to
     S7C_VENEZ_BACKROOM_ORTEGA (following the same hotspot pattern as
     S1_LIVING_ROOM_INTRO) so there's something to click/explore, and surface
     the choice that leads here more clearly (e.g. rename/expand the choice
     text so it reads as a real branch, not a throwaway option), or
 (b) fuller: build out a second Venezuela-adjacent scene (Airport or River
     Dock, using the existing unused background art) as an actual extra
     branch/level reachable from the same choice point or an earlier one,
     giving the "Venezuela arc" more than one scene's worth of playtime.

Whichever direction is chosen, follow the existing scene-object shape exactly
(id/title/background/music/characters/hotspots/itemUses/dialogue, see
S1_LIVING_ROOM_INTRO or S7A_CARTEL_CONTACT as templates), wire any new flags
through gameState.flags, and make sure the scene is reachable in a real
playthrough (test via window.__HB_DEBUG__.jumpToScene() first, then play the
actual choice path from S7 to confirm it's reachable, not just directly
loadable).

Verify with window.__HB_DEBUG__.validateCurrentLayout() on the new/changed
scene(s), run npm run test:layout, and update
tests/layout/scenes.js if a new scene should join the regression matrix.
Bump the ?v= cache-bust in index.html.
```

## Prompt 5 — Regression pass after the above

```
Run this after Prompts 1-4 have all landed (or after each one individually,
if run standalone):
1. npm run test:layout — full 7-viewport Playwright layout suite must pass.
2. window.__HB_DEBUG__.validateAllScenes() via ?debug=true — zero
   error-severity findings.
3. Manual playthrough on an Android-viewport size (915x412 landscape, plus a
   narrow portrait size) covering: S1's new tutorial + hotspot pulse, a full
   dialogue chain to confirm SFX no longer stacks/grates, the new puzzle
   scene end-to-end, and the Venezuela branch reached via the real S7 choice
   (not just jumpToScene).
4. Confirm index.html's ?v= cache-bust timestamp was updated for every
   change to index.js/styles.css (see DEVELOPMENT.md's cache-busting note).
5. Update KNOWN_ISSUES.md / DEMO_READINESS.md only if this pass surfaces a
   new non-blocking issue — otherwise leave them alone.
```
