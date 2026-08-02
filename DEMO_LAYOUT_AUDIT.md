# Demo Layout Audit

Scene-data audit of the game's highest-traffic/highest-risk scenes, run
against the engine's own live validator
(`window.__HB_DEBUG__.validateCurrentLayout()`) and the Playwright layout
regression suite (`tests/layout/`, see `DEVELOPMENT.md`), not fresh manual
judgment calls. The goal was to fix the *data* — zone slots, `characterId`,
`scale`/offset/z-index, dead `bubbleLayout` rects — not to add new
viewport-specific exceptions to the engine.

## Scope

The task named a specific priority set rather than "every scene in the
game" (23 scenes total, including the main menu). This audit covers exactly
that named set — 13 scenes:

S1_LIVING_ROOM_INTRO, S2_ICE_RAID_WINDOW, S5_SOFIA_INTEL,
S7A_CARTEL_CONTACT, S7B_CARTEL_TARGETING, S7D_AFTERMATH_PANIC, S8_PRE_FINAL,
S8B_HANK_DISGUISE_BRIEFING, S9_FINAL_WAREHOUSE_SHOWDOWN, and all four
endings (E_HAPPY, E_SAD, E_CHAOTIC, E_IRONIC_MEDIA).

Scenes not in this list (S3A/S3B, S4A1/S4A2/S4B/S4C, S6, S7C) were not
audited in this pass. S7C in particular follows the same
`'ANDREAS "THE BUTCHER" MENDOZA'` speaker pattern fixed here in S7A/S9 and
is a reasonable next candidate — flagged as a follow-up, not fixed, since it
wasn't in the named scope and wasn't independently re-verified here.

## Method

For every scene: every entry in the scene's top-level `dialogue` array, plus
every reachable `itemUses`/hotspot dynamic dialogue chain (badge bluffs,
burner phone, passport confirmation, USB reveal, window/TV/lamp toggles),
was shown via the debug API (`showDialogue()`/`jumpToScene()` —
`DEVELOPMENT.md`'s "Debug / Testing API" section) at two viewports —
**Desktop (1920x1080)** and **Phone landscape (844x390)**, the most
constrained of the seven viewports the layout suite already covers — with a
screenshot and `validateCurrentLayout()` snapshot captured for each. The 7
scenes already tracked by `tests/layout/scenes.js` (S1, S2, S5, S7B, S8B,
S9, E_CHAOTIC) were additionally run through the full Playwright suite
across all 7 target viewports for a second, independent check.

"P0" here means a violation type the engine's own validator treats as an
`error` (`dialogue-outside-frame`, `text-overflow`, `content-overflow`,
`continue-button-hidden-or-offscreen`, `choice-outside-safe-area`,
`missing-asset`, `duplicate-character-id`) — the same set `tests/layout/`
fails the suite on.

## Findings table

| Scene | Characters verified | Dialogue verified | Desktop | Phone landscape | Changes made | Remaining issue |
|---|---|---|---|---|---|---|
| **S1_LIVING_ROOM_INTRO** — "Another Normal Night" | hank (left), jonah (right), mom (cameo, right-2). All exact-name matches, no ambiguity. | 4 top-level entries + 6 hotspot dialogues (TV remote, TV, window x2, lamp x2). | PASS | PASS | Removed 7 authored `bubbleLayout` rects (ordinary two-person banter + one short cameo — no cinematic need; default zone-slot tail lands directly on the speaking character, verified visually before/after). Corrected Mom's dialogue `position` from `'right'` to `'right-2'` to match where `onShow()` actually spawns her. | None. |
| **S2_ICE_RAID_WINDOW** — "The Raid" | hank, jonah, ice_agent, mr_rivera, mrs_rivera, mom — all zone-slot, all unique names. | All 8 top-level entries, including the 4-character mid-scene swap sequence. | PASS | PASS | Removed a dead `bubbleLayout` on the end-of-scene CHOICE entry (narration/choice mode never applies `bubbleLayout` — confirmed dead in `layoutDialogue()`'s own precedence order, so this had zero visual effect either way). | A `duplicate-character-id: "ice_agent"` violation appears **only** when dialogue is advanced far faster than any real player (or the typewriter) could — the rapid-fire audit script raced past an `onShow()`-scheduled `addCharacter()`'s async image-load before the matching `removeCharacter()` had a chance to apply. Re-tested with a 2.8s pause after every line (well past `addCharacter`'s own 2.5s image-load safety timeout) and it never reproduces. Documented as a test-harness artifact, not a real gameplay bug — no fix applied. |
| **S5_SOFIA_INTEL** — "Sofia's Intel" | hank (left), jonah (left-2), sofia (right) — all zone-slot. | All 13 top-level entries. | PASS | PASS | None needed — already a clean reference example of the zone-slot pattern. | None. |
| **S7A_CARTEL_CONTACT** — "Business Opportunity" | hank (left), jonah (left-2), lupita (right-2), cartel_boss "MENDOZA" (right) — all four zone slots in use, all zone-slot. | 8 top-level entries + the fake-FBI-badge item-use chain (3 nested dialogues). | PASS | Was FAIL (`content-overflow` on Mendoza's opening line and the badge-bluff reply) → PASS | Shortened every Mendoza dialogue `speaker` from `'ANDREAS "THE BUTCHER" MENDOZA'` to `'MENDOZA'` and added `characterId: 'cartel_boss'` to each (4 entries). The full name, used as a literal speaker-label header, wraps to 3 lines in the compact-landscape dialogue box, leaving almost no room for the line itself. `characterId` keeps sprite-highlight/speaker resolution correct since `character.name` is still the full dramatic name. | Recorded-but-not-fixed follow-up: S7C_VENEZ_BACKROOM_ORTEGA uses the same full Mendoza name in narrative flavor text (not as a speaker label there, so lower urgency) and wasn't in this audit's named scope. |
| **S7B_CARTEL_TARGETING** — "Snitches with Sneakers" | hank (left), jonah (left-2), cartel_surveillance (right, spawned in `onEnter`) — all zone-slot. | 5 top-level entries + the burner-phone item-use chain (3 nested dialogues). | PASS | PASS | Fixed Jonah's burner-phone reply, authored with `position: 'right'` while Jonah's actual slot is `left-2` — the bubble rendered above the surveillance car on the opposite side of the screen from Jonah's sprite. Replaced an `onEnter()` `.then()` callback that manually overrode `cartel_surveillance`'s `style.maxWidth`/`maxHeight` in computed pixels with `scale: 1.257` on the character definition — verified pixel-equivalent rendered size (712.7x475.1 vs the old hack's 712.8x475.2) through the engine's own reference-space `scale` mechanism instead of ad-hoc DOM math. | None. |
| **S7D_AFTERMATH_PANIC** — "No Good Options" | hank (left), jonah (right) — zone-slot. | All 5 top-level entries + the end-of-scene CHOICE. | PASS | PASS | None needed. | None. |
| **S8_PRE_FINAL** — "Everyone Wants a Piece" | lupita (right), elgato (right-2) — zone-slot. | All 7 top-level entries. | PASS | PASS | None needed. | None. |
| **S8B_HANK_DISGUISE_BRIEFING** — "The Undercover Idiot" | hank_disguise "HANK" (left), msgray "MS. GRAY" (right) — zone-slot. | All 10 top-level entries + the passport item-use chain (3 nested dialogues). | PASS | PASS | None needed. | None. |
| **S9_FINAL_WAREHOUSE_SHOWDOWN** — "Diplomacy, but Make It Stupid" | msgray (left), elgato (right), cartel_boss "MENDOZA" (right-2) — zone-slot. Hank speaks from `itemUses` without a scene-declared sprite (intentional — Ms. Gray already occupies `left`; the line still renders correctly with no speaker sprite highlighted). | 7 top-level entries + both USB item-use chains (`neighbors_usb`, `cartel_usb`, 2-3 nested dialogues each). | PASS | 1 case still fails: `narration` on small-landscape-740x360 (`dialogue-outside-frame`) | Shortened Mendoza's dialogue `speaker` to `'MENDOZA'` + `characterId: 'cartel_boss'` (4 entries) — fixed the `content-overflow` this task's audit originally set out to find on his "I admire the audacity" / "Smart boy — choose" lines. | **P0, engine-level, not scene-data-fixable in this pass:** `showDialogue()`'s settle callback (index.js, the double-`requestAnimationFrame` block) calls `_clampDialogueToViewport()` *before* `dialoguePager.reflow()` finishes growing a narrative-mode box toward its CSS max-height — already root-caused and recorded in `DEVELOPMENT.md`'s "Known layout findings." No character position, zone, or authored rect in S9's scene data causes or fixes this; it reproduces on any narration whose paginated content needs that late growth. Left unfixed per this task's scope (scene data, not engine ordering) and flagged here with severity so it isn't silently dropped. |
| **E_HAPPY** — "We Saved Who We Could" | hank (left), jonah (right) — zone-slot. | All 4 top-level entries. | PASS | PASS | None needed. | None. |
| **E_SAD** — "People Become Statistics" | hank (left) only — zone-slot. | All 3 top-level entries. | PASS | PASS | None needed. | None. |
| **E_CHAOTIC** — "Multilateral Dumbassery" | jonah (left), lupita (right) — zone-slot. | All 10 top-level entries + both CHOICE branches (2 nested dialogues each). | PASS | PASS | None needed. | None. |
| **E_IRONIC_MEDIA** — "Everyone Has a Narrative" | hank (left), jonah (right) — zone-slot. | All 4 top-level entries. | PASS | PASS | None needed. | None. |

## Rule-by-rule verification

- **Prefer default zone slots for ordinary two-person conversations.** Only
  S1 violated this (see above, fixed). Every other audited scene was
  already zone-slot-only.
- **Keep `bubbleLayout` only when cinematic composition genuinely requires
  it.** Zero `bubbleLayout` entries remain across all 13 audited scenes
  after this pass (S1's 7 removed, S2's 1 dead one removed). None of the
  removed rects were load-bearing for composition — verified by screenshot
  comparison before/after at both viewports.
- **Add `characterId` where display-name matching is ambiguous.** Audited
  every dialogue speaker against its scene's character list for exact-name
  collisions or near-miss labels; found none pre-existing (every character
  in these 13 scenes has a unique display name at any given moment on
  screen). Added `characterId: 'cartel_boss'` in S7A/S9 as a *consequence*
  of shortening Mendoza's speaker label away from his `character.name` —
  without it, speaker/sprite-highlight resolution (exact-name match) would
  have silently broken.
- **Correct character `slot`, `scale`, offsets, z-index, and head anchors.**
  Fixed Mom's `position` in S1 and Jonah's `position` in S7B (dialogue-entry
  zone fields, not the character's own `slot`, which was always correct in
  both cases — the mismatch was between the *character's* actual slot and
  what a specific dialogue line's `position` claimed). Replaced the one
  ad-hoc runtime resize (S7B `cartel_surveillance`) with an explicit
  `scale`. No scene in this audit had an incorrect `offsetX`/`offsetY`,
  `zIndex`, or head anchor — grepped the whole file and confirmed the only
  scene-authored `scale` field anywhere in the game is the one this audit
  just added.
- **Remove obsolete scene-specific CSS/JS hacks only when tests prove
  unnecessary.** Removed exactly one (S7B's `maxWidth`/`maxHeight` `.then()`
  callback), after measuring pixel-equivalent output with the schema's own
  `scale` field first. No CSS was touched — none of the 13 scenes had
  scene-specific CSS.
- **No scene depends on an unexplained delayed re-anchor.** The engine's
  180ms delayed re-anchor (`_dialogueReanchorTimer`) only fires for
  `dialogueEntry.layoutMode === 'character'`. Grepped the entire codebase:
  no scene — audited or not — ever sets `layoutMode: 'character'`. This
  mechanism is currently unused game-wide.
- **No character is silently moved at runtime.** Grepped for direct
  `style.left`/`style.top`/`style.maxWidth`/`style.maxHeight` writes to any
  `char-*` element outside `positioningSystem`'s own
  `calculateCharacterPosition`/`applyPosition` pipeline. Found and removed
  the one instance (S7B, above). The only other direct DOM touch is S2
  clearing a departing character's `dataset.zone` before removal so the
  next character isn't redirected to a stale zone — that's a removal-timing
  guard, not a position change.
- **Do not hardcode screen pixels; use 1920x1080 reference-space
  metadata.** All positions in the audited scenes are `slot`/`position`
  strings or (now, after S7B) a `scale` multiplier — the only pixel-space
  values that existed (S1/S2's removed `bubbleLayout` rects and S7B's
  removed `maxWidth`/`maxHeight` `.then()`) are gone.
- **No one-off viewport checks inside individual scenes.** None were added;
  fixes are all viewport-independent scene-data corrections (a shorter
  speaker string, a corrected zone field, a `scale` number), not `if
  (innerWidth < X)` branches.

## Commands to reproduce

```
npm install
npx playwright install chromium
npm run test:layout          # covers S1, S2, S5, S7B, S8B, S9, E_CHAOTIC across all 7 viewports
```

S7A, S7D, S8, E_HAPPY, E_SAD, and E_IRONIC_MEDIA aren't in
`tests/layout/scenes.js` yet (that suite's own scope, set in the prior
layout-harness task); this audit's evidence for those six came from the
same debug API driven manually via Playwright, not from an addition to that
suite — extending `tests/layout/scenes.js` to the full 13-scene audit list
is a reasonable follow-up but out of scope for this pass.
